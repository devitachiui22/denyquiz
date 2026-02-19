require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// 1. BANCO DE PERGUNTAS DE EMERGÊNCIA (GARANTIA ANTI-CRASH)
// =============================================================================
// Se o arquivo database.js falhar, o sistema usa este array automaticamente.
// Assim o app NUNCA fica girando infinito.
const EMERGENCY_DB = [
    {
        question: "Qual é o objetivo de Luffy em One Piece?",
        image: "https://cdn.myanimelist.net/images/characters/9/310307.jpg",
        options: ["Ser o Rei dos Piratas", "Ser Marinheiro", "Ser Prefeito", "Encontrar o pai"],
        correct: "Ser o Rei dos Piratas",
        level: "easy"
    },
    {
        question: "Qual o nome da raposa de nove caudas em Naruto?",
        image: "https://cdn.myanimelist.net/images/characters/9/131317.jpg",
        options: ["Kurama", "Shukaku", "Gyuki", "Matatabi"],
        correct: "Kurama",
        level: "easy"
    },
    {
        question: "Quem é o irmão de Edward Elric em FMA?",
        image: "https://cdn.myanimelist.net/images/characters/9/72533.jpg",
        options: ["Alphonse", "Roy", "Hughes", "Armstrong"],
        correct: "Alphonse",
        level: "medium"
    },
    {
        question: "Qual a transformação de Goku contra Freeza?",
        image: "https://cdn.myanimelist.net/images/characters/2/227445.jpg",
        options: ["Super Saiyajin", "Kaioken", "Oozaru", "Ultra Instinct"],
        correct: "Super Saiyajin",
        level: "easy"
    },
    {
        question: "Quem é o protagonista de Bleach?",
        image: "https://cdn.myanimelist.net/images/characters/3/300676.jpg",
        options: ["Ichigo Kurosaki", "Rukia", "Renji", "Aizen"],
        correct: "Ichigo Kurosaki",
        level: "easy"
    }
];

// Tenta carregar o banco gigante. Se der erro de sintaxe (vírgula faltando),
// ele captura o erro e usa o de emergência, EVITANDO O ERRO 500.
let QUESTIONS_DB = EMERGENCY_DB;
try {
    const external = require('./database');
    if (external && external.length > 0) {
        QUESTIONS_DB = external;
        console.log(`📚 Database externo carregado: ${QUESTIONS_DB.length} perguntas.`);
    }
} catch (e) {
    console.log("⚠️ Erro ao carregar database.js (Sintaxe ou não encontrado). Usando modo de emergência.");
}

// =============================================================================
// 2. CONFIGURAÇÃO POSTGRES (RANKING)
// =============================================================================
let pool = null;
if (process.env.DATABASE_URL) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
    });
}

// =============================================================================
// 3. MIDDLEWARES (CONFIGURAÇÃO DO SERVIDOR)
// =============================================================================
app.use(express.json());
app.use(helmet());
app.use(cors()); // ISSO RESOLVE O PROBLEMA DE ACESSO DO FLUTTER WEB

// =============================================================================
// 4. FUNÇÕES AUXILIARES (SEM LODASH PARA NÃO QUEBRAR)
// =============================================================================
function shuffle(array) {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function getQuizSession(difficulty) {
    // Filtra
    let filtered = QUESTIONS_DB.filter(q => q.level === (difficulty || 'easy'));
    if (filtered.length < 5) filtered = QUESTIONS_DB; // Fallback se faltar perguntas

    // Embaralha e pega 10
    const selected = shuffle(filtered).slice(0, 10);

    // Formata para o App
    return selected.map(q => ({
        question: q.question,
        image: q.image,
        options: shuffle(q.options), // Embaralha as alternativas
        correct: q.correct
    }));
}

// =============================================================================
// 5. ROTAS (API)
// =============================================================================

// Health Check
app.get('/', (req, res) => res.json({ status: "Online", count: QUESTIONS_DB.length }));

// Gerar Quiz
app.get('/generate-quiz', (req, res) => {
    try {
        const { difficulty } = req.query;
        const questions = getQuizSession(difficulty);
        console.log(`🎲 Quiz gerado: ${difficulty} (${questions.length} perguntas)`);
        res.json({ questions });
    } catch (e) {
        console.error("Erro fatal:", e);
        // Em caso de erro extremo, devolve o banco de emergência para não travar o app
        res.json({ questions: EMERGENCY_DB }); 
    }
});

// Ranking (Com proteção contra falha de banco)
app.get('/ranking', async (req, res) => {
    if (!pool) return res.json([]); // Se não tiver banco, retorna vazio (não trava)

    try {
        const result = await pool.query(
            "SELECT player_name, score, difficulty, created_at FROM game_sessions ORDER BY score DESC LIMIT 50"
        );
        res.json(result.rows);
    } catch (e) {
        console.error("Erro no ranking:", e);
        res.json([]); // Retorna vazio em vez de erro 500
    }
});

// Salvar Sessão
app.post('/session', async (req, res) => {
    const { player_name, score, total_questions, difficulty } = req.body;
    
    if (!pool) return res.json({ success: true, offline: true });

    try {
        await pool.query(
            "INSERT INTO game_sessions (player_name, score, total_questions, difficulty) VALUES ($1, $2, $3, $4)",
            [player_name, score, total_questions, difficulty]
        );
        res.json({ success: true });
    } catch (e) {
        console.error("Erro ao salvar:", e);
        res.json({ success: false }); // Não trava o app
    }
});

// Inicialização
app.listen(PORT, async () => {
    console.log(`🔥 Servidor rodando na porta ${PORT}`);
    // Tenta criar tabela automaticamente
    if (pool) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id SERIAL PRIMARY KEY,
                    player_name VARCHAR(100),
                    score INT,
                    total_questions INT,
                    difficulty VARCHAR(20),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log("Banco SQL Configurado.");
        } catch (e) { console.log("Aviso: Banco SQL não conectou."); }
    }
});
