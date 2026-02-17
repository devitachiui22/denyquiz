/**
 * =====================================================
 * 🚀 OTAKUHUB ULTIMATE – SERVER DE PRODUÇÃO
 * =====================================================
 * 
 * Características:
 * ✅ Fallback em 3 níveis (Jikan → Anilist → Banco de dados)
 * ✅ Cache em memória + Redis (opcional)
 * ✅ Rate limiting inteligente
 * ✅ Retry com exponential backoff
 * ✅ Dados de emergência pré-carregados
 * ✅ Schema completo do PostgreSQL
 */

import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import pkg from 'pg';
const { Pool } = pkg;
import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import compression from "compression";
import helmet from "helmet";

/* ==========================
   🔧 ENV
========================== */
dotenv.config();

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const REDIS_URL = process.env.REDIS_URL;
const CACHE_DURATION = Number(process.env.CACHE_DURATION || 86400000); // 24h
const JIKAN_API_URL = process.env.JIKAN_API_URL || "https://api.jikan.moe/v4";
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000", "https://otakuhub.vercel.app"];

/* ==========================
   🌐 APP
========================== */
const app = express();

// Middlewares de segurança e performance
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(express.json());
app.use(cors({ 
  origin: CORS_ORIGIN,
  credentials: true 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: { error: "Muitas requisições. Aguarde um momento." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

/* ==========================
   📦 REDIS (CACHE DISTRIBUÍDO)
========================== */
let redis = null;
try {
  if (REDIS_URL) {
    redis = new Redis(REDIS_URL, {
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
    });
    console.log("✅ Redis conectado");
  }
} catch (e) {
  console.log("⚠️ Redis não disponível, usando memory cache");
}

/* ==========================
   ⚡ CACHE EM MEMÓRIA (FALLBACK)
========================== */
const memoryCache = new Map();

function getCache(key) {
  // Tentar Redis primeiro
  if (redis) {
    return new Promise((resolve) => {
      redis.get(key).then((value) => {
        if (value) resolve(JSON.parse(value));
        else resolve(null);
      }).catch(() => resolve(null));
    });
  }

  // Fallback para memory cache
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return cached.value;
}

async function setCache(key, value, ttl = CACHE_DURATION) {
  if (redis) {
    try {
      await redis.setex(key, ttl / 1000, JSON.stringify(value));
      return;
    } catch (e) {
      // Fallback para memory cache
    }
  }

  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  });
}

/* ==========================
   🗄️ POSTGRESQL (NEON)
========================== */
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Testar conexão com o banco
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", err.message);
  } else {
    console.log("✅ PostgreSQL conectado (Neon)");
    release();
  }
});

