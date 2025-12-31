var config = require('./dbconfig');
const express = require('express');
const router = express.Router();
var app = express();
const sql = require('mssql');
const bcrypt = require('bcrypt');
const { getClientIp } = require("request-ip");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
/*********************************************************************************************************************/
const pools = new Map();
/*********************************************************************************************************************/
function getPoolByKey(key, config) {
    if (!pools.has(key)) {
        const p = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => pool)
            .catch((err) => {
                pools.delete(key);
                throw err;
            });
        pools.set(key, p);
    }
    return pools.get(key);
}
/*********************************************************************************************************************/
app.use('/', router);
/*********************************************************************************************************************/
router.post("/cloudServer/createNewUser", async (req, res) => {
    const SALT_ROUNDS = 12;

    // ---------------- ******** Change CUST ********----------------
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: "Missing username/password" });
        }

        const passhash = await bcrypt.hash(password, SALT_ROUNDS);

        const pool = await getPoolByKey("PriProProduction", config);

        const request = pool.request();
        request.input("userlogin", sql.NVarChar(20), username);
        request.input("passhash", sql.NVarChar(127), passhash);

        const result = await request.query(`
      INSERT INTO dbo.USERS (USERNAME, PASSHASH, CUST)
      VALUES (@userlogin, @passhash, 99);
    `);

        const ok = result?.rowsAffected?.[0] === 1;
        return res.json({ success: ok });
    } catch (err) {
        if (err?.number === 2627 || err?.number === 2601) {
            return res.status(409).json({ success: false, message: "Username already exists" });
        }

        console.error("Error createNewUser:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
/*********************************************************************************************************************/
const loginAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 60 * 1000;

router.post("/cloudServer/login", async (req, res) => {

    try {
        const { user, password } = req.body;
        const ip = getClientIp(req);
        const attemptKey = `${ip}|${user}`;

        const attemptData = loginAttempts[attemptKey];
        if (attemptData?.count >= MAX_ATTEMPTS) {
            const timePassed = Date.now() - attemptData.lastAttempt;
            if (timePassed < BLOCK_TIME) {
                const waitSec = Math.ceil((BLOCK_TIME - timePassed) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `יותר מדי ניסיונות שגויים. יש לנסות שוב בעוד ${waitSec} שניות`,
                    emessage: `Too many failed attempts. Try again in ${waitSec}s.`
                });
            } else {
                delete loginAttempts[attemptKey];
            }
        }

        const pool = await getPoolByKey("PriProProduction", config);
        const request = pool.request();
        request.input("user", sql.NVarChar(20), user);

        const dbRes = await request.query(`
        SELECT TOP 1 USERNAME, PASSHASH, 
        CUSTOMERS.CUST AS user_id,
        USERS.GUID AS user_guid
        FROM dbo.USERS
        JOIN CUSTOMERS ON USERS.CUST = CUSTOMERS.CUST
        WHERE USERNAME = @user
      `);

        const userLogin = dbRes.recordset?.[0];

        const ok = userLogin ? await bcrypt.compare(password, userLogin.PASSHASH) : false;

        if (!ok) {
            loginAttempts[attemptKey] = {
                count: (loginAttempts[attemptKey]?.count || 0) + 1,
                lastAttempt: Date.now()
            };

            const attemptsLeft = Math.max(0, MAX_ATTEMPTS - loginAttempts[attemptKey].count);

            return res.status(401).json({
                success: false,
                message: `אחד מפרטי הכניסה שגוי. נותנרו ${attemptsLeft} ניסיונות`,
                emessage: `Invalid credentials. ${attemptsLeft} attempt(s) left`
            });
        }

        delete loginAttempts[attemptKey];

        const token = jwt.sign(
            { user: userLogin.USERNAME, user_id: userLogin.user_id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            success: true,
            userLogin: userLogin.USERNAME,
            user_id: userLogin.user_id,
            user_guid: userLogin.user_guid,
            token
        });

    } catch (err) {
        console.error("Error login:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
/*********************************************************************************************************************/
const blacklistedTokens = new Set();
/*********************************************************************************************************************/
router.post('/cloudServer/logout', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (token) {
        blacklistedTokens.add(token);
    }
    res.json({ success: true, message: "Logged out successfully" });
});

/*********************************************************************************************************************/
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    if (blacklistedTokens.has(token)) {
        return res.status(401).json({ success: false, message: "Token revoked" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
};
/*********************************************************************************************************************/
router.get('/cloudServer/protected', authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: `Hello ${req.user.username}, you accessed a protected route!`
    });
});
/*********************************************************************************************************************/
module.exports = router;