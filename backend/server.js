require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// ================= CONFIGURAÇÕES INICIAIS =================
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de Segurança e Performance
app.use(express.json());
app.use(cors()); // Permite acesso de qualquer lugar (Flutter/Web)
app.use(helmet());
app.use(compression());

// Configuração do Banco de Dados (Neon PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para Neon
    max: 20, // Conexões simultâneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Tempo de Cache: 24 Horas
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// ================= DADOS DE EMERGÊNCIA (FALLBACK) =================
// Usado se a API externa cair E o cache estiver vazio. O App NUNCA para.
const FALLBACK_ANIMES = [
    { title: "Naruto: Shippuuden", image: "https://cdn.myanimelist.net/images/anime/5/17407.jpg", score: 8.2, members: 2000000 },
    { title: "One Piece", image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg", score: 9.0, members: 2100000 },
    { title: "Shingeki no Kyojin", image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg", score: 8.5, members: 3500000 },
    { title: "Death Note", image: "https://cdn.myanimelist.net/images/anime/9/9453.jpg", score: 8.6, members: 3600000 },
    { title: "Fullmetal Alchemist: Brotherhood", image: "https://cdn.myanimelist.net/images/anime/1223/96541.jpg", score: 9.1, members: 3100000 },
    { title: "Sword Art Online", image: "https://cdn.myanimelist.net/images/anime/11/39717.jpg", score: 7.2, members: 2900000 },
    { title: "Demon Slayer", image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg", score: 8.5, members: 2800000 },
    { title: "Tokyo Ghoul", image: "https://cdn.myanimelist.net/images/anime/5/64449.jpg", score: 7.8, members: 2600000 },
    { title: "Hunter x Hunter (2011)", image: "https://cdn.myanimelist.net/images/anime/1337/99013.jpg", score: 9.0, members: 2600000 },
    { title: "Boku no Hero Academia", image: "https://cdn.myanimelist.net/images/anime/10/78745.jpg", score: 7.9, members: 2200000 },
    { title: "Steins;Gate", image: "https://cdn.myanimelist.net/images/anime/5/73199.jpg", score: 9.1, members: 2400000 },
    { title: "Code Geass", image: "https://cdn.myanimelist.net/images/anime/5/50331.jpg", score: 8.7, members: 2100000 },
    { title: "No Game No Life", image: "https://cdn.myanimelist.net/images/anime/1074/111944.jpg", score: 8.1, members: 2200000 },
    { title: "Noragami", image: "https://cdn.myanimelist.net/images/anime/9/77809.jpg", score: 8.0, members: 1900000 },
    { title: "Mirai Nikki", image: "https://cdn.myanimelist.net/images/anime/13/33465.jpg", score: 7.4, members: 2000000 }
];

// ================= UTILITÁRIOS =================
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function classifyDifficulty(anime) {
    // Critérios ajustados para API Jikan v4
    if (anime.members > 1500000) return "easy";   // Muito popular = Fácil
    if (anime.members > 800000) return "medium";  // Médio
    return "hard";                                // Pouco conhecido (na lista TOP) = Difícil
}

// ================= INICIALIZAÇÃO DO BANCO =================
async function initDB() {
    console.log("🛠 Inicializando Banco de Dados...");
    try {
        const client = await pool.connect();
        try {
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

            // Tabela de Cache (Perguntas) - JSONB para flexibilidade
            await client.query(`
                CREATE TABLE IF NOT EXISTS quiz_cache (
                    id SERIAL PRIMARY KEY,
                    difficulty VARCHAR(20) UNIQUE,
                    data JSONB,
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            `);

            // Índice para Ranking rápido
            await client.query(`CREATE INDEX IF NOT EXISTS idx_sessions_score ON sessions(score DESC);`);
            console.log("✅ Tabelas verificadas/criadas com sucesso!");
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ ERRO CRÍTICO AO CONECTAR NO BANCO:", err.message);
        // Não matamos o processo para o Render não ficar reiniciando em loop infinito, mas logamos o erro.
    }
}

// ================= LÓGICA DE DADOS (API & CACHE) =================

async function fetchFromJikan() {
    try {
        console.log("📡 Buscando dados frescos da Jikan API...");
        // Buscamos 2 páginas para ter variedade (50 animes)
        const p1 = axios.get("https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=1");
        const p2 = axios.get("https://api.jikan.moe/v4/top/anime?filter=bypopularity&page=2");

        const [res1, res2] = await Promise.all([p1, p2]);
        const combined = [...res1.data.data, ...res2.data.data];

        // Mapear para formato leve interno
        return combined.map(a => ({
            title: a.title,
            image: a.images.jpg.large_image_url || a.images.jpg.image_url,
            score: a.score,
            members: a.members
        }));

    } catch (err) {
        console.error("⚠️ Falha na API externa (Rate Limit ou Down). Usando Fallback.");
        return FALLBACK_ANIMES;
    }
}

function generateQuiz(poolAnimes, difficulty) {
    // 1. Filtra pela dificuldade
    let filtered = poolAnimes.filter(a => classifyDifficulty(a) === difficulty);

    // Se não tiver animes suficientes nessa dificuldade, mistura com o fallback para garantir 10 perguntas
    if (filtered.length < 10) {
        const fallbackFiltered = FALLBACK_ANIMES.filter(a => classifyDifficulty(a) === difficulty);
        filtered = [...filtered, ...fallbackFiltered];

        // Se ainda assim for pouco (ex: hard extremo), pega qualquer um para não quebrar
        if (filtered.length < 5) filtered = poolAnimes;
    }

    // 2. Embaralha e pega 10
    const selectedAnimes = shuffle(filtered).slice(0, 10);

    // 3. Monta as perguntas
    return selectedAnimes.map(anime => {
        // Gera respostas erradas pegando nomes aleatórios da lista completa
        const wrongOptions = shuffle(poolAnimes)
            .filter(a => a.title !== anime.title)
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

// ================= ROTAS =================

// Rota de Teste (Health Check)
app.get('/', (req, res) => {
    res.send({ status: "Online", message: "DenyQuiz API is running 🚀", version: "1.0.0" });
});

// Gerar Quiz
app.get('/generate-quiz', async (req, res) => {
    const difficulty = req.query.difficulty || 'easy';

    try {
        const client = await pool.connect();
        try {
            // 1. Tentar Cache
            const cacheRes = await client.query("SELECT * FROM quiz_cache WHERE difficulty = $1", [difficulty]);

            if (cacheRes.rows.length > 0) {
                const cache = cacheRes.rows[0];
                const cacheAge = Date.now() - new Date(cache.updated_at).getTime();

                if (cacheAge < CACHE_DURATION) {
                    console.log(`📦 Cache Hit: ${difficulty}`);
                    return res.json({ source: "cache", difficulty, questions: cache.data });
                }
            }

            // 2. Buscar API Externa (Cache Miss ou Expirado)
            const animes = await fetchFromJikan();
            const quizQuestions = generateQuiz(animes, difficulty);

            // 3. Salvar no Cache (Upsert)
            await client.query(`
                INSERT INTO quiz_cache (difficulty, data, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (difficulty)
                DO UPDATE SET data = $2, updated_at = NOW();
            `, [difficulty, JSON.stringify(quizQuestions)]);

            console.log(`🔄 Novo Quiz Gerado: ${difficulty}`);
            res.json({ source: "api", difficulty, questions: quizQuestions });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Erro fatal na rota /generate-quiz:", err);
        // Fallback final de emergência para o app não travar na tela de loading
        const emergencyQuiz = generateQuiz(FALLBACK_ANIMES, difficulty);
        res.json({ source: "emergency_fallback", difficulty, questions: emergencyQuiz });
    }
});

// Salvar Pontuação
app.post('/session', async (req, res) => {
    const { player_name, score, total_questions, difficulty } = req.body;

    if (!player_name || score === undefined) {
        return res.status(400).json({ error: "Dados incompletos" });
    }

    try {
        await pool.query(
            "INSERT INTO sessions (player_name, score, total_questions, difficulty) VALUES ($1,$2,$3,$4)",
            [player_name, score, total_questions, difficulty]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao salvar ranking" });
    }
});

// Obter Ranking
app.get('/ranking', async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT player_name, score, difficulty, to_char(created_at, 'DD/MM/YYYY') as date FROM sessions ORDER BY score DESC LIMIT 50"
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar ranking" });
    }
});

// ================= START =================
app.listen(PORT, async () => {
    await initDB();
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
});
