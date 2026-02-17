require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// ================= CONFIGURAÇÃO =================
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());

// Conexão com Neon DB
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para Neon
    max: 10, // Máximo de conexões simultâneas
    idleTimeoutMillis: 30000
});

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

// ================= DADOS DE EMERGÊNCIA (FALLBACK) =================
// Se a API Jikan cair e o Cache estiver vazio, usamos isso para o app não quebrar.
const FALLBACK_ANIMES = [
    { title: "Naruto", image: "https://cdn.myanimelist.net/images/anime/13/17405.jpg", score: 8.0, members: 2000000 },
    { title: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", score: 9.0, members: 2000000 },
    { title: "Attack on Titan", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", score: 8.9, members: 3000000 },
    { title: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", score: 8.6, members: 3500000 },
    { title: "Dragon Ball Z", image: "https://cdn.myanimelist.net/images/anime/1607/117271.jpg", score: 8.1, members: 1500000 },
    { title: "Fullmetal Alchemist: Brotherhood", image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", score: 9.1, members: 3000000 },
    { title: "Sword Art Online", image: "https://cdn.myanimelist.net/images/anime/11/39717.jpg", score: 7.2, members: 2800000 },
    { title: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", score: 8.5, members: 2500000 },
    { title: "Tokyo Ghoul", image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg", score: 7.8, members: 2000000 },
    { title: "Hunter x Hunter", image: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg", score: 9.0, members: 2400000 },
    { title: "My Hero Academia", image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg", score: 7.9, members: 2100000 },
    { title: "Steins;Gate", image: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", score: 9.1, members: 2300000 }
];

// ================= INICIALIZAÇÃO DO BANCO =================
async function initDB() {
    try {
        console.log("🛠 Verificando tabelas no banco de dados...");
        const client = await pool.connect();

        // Tabela de Sessões (Ranking)
        await client.query(`
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                player_name VARCHAR(50),
                score INT NOT NULL,
                total_questions INT NOT NULL,
                difficulty VARCHAR(20),
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Tabela de Cache (Perguntas)
        await client.query(`
            CREATE TABLE IF NOT EXISTS quiz_cache (
                id SERIAL PRIMARY KEY,
                difficulty VARCHAR(20),
                data JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Índices para performance
        await client.query(`CREATE INDEX IF NOT EXISTS idx_score ON sessions(score DESC);`);

        console.log("✅ Banco de dados pronto e tabelas verificadas!");
        client.release();
    } catch (err) {
        console.error("❌ Erro fatal ao iniciar banco:", err);
    }
}

// ================= LÓGICA DO QUIZ =================

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function classifyDifficulty(anime) {
    // Lógica ajustada para garantir distribuição
    if (anime.score >= 8.3 && anime.members > 1000000) return "easy";
    if (anime.score >= 7.5 && anime.members > 500000) return "medium";
    return "hard";
}

async function fetchFromJikanWithRetry() {
    try {
        console.log("📡 Buscando dados na Jikan API...");
        // Pegamos as páginas 1 e 2 para ter variedade
        const p1 = axios.get("https://api.jikan.moe/v4/top/anime?page=1");
        const p2 = axios.get("https://api.jikan.moe/v4/top/anime?page=2");

        const [res1, res2] = await Promise.all([p1, p2]);
        const allAnimes = [...res1.data.data, ...res2.data.data];

        console.log(`✅ ${allAnimes.length} animes recebidos da API.`);

        // Mapear para formato simples interno
        return allAnimes.map(a => ({
            title: a.title,
            image: a.images.jpg.large_image_url || a.images.jpg.image_url,
            score: a.score || 0,
            members: a.members || 0
        }));

    } catch (err) {
        console.error("⚠️ Erro na API Jikan (pode ser Rate Limit). Usando Fallback.");
        return FALLBACK_ANIMES;
    }
}

function generateQuizData(animesRaw, targetDifficulty) {
    // 1. Filtrar animes pela dificuldade
    let poolAnimes = animesRaw.filter(a => classifyDifficulty(a) === targetDifficulty);

    // Se não tiver animes suficientes daquela dificuldade, usa todos para não quebrar
    if (poolAnimes.length < 5) poolAnimes = animesRaw;

    // 2. Embaralhar e pegar 10
    const selected = shuffle(poolAnimes).slice(0, 10);

    // 3. Criar perguntas
    return selected.map(anime => {
        // Gerar 3 opções erradas
        const wrongOptions = shuffle(animesRaw)
            .filter(a => a.title !== anime.title) // Garante que não repete a certa
            .slice(0, 3)
            .map(a => a.title);

        const options = shuffle([anime.title, ...wrongOptions]);

        return {
            question: "Qual é o nome deste anime?",
            image: anime.image,
            options: options,
            correct: anime.title
        };
    });
}

// ================= CACHE SYSTEM =================

async function getCachedQuiz(difficulty) {
    const res = await pool.query(
        "SELECT data, created_at FROM quiz_cache WHERE difficulty=$1 ORDER BY created_at DESC LIMIT 1",
        [difficulty]
    );

    if (res.rows.length === 0) return null;

    const cache = res.rows[0];
    const age = Date.now() - new Date(cache.created_at).getTime();

    if (age > CACHE_DURATION) {
        // Cache expirado, deleta antigo
        await pool.query("DELETE FROM quiz_cache WHERE difficulty=$1", [difficulty]);
        return null;
    }

    return cache.data;
}

async function saveCache(difficulty, data) {
    // Limpa cache antigo dessa dificuldade e insere novo
    await pool.query("DELETE FROM quiz_cache WHERE difficulty=$1", [difficulty]);
    await pool.query("INSERT INTO quiz_cache (difficulty, data) VALUES ($1, $2)", [difficulty, JSON.stringify(data)]);
}

// ================= ROTAS DA API =================

app.get('/', (req, res) => {
    res.send('DenyQuiz API está Online! 🚀');
});

app.get('/generate-quiz', async (req, res) => {
    const difficulty = req.query.difficulty || 'easy';

    try {
        // 1. Tenta pegar do Cache
        const cachedData = await getCachedQuiz(difficulty);
        if (cachedData) {
            console.log(`📦 Cache Hit: ${difficulty}`);
            return res.json({ source: 'cache', difficulty, questions: cachedData });
        }

        // 2. Se não tem cache, busca da API (ou fallback)
        let animes = await fetchFromJikanWithRetry();

        // 3. Gera o Quiz
        const quiz = generateQuizData(animes, difficulty);

        // 4. Salva no Cache para o próximo jogador
        await saveCache(difficulty, quiz);

        console.log(`🔄 Novo Quiz Gerado: ${difficulty}`);
        res.json({ source: 'generated', difficulty, questions: quiz });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno ao gerar quiz" });
    }
});

app.post('/session', async (req, res) => {
    const { player_name, score, total_questions, difficulty } = req.body;

    if (!player_name || score === undefined) {
        return res.status(400).json({ error: "Dados inválidos" });
    }

    try {
        await pool.query(
            "INSERT INTO sessions (player_name, score, total_questions, difficulty) VALUES ($1,$2,$3,$4)",
            [player_name, score, total_questions, difficulty]
        );
        res.json({ success: true, message: "Rank salvo!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao salvar rank" });
    }
});

app.get('/ranking', async (req, res) => {
    try {
        // Top 50 melhores pontuações globais
        const result = await pool.query(
            "SELECT player_name, score, difficulty, created_at FROM sessions ORDER BY score DESC LIMIT 50"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar ranking" });
    }
});

// ================= START SERVER =================

const PORT = process.env.PORT || 3000;

// Inicia o servidor e cria tabelas
app.listen(PORT, async () => {
    await initDB();
    console.log(`🔥 DenyQuiz API rodando na porta ${PORT}`);
});