/* ==========================
   📚 SCHEMA DO BANCO DE DADOS
========================== */
async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log("🔧 Inicializando banco de dados...");
    
    await client.query('BEGIN');

    // Tabela de animes
    await client.query(`
      CREATE TABLE IF NOT EXISTS animes (
        id SERIAL PRIMARY KEY,
        mal_id INT UNIQUE,
        title VARCHAR(255) NOT NULL,
        title_japanese VARCHAR(255),
        image_url TEXT,
        large_image_url TEXT,
        synopsis TEXT,
        score FLOAT,
        members INT,
        genres TEXT[],
        studio VARCHAR(100),
        episodes INT,
        status VARCHAR(50),
        aired_from DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabela de personagens
    await client.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        mal_id INT UNIQUE,
        name VARCHAR(255) NOT NULL,
        name_kanji VARCHAR(255),
        anime_id INT REFERENCES animes(id) ON DELETE CASCADE,
        anime_title VARCHAR(255),
        image_url TEXT,
        description TEXT,
        role VARCHAR(50),
        favorites INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabela de frases
    await client.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        character_id INT REFERENCES characters(id) ON DELETE CASCADE,
        character_name VARCHAR(255) NOT NULL,
        anime_id INT REFERENCES animes(id) ON DELETE CASCADE,
        anime_title VARCHAR(255) NOT NULL,
        episode INT,
        context TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        avatar_url TEXT,
        total_score INT DEFAULT 0,
        games_played INT DEFAULT 0,
        correct_answers INT DEFAULT 0,
        tier VARCHAR(20) DEFAULT 'Genin',
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP DEFAULT NOW()
      );
    `);

    // Tabela de sessões de jogo
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) NOT NULL,
        game_mode VARCHAR(30) NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        correct_count INT NOT NULL,
        difficulty VARCHAR(20),
        tier_earned VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Índices para performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_animes_mal_id ON animes(mal_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_animes_title ON animes(title);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(name);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_quotes_text ON quotes(text);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_score ON game_sessions(score DESC);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);`);

    await client.query('COMMIT');
    console.log("✅ Schema do banco verificado/criado");
    
    // Pré-carregar dados de emergência
    await prepopulateEmergencyData();
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Erro ao inicializar banco:", err);
  } finally {
    client.release();
  }
}

/* ==========================
   🆘 DADOS DE EMERGÊNCIA (FALLBACK FINAL)
========================== */
const EMERGENCY_DATA = {
  animes: [
    { id: 1, mal_id: 20, title: "Naruto", image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", score: 8.3, members: 4000000 },
    { id: 2, mal_id: 21, title: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", score: 9.0, members: 5000000 },
    { id: 3, mal_id: 16498, title: "Attack on Titan", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", score: 8.8, members: 4500000 },
    { id: 4, mal_id: 1535, title: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", score: 8.6, members: 4200000 },
    { id: 5, mal_id: 5114, title: "Fullmetal Alchemist: Brotherhood", image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", score: 9.1, members: 3800000 },
    { id: 6, mal_id: 31964, title: "My Hero Academia", image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg", score: 8.0, members: 3500000 },
    { id: 7, mal_id: 38000, title: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", score: 8.6, members: 4000000 },
    { id: 8, mal_id: 11061, title: "Hunter x Hunter", image: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg", score: 9.0, members: 3700000 },
    { id: 9, mal_id: 9253, title: "Steins;Gate", image: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", score: 9.1, members: 3200000 },
    { id: 10, mal_id: 1575, title: "Code Geass", image: "https://cdn.myanimelist.net/images/anime/5/50331.jpg", score: 8.7, members: 3100000 }
  ],
  characters: [
    { id: 101, name: "Monkey D. Luffy", anime: "One Piece", image: "https://cdn.myanimelist.net/images/characters/5/310340.jpg" },
    { id: 102, name: "Naruto Uzumaki", anime: "Naruto", image: "https://cdn.myanimelist.net/images/characters/2/284125.jpg" },
    { id: 103, name: "Eren Yeager", anime: "Attack on Titan", image: "https://cdn.myanimelist.net/images/characters/2/315079.jpg" },
    { id: 104, name: "Light Yagami", anime: "Death Note", image: "https://cdn.myanimelist.net/images/characters/14/306305.jpg" },
    { id: 105, name: "Edward Elric", anime: "Fullmetal Alchemist", image: "https://cdn.myanimelist.net/images/characters/15/292086.jpg" }
  ],
  quotes: [
    { id: 201, text: "Eu vou ser o Rei dos Piratas!", character: "Monkey D. Luffy", anime: "One Piece" },
    { id: 202, text: "Esse é o meu jeito ninja!", character: "Naruto Uzumaki", anime: "Naruto" },
    { id: 203, text: "Dedique seu coração!", character: "Eren Yeager", anime: "Attack on Titan" },
    { id: 204, text: "Eu sou a justiça!", character: "Light Yagami", anime: "Death Note" },
    { id: 205, text: "A lei da troca equivalente não pode ser quebrada!", character: "Edward Elric", anime: "Fullmetal Alchemist" }
  ]
};

async function prepopulateEmergencyData() {
  const client = await pool.connect();
  try {
    // Inserir animes de emergência
    for (const anime of EMERGENCY_DATA.animes) {
      await client.query(`
        INSERT INTO animes (mal_id, title, image_url, large_image_url, score, members)
        VALUES ($1, $2, $3, $3, $4, $5)
        ON CONFLICT (mal_id) DO NOTHING
      `, [anime.mal_id, anime.title, anime.image, anime.score, anime.members]);
    }
    
    // Inserir personagens
    for (const char of EMERGENCY_DATA.characters) {
      await client.query(`
        INSERT INTO characters (name, anime_title, image_url)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [char.name, char.anime, char.image]);
    }
    
    console.log("✅ Dados de emergência pré-carregados");
  } catch (err) {
    console.error("⚠️ Erro ao pré-carregar emergência:", err);
  } finally {
    client.release();
  }
}

