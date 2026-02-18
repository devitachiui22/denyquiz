require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const _ = require('lodash'); // Essencial para shuffle eficiente
const db = require('./db');
const INTERNAL_DB = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARES DE SEGURANÇA E PARSING
// =============================================================================
app.use(express.json());
app.use(helmet()); // Proteção de headers
app.use(cors());   // Permite que o Flutter (web/mobile) acesse a API

// =============================================================================
// HELPERS (LÓGICA DE NEGÓCIO)
// =============================================================================

/**
 * Filtra e embaralha as perguntas baseado na dificuldade.
 * Também embaralha as opções de resposta para que a correta não seja sempre a mesma.
 */
function getQuizSession(difficulty) {
    // 1. Filtra pela dificuldade solicitada (fallback para 'medium' se inválido)
    let filteredQuestions = INTERNAL_DB.filter(q => q.level === (difficulty || 'medium'));

    // Se não houver perguntas suficientes para a dificuldade (ex: 'hard' vazio),
    // pega do banco inteiro para não quebrar o app.
    if (filteredQuestions.length < 5) {
        filteredQuestions = INTERNAL_DB;
    }

    // 2. Seleciona 10 perguntas aleatórias (Shuffle)
    const selectedQuestions = _.sampleSize(filteredQuestions, 10);

    // 3. Formata para o Frontend e embaralha as opções
    return selectedQuestions.map(q => {
        // Clona as opções para não modificar o banco original
        const shuffledOptions = _.shuffle(q.options);

        return {
            // Envia apenas o necessário para o Flutter
            question: q.question,
            image: q.image,          // Flutter espera 'image' ou mapeia para imageUrl
            options: shuffledOptions,
            correct: q.correct       // Flutter usa isso para validar
        };
    });
}

// =============================================================================
// ROTAS DA API
// =============================================================================

// ROTA 1: Health Check (Para verificar se o servidor está on no Render)
app.get('/', (req, res) => {
    res.json({ status: 'Online', system: 'DenyQuiz AI Core', questions_loaded: INTERNAL_DB.length });
});

// ROTA 2: Gerar Quiz
// GET /generate-quiz?difficulty=easy
app.get('/generate-quiz', (req, res) => {
    try {
        const { difficulty } = req.query;
        console.log(`⚡ Gerando nova sessão de Quiz. Dificuldade: ${difficulty || 'medium'}`);

        const questions = getQuizSession(difficulty);

        // Retorna no formato esperado pelo ApiService do Flutter
        // O Flutter espera: { questions: [...] }
        res.json({ questions });
    } catch (error) {
        console.error('Erro ao gerar quiz:', error);
        res.status(500).json({ error: 'Falha interna ao gerar pergaminho.' });
    }
});

// ROTA 3: Salvar Sessão (Ranking)
// POST /session
// Body: { player_name, score, total_questions, difficulty }
app.post('/session', async (req, res) => {
    const { player_name, score, total_questions, difficulty } = req.body;

    // Validação básica
    if (!player_name || score === undefined) {
        return res.status(400).json({ error: 'Dados incompletos, Shinobi.' });
    }

    // Se não tiver banco configurado, retorna sucesso fake (Modo Offline)
    if (!db) {
        console.log(`📝 [OFFLINE MODE] Sessão recebida: ${player_name} - ${score} pts`);
        return res.status(200).json({ success: true, mode: 'offline' });
    }

    try {
        const query = `
            INSERT INTO game_sessions (player_name, score, total_questions, difficulty, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id
        `;

        await db.query(query, [player_name, score, total_questions, difficulty]);

        console.log(`✅ [DB SAVED] Ranking atualizado para ${player_name}`);
        res.status(201).json({ success: true });

    } catch (error) {
        console.error('Erro ao salvar no Postgres:', error);
        // Não retorna 500 para não assustar o usuário no app,
        // já que o score local foi mostrado.
        res.status(200).json({ success: false, error: 'Database error' });
    }
});

// ROTA 4: Obter Ranking
// GET /ranking
app.get('/ranking', async (req, res) => {
    if (!db) {
        return res.json([]); // Retorna lista vazia se estiver offline
    }

    try {
        // Busca os Top 50 ordenados por Score (Maior -> Menor)
        const result = await db.query(`
            SELECT player_name, score, total_questions, difficulty, created_at
            FROM game_sessions
            ORDER BY score DESC, created_at DESC
            LIMIT 50
        `);

        // Mapeia para o formato que o Model do Flutter (SessionModel) espera
        // O Postgres retorna snake_case, o Flutter converte no fromMap.
        // Vamos garantir que os nomes das colunas batem.
        res.json(result.rows);

    } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        res.status(500).json({ error: 'Falha ao invocar ranking.' });
    }
});

// =============================================================================
// INICIALIZAÇÃO DO SERVIDOR E BANCO
// =============================================================================

async function init() {
    // 1. Tenta criar a tabela se estiver conectado ao banco
    if (db) {
        try {
            const client = await db.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id SERIAL PRIMARY KEY,
                    player_name VARCHAR(100) NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER DEFAULT 10,
                    difficulty VARCHAR(20),
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);
            client.release();
            console.log('🗄️  Tabela SQL verificada/criada com sucesso.');
        } catch (e) {
            console.error('⚠️ Falha ao inicializar tabela SQL. Rodando sem persistência.', e.message);
        }
    }

    // 2. Inicia o Express
    app.listen(PORT, () => {
        console.log(`
        ===========================================================
        🔥  DENYQUIZ BACKEND RODANDO NA PORTA ${PORT}
        📚  Banco Interno: ${INTERNAL_DB.length} perguntas carregadas
        📡  Status DB: ${db ? 'CONECTADO' : 'OFFLINE (Memória Apenas)'}
        ===========================================================
        `);
    });
}

init();