const { Pool } = require('pg');
require('dotenv').config();

let pool = null;

// Verifica se existe URL de banco configurada
if (process.env.DATABASE_URL) {
    const isProduction = process.env.NODE_ENV === 'production';

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Necessário para conexões cloud (Render/Neon)
        },
        // Configurações de pool para aguentar carga
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
        console.error('❌ Erro inesperado no cliente PostgreSQL', err);
        // Não encerra o processo, permite que o app continue rodando em modo "Quiz Only"
    });
} else {
    console.warn('⚠️ Nenhuma DATABASE_URL encontrada. O Ranking não será persistido.');
}

module.exports = pool;