/* ==========================
   🔄 RETRY COM EXPONENTIAL BACKOFF
========================== */
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios({
        url,
        timeout: 8000,
        ...options,
        headers: {
          'User-Agent': 'OtakuHub/2.0',
          ...options.headers,
        }
      });
      return response.data;
    } catch (error) {
      const isLastAttempt = i === retries - 1;
      if (isLastAttempt) throw error;
      
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      console.log(`⚠️ Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/* ==========================
   🎌 SERVICES
========================== */

// JIKAN API
async function searchJikan(query) {
  const data = await fetchWithRetry(`${JIKAN_API_URL}/anime`, {
    params: { q: query, limit: 10 }
  });
  return data.data.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    title_japanese: anime.title_japanese,
    image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
    score: anime.score,
    members: anime.members,
    synopsis: anime.synopsis,
    genres: anime.genres?.map(g => g.name) || [],
    episodes: anime.episodes,
    status: anime.status
  }));
}

// ANILIST API (FALLBACK)
async function searchAnilist(query) {
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 10) {
        media(search: $search, type: ANIME) {
          id
          title {
            romaji
            english
          }
          coverImage {
            large
          }
          averageScore
          episodes
          genres
          description
        }
      }
    }
  `;

  const data = await fetchWithRetry("https://graphql.anilist.co", {
    method: 'POST',
    data: {
      query: graphqlQuery,
      variables: { search: query }
    }
  });

  return data.data.Page.media.map(anime => ({
    id: anime.id,
    title: anime.title.english || anime.title.romaji,
    image: anime.coverImage.large,
    score: anime.averageScore / 10,
    episodes: anime.episodes,
    genres: anime.genres || [],
    synopsis: anime.description
  }));
}

// BUSCAR DO BANCO DE DADOS (FALLBACK FINAL)
async function searchDatabase(query) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM animes 
      WHERE title ILIKE $1 
      OR title_japanese ILIKE $1 
      ORDER BY members DESC 
      LIMIT 10
    `, [`%${query}%`]);
    
    return result.rows.map(row => ({
      id: row.mal_id,
      title: row.title,
      title_japanese: row.title_japanese,
      image: row.large_image_url || row.image_url,
      score: row.score,
      members: row.members,
      synopsis: row.synopsis,
      genres: row.genres,
      episodes: row.episodes
    }));
  } finally {
    client.release();
  }
}

// BUSCAR PERSONAGENS
async function getCharacters(animeTitle) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM characters 
      WHERE anime_title ILIKE $1 
      ORDER BY favorites DESC 
      LIMIT 20
    `, [`%${animeTitle}%`]);
    
    if (result.rows.length > 0) return result.rows;
    
    // Fallback para dados de emergência
    return EMERGENCY_DATA.characters.filter(c => 
      c.anime.toLowerCase().includes(animeTitle.toLowerCase())
    );
  } finally {
    client.release();
  }
}

