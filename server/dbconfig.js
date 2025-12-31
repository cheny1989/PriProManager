const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const USER = process.env.USERCLOUD;
const PASSWORD = process.env.PASSWORDCLOUD;
const SERVER = process.env.SERVERCLOUD;
const DATABASE = process.env.DATABASECLOUD;

const config = {
    user: USER,
    password: PASSWORD,
    server: SERVER,
    database: DATABASE,
    port: 1433,
    options: {
        encrypt: true,
        trustServerCertificate: false
    },
    pool: { max: 10, min: 2, idleTimeoutMillis: 30000 }
};

module.exports = config;