// BUSCAR FRASES
async function getQuotes(characterName) {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM quotes 
      WHERE character_name ILIKE $1 
      LIMIT 20
    `, [`%${characterName}%`]);
    
    if (result.rows.length > 0) return result.rows;
    
    // Fallback para dados de emergência
    return EMERGENCY_DATA.quotes.filter(q => 
      q.character.toLowerCase().includes(characterName.toLowerCase())
    );
  } finally {
    client.release();
  }
}

/* ==========================
   🎯 UTILITÁRIOS
========================== */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function calculateTier(percentage) {
  if (percentage >= 90) return { name: 'Kage', color: '#FFD700', emoji: '👑' };
  if (percentage >= 70) return { name: 'Jonin', color: '#C0C0C0', emoji: '⚔️' };
  if (percentage >= 40) return { name: 'Chunin', color: '#CD7F32', emoji: '🛡️' };
  return { name: 'Genin', color: '#8B4513', emoji: '🍃' };
}

function generateQuizQuestions(items, type, count = 10) {
  const selected = shuffle(items).slice(0, count);
  
  return selected.map(item => {
    let wrongOptions = [];
    
    if (type === 'anime') {
      wrongOptions = shuffle(items)
        .filter(i => i.title !== item.title)
        .slice(0, 3)
        .map(i => i.title);
      
      return {
        id: item.id,
        type: 'anime',
        question: "Qual é o nome deste anime?",
        image: item.image,
        options: shuffle([item.title, ...wrongOptions]),
        correct: item.title,
        hint: item.genres ? `Gêneros: ${item.genres.slice(0, 2).join(', ')}` : null
      };
    }
    
    if (type === 'character') {
      wrongOptions = shuffle(items)
        .filter(i => i.name !== item.name)
        .slice(0, 3)
        .map(i => i.anime);
      
      return {
        id: item.id,
        type: 'character',
        question: `De qual anime é ${item.name}?`,
        image: item.image,
        options: shuffle([item.anime, ...wrongOptions]),
        correct: item.anime,
        character_name: item.name
      };
    }
    
    if (type === 'quote') {
      wrongOptions = shuffle(items)
        .filter(i => i.character !== item.character)
        .slice(0, 3)
        .map(i => i.character);
      
      return {
        id: item.id,
        type: 'quote',
        question: `"${item.text}"`,
        options: shuffle([item.character, ...wrongOptions]),
        correct: item.character,
        anime: item.anime
      };
    }
    
    return item;
  });
}

/* ==========================
   🎯 ROTAS DA API
========================== */

// HEALTH CHECK
app.get("/", (_, res) => {
  res.json({
    status: "🟢 ONLINE",
    service: "OtakuHub Ultimate API",
    version: "2.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: DATABASE_URL ? "conectado" : "não configurado",
    cache: redis ? "redis" : "memory",
    modes: ["anime", "character", "quote", "survival"]
  });
});

// BUSCAR ANIME COM FALLBACK EM 3 NÍVEIS
app.get("/api/anime/search", async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Parâmetro ?q é obrigatório" });
  }

  const cacheKey = `anime_search_${query.toLowerCase()}`;
  
  try {
    // 1. Tentar cache
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ source: "cache", data: cached });
    }

    let result = null;
    let source = "";

    try {
      // 2. Tentar Jikan API
      console.log(`📡 Buscando "${query}" na Jikan...`);
      result = await searchJikan(query);
      source = "jikan";
    } catch (jikanError) {
      console.log("⚠️ Jikan falhou, tentando Anilist...");
      
      try {
        // 3. Fallback para Anilist
        result = await searchAnilist(query);
        source = "anilist";
      } catch (anilistError) {
        console.log("⚠️ Anilist falhou, buscando no banco...");
        
        try {
          // 4. Fallback para banco de dados
          result = await searchDatabase(query);
          source = "database";
        } catch (dbError) {
          console.log("⚠️ Banco falhou, usando dados de emergência...");
          
          // 5. Fallback final: dados de emergência
          result = EMERGENCY_DATA.animes.filter(anime =>
            anime.title.toLowerCase().includes(query.toLowerCase())
          );
          source = "emergency";
        }
      }
    }

    // Se não encontrou nada, retornar lista genérica
    if (!result || result.length === 0) {
      result = EMERGENCY_DATA.animes.slice(0, 5);
      source = "emergency_fallback";
    }

    // Salvar no cache
    await setCache(cacheKey, result, CACHE_DURATION);

    // Salvar no banco para uso futuro
    if (source !== "database" && source !== "emergency") {
      const client = await pool.connect();
      try {
        for (const anime of result) {
          await client.query(`
            INSERT INTO animes (mal_id, title, title_japanese, image_url, large_image_url, score, members, synopsis, genres)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (mal_id) DO UPDATE SET
              title = EXCLUDED.title,
              score = EXCLUDED.score,
              members = EXCLUDED.members,
              updated_at = NOW()
          `, [
            anime.id, 
            anime.title, 
            anime.title_japanese || null,
            anime.image, 
            anime.image, 
            anime.score || 0, 
            anime.members || 0,
            anime.synopsis || null,
            anime.genres || []
          ]);
        }
      } catch (dbError) {
        console.error("Erro ao salvar no banco:", dbError.message);
      } finally {
        client.release();
      }
    }

    res.json({ source, data: result });

  } catch (error) {
    console.error("❌ Erro fatal na busca:", error);
    // Fallback de emergência
    res.json({
      source: "emergency_fallback",
      data: EMERGENCY_DATA.animes.slice(0, 5)
    });
  }
});

// GERAR QUIZ
app.get("/api/quiz/:mode", async (req, res) => {
  const { mode } = req.params;
  const difficulty = req.query.difficulty || 'easy';
  const count = Math.min(Number(req.query.count) || 10, 20);

  const cacheKey = `quiz_${mode}_${difficulty}_${count}`;

  try {
    // Tentar cache primeiro
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        mode,
        difficulty,
        source: "cache",
        questions: cached,
        total: cached.length
      });
    }

    let questions = [];
    let source = "";

    // Buscar dados baseado no modo
    const client = await pool.connect();
    try {
      if (mode === 'anime') {
        const result = await client.query(`
          SELECT * FROM animes 
          ORDER BY 
            CASE WHEN $1 = 'easy' THEN members END DESC,
            CASE WHEN $1 = 'medium' THEN members END,
            CASE WHEN $1 = 'hard' THEN members END ASC
          LIMIT 50
        `, [difficulty]);
        
        questions = generateQuizQuestions(result.rows, 'anime', count);
        source = "database";
        
      } else if (mode === 'character') {
        // Se não tiver personagens no banco, usar emergência
        const result = await client.query(`SELECT * FROM characters LIMIT 50`);
        
        if (result.rows.length > 0) {
          questions = generateQuizQuestions(result.rows, 'character', count);
          source = "database";
        } else {
          questions = generateQuizQuestions(EMERGENCY_DATA.characters, 'character', count);
          source = "emergency";
        }
        
      } else if (mode === 'quote') {
        const result = await client.query(`SELECT * FROM quotes LIMIT 50`);
        
        if (result.rows.length > 0) {
          questions = generateQuizQuestions(result.rows, 'quote', count);
          source = "database";
        } else {
          questions = generateQuizQuestions(EMERGENCY_DATA.quotes, 'quote', count);
          source = "emergency";
        }
        
      } else if (mode === 'survival') {
        // Modo survival: mistura tudo
        const animes = await client.query(`SELECT * FROM animes LIMIT 20`);
        const characters = await client.query(`SELECT * FROM characters LIMIT 20`);
        const quotes = await client.query(`SELECT * FROM quotes LIMIT 20`);
        
        const mixed = [
          ...(animes.rows.length > 0 ? generateQuizQuestions(animes.rows, 'anime', 7) : []),
          ...(characters.rows.length > 0 ? generateQuizQuestions(characters.rows, 'character', 7) : []),
          ...(quotes.rows.length > 0 ? generateQuizQuestions(quotes.rows, 'quote', 6) : [])
        ];
        
        if (mixed.length > 0) {
          questions = shuffle(mixed).slice(0, count);
          source = "database";
        } else {
          // Fallback completo
          const fallback = [
            ...generateQuizQuestions(EMERGENCY_DATA.animes, 'anime', 7),
            ...generateQuizQuestions(EMERGENCY_DATA.characters, 'character', 7),
            ...generateQuizQuestions(EMERGENCY_DATA.quotes, 'quote', 6)
          ];
          questions = shuffle(fallback).slice(0, count);
          source = "emergency";
        }
      }

      // Se não gerou nada, usar emergência
      if (!questions || questions.length === 0) {
        questions = generateQuizQuestions(EMERGENCY_DATA.animes, 'anime', count);
        source = "emergency_fallback";
      }

      // Salvar no cache
      await setCache(cacheKey, questions, CACHE_DURATION);

      res.json({
        mode,
        difficulty: mode === 'survival' ? null : difficulty,
        source,
        questions,
        total: questions.length
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error("❌ Erro ao gerar quiz:", error);
    
    // Fallback de emergência
    const fallbackQuestions = generateQuizQuestions(
      EMERGENCY_DATA.animes, 
      mode === 'character' ? 'character' : mode === 'quote' ? 'quote' : 'anime', 
      10
    );
    
    res.json({
      mode,
      source: "emergency_fallback",
      questions: fallbackQuestions,
      total: fallbackQuestions.length
    });
  }
});

// SALVAR SESSÃO DE JOGO
app.post("/api/session", async (req, res) => {
  const { 
    username, 
    game_mode, 
    score, 
    total_questions, 
    correct_count, 
    difficulty 
  } = req.body;

  if (!username || score === undefined) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const percentage = (correct_count / total_questions) * 100;
    const tier = calculateTier(percentage);

    // Inserir sessão
    await client.query(`
      INSERT INTO game_sessions 
      (username, game_mode, score, total_questions, correct_count, difficulty, tier_earned)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [username, game_mode, score, total_questions, correct_count, difficulty, tier.name]);

    // Atualizar usuário
    await client.query(`
      INSERT INTO users (username, total_score, games_played, correct_answers, tier)
      VALUES ($1, $2, 1, $3, $4)
      ON CONFLICT (username) DO UPDATE SET
        total_score = users.total_score + $2,
        games_played = users.games_played + 1,
        correct_answers = users.correct_answers + $3,
        tier = CASE 
          WHEN (users.correct_answers + $3) / ((users.games_played + 1) * 10.0) * 100 >= 90 THEN 'Kage'
          WHEN (users.correct_answers + $3) / ((users.games_played + 1) * 10.0) * 100 >= 70 THEN 'Jonin'
          WHEN (users.correct_answers + $3) / ((users.games_played + 1) * 10.0) * 100 >= 40 THEN 'Chunin'
          ELSE 'Genin'
        END,
        last_active = NOW()
    `, [username, score, correct_count, tier.name]);

    await client.query('COMMIT');

    res.json({ 
      success: true, 
      tier_earned: tier,
      message: `Parabéns! Você alcançou o rank ${tier.name}!`
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Erro ao salvar sessão:", err);
    res.status(500).json({ error: "Erro ao salvar progresso" });
  } finally {
    client.release();
  }
});

// OBTER RANKING
app.get("/api/ranking", async (req, res) => {
  const { mode, limit = 50 } = req.query;

  const client = await pool.connect();
  try {
    let query = `
      SELECT 
        s.username,
        s.score,
        s.game_mode,
        s.difficulty,
        s.tier_earned,
        to_char(s.created_at, 'DD/MM/YYYY HH24:MI') as date,
        u.total_score,
        u.games_played,
        u.tier as user_tier
      FROM game_sessions s
      LEFT JOIN users u ON s.username = u.username
    `;

    const params = [];
    
    if (mode && mode !== 'all') {
      query += ` WHERE s.game_mode = $1`;
      params.push(mode);
    }
    
    query += ` ORDER BY s.score DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await client.query(query, params);
    
    res.json(result.rows);

  } catch (err) {
    console.error("Erro ao buscar ranking:", err);
    res.status(500).json({ error: "Erro ao buscar ranking" });
  } finally {
    client.release();
  }
});

// OBTER PERFIL DO USUÁRIO
app.get("/api/user/:username", async (req, res) => {
  const { username } = req.params;

  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT 
        u.*,
        COUNT(s.id) as total_sessions,
        COALESCE(MAX(s.score), 0) as best_score,
        COALESCE(AVG(s.score), 0) as avg_score
      FROM users u
      LEFT JOIN game_sessions s ON u.username = s.username
      WHERE u.username = $1
      GROUP BY u.id
    `, [username]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const user = result.rows[0];
    const accuracy = user.games_played > 0 
      ? (user.correct_answers / (user.games_played * 10)) * 100 
      : 0;

    res.json({
      ...user,
      accuracy: Math.round(accuracy * 10) / 10,
      next_tier: user.tier === 'Genin' ? 'Chunin' : 
                 user.tier === 'Chunin' ? 'Jonin' : 
                 user.tier === 'Jonin' ? 'Kage' : null
    });

  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  } finally {
    client.release();
  }
});

// ROTA DE EMERGÊNCIA - DADOS FIXOS
app.get("/api/emergency/:type", (req, res) => {
  const { type } = req.params;
  
  if (type === 'animes') {
    res.json(EMERGENCY_DATA.animes);
  } else if (type === 'characters') {
    res.json(EMERGENCY_DATA.characters);
  } else if (type === 'quotes') {
    res.json(EMERGENCY_DATA.quotes);
  } else {
    res.status(400).json({ error: "Tipo inválido" });
  }
});

// MIDDLEWARE DE ERRO GLOBAL
app.use((err, req, res, next) => {
  console.error("🔥 Erro não tratado:", err);
  res.status(500).json({ 
    error: "Erro interno do servidor",
    message: err.message 
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

/* ==========================
   🚀 START SERVER
========================== */
const server = app.listen(PORT, async () => {
  console.log("\n==========================================");
  console.log("   🚀 OTAKUHUB ULTIMATE API ONLINE");
  console.log("==========================================");
  console.log(`📡 Porta: ${PORT}`);
  console.log(`💾 Cache: ${redis ? 'Redis' : 'Memória'}`);
  console.log(`🗄️  Banco: ${DATABASE_URL ? 'Neon PostgreSQL' : 'Não configurado'}`);
  console.log(`🌐 CORS: ${CORS_ORIGIN.join(', ')}`);
  console.log(`⚡ Rate Limit: 100 req/15min`);
  console.log("==========================================\n");

  // Inicializar banco de dados
  if (DATABASE_URL) {
    await initDatabase();
  } else {
    console.log("⚠️ Banco não configurado, usando apenas dados de emergência");
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Recebido SIGTERM, encerrando...');
  server.close(() => {
    pool.end();
    if (redis) redis.disconnect();
    process.exit(0);
  });
});

export default app;
