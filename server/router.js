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
/********** User **********/
/*********************************************************************************************************************/
router.post('/cloudServer/CustomerUser', async (req, res) => {
    const { username, cust } = req.body;

    if (!username || !cust) {
        return res.status(400).json({ message: "Missing username or cust in request body" });
    }

    try {
        const pool = await getPoolByKey("PriProProduction", config);

        const r = await pool.request()
            .input("username", sql.NVarChar(20), username)
            .input("cust", sql.Int, cust)
            .query(`
                SELECT 1 AS user_exists,
                CUSTOMERS.CUSTDES AS cust_des
                FROM USERS
                JOIN CUSTOMERS ON CUSTOMERS.CUST = USERS.CUST
                WHERE CUSTOMERS.CUST = @cust
                AND USERS.USERNAME = @username;
                `);

        const exists = r.recordset?.[0];

        return res.json({
            user_exists: exists ? true : false,
            cust_des: exists ? exists.cust_des : null
        });


    } catch (err) {
        console.error("Error CustomerUser:", err);
        return res.status(500).json({ message: "Server error" });
    }
});
/*********************************************************************************************************************/
router.post("/cloudServer/createNewUser", async (req, res) => {
    const SALT_ROUNDS = 12;

    try {

        const dataArray = req.body?.dataArray;

        if (!dataArray) {
            return res.status(400).json({
                success: false,
                message: "Missing dataArray in request body"
            });
        }

        const { username, password, cust } = dataArray;


        const passhash = await bcrypt.hash(password, SALT_ROUNDS);

        const pool = await getPoolByKey("PriProProduction", config);

        const request = pool.request();
        request.input("username", sql.NVarChar(20), username);
        request.input("passhash", sql.NVarChar(127), passhash);
        request.input("cust", sql.Int, cust);

        const result = await request.query(`
      INSERT INTO dbo.USERS (USERNAME, PASSHASH, CUST)
      VALUES (@username, @passhash, @cust);
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
router.put("/cloudServer/updatePassword", async (req, res) => {
    const SALT_ROUNDS = 12;

    try {

        const dataArray = req.body?.dataArray;

        if (!dataArray) {
            return res.status(400).json({
                success: false,
                message: "Missing dataArray in request body"
            });
        }

        const { username, password, cust } = dataArray;


        const passhash = await bcrypt.hash(password, SALT_ROUNDS);

        const pool = await getPoolByKey("PriProProduction", config);

        const request = pool.request();
        request.input("username", sql.NVarChar(20), username);
        request.input("passhash", sql.NVarChar(127), passhash);
        request.input("cust", sql.Int, cust);

        const result = await request.query(`
      UPDATE dbo.USERS SET PASSHASH = @passhash
      WHERE USERNAME = @username AND CUST = @cust;
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
/********** Packages **********/
/*********************************************************************************************************************/
router.get('/cloudServer/packages', async (req, res) => {

    try {
        const pool = await getPoolByKey("PriProProduction", config);

        const package = await pool.request()
            .query(`SELECT PACKAGE, DES, EDES, PRICE, [TRANSACTION] FROM PACKAGES WHERE PACKAGE <> 0;`);

        if (package.recordset.length > 0) {
            res.json(package.recordset);
        } else {
            res.json([]);
        }

    } catch (err) {
        console.error("Error getting forms:", err);
        res.status(500).json({ message: "Server error" });
    }
});
/*********************************************************************************************************************/
router.put("/cloudServer/updatePackages/:packageId", async (req, res) => {

    try {
        const packageId = req.params.packageId;
        const { DES, EDES, PRICE, TRANSACTION } = req.body;

        if (!packageId) {
            return res.status(400).json({ success: false, message: "Missing PACKAGE id" });
        }

        const pool = await getPoolByKey("PriProProduction", config);

        const result = await pool.request()
            .input("PACKAGE", sql.Int(50), packageId)
            .input("DES", sql.NVarChar(255), DES ?? null)
            .input("EDES", sql.NVarChar(255), EDES ?? null)
            .input("PRICE", sql.Decimal(18, 2), PRICE != null && PRICE !== "" ? Number(PRICE) : null)
            .input("TRANSACTION", sql.Int(50), TRANSACTION ?? null)
            .query(`
        UPDATE PACKAGES
        SET
          DES = @DES,
          EDES = @EDES,
          PRICE = @PRICE,
          [TRANSACTION] = @TRANSACTION
        WHERE PACKAGE = @PACKAGE;

        SELECT PACKAGE, DES, PRICE, [TRANSACTION]
        FROM PACKAGES
        WHERE PACKAGE = @PACKAGE;
      `);

        const row = result.recordset?.[0];
        if (!row) return res.status(404).json({ success: false, message: "Package not found" });

        return res.json({ success: true, row });

    } catch (err) {
        console.error("Error updating package:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
/*********************************************************************************************************************/
/********** Customers **********/
/*********************************************************************************************************************/
router.get('/cloudServer/getCustomers', async (req, res) => {

    const { guid } = req.params;

    try {
        const pool = await getPoolByKey("PriProProduction", config);

        const customer = await pool.request()
            .input('guid', sql.NVarChar, guid)
            .query(` 
                SELECT 
                ADDRESS,
                PHONE,
                CUSTDES,
                ZIP,
                ACCNAME,
                COUNTRYNAME,
                WTAXNUM,
                VATNUM,
                CITY,
                ADDRESS2,
                ADDRESS3,
                EMAIL,
                PACKAGE,
                CUST
                FROM CUSTOMERS
                WHERE CUST <> 0;
                `);

        if (customer.recordset.length > 0) {
            res.json(customer.recordset);
        } else {
            res.json([]);
        }

    } catch (err) {
        console.error("Error getting forms:", err);
        res.status(500).json({ message: "Server error" });
    }
});
/*********************************************************************************************************************/
router.get('/cloudServer/getCustomer/:guid', async (req, res) => {

    const { guid } = req.params;

    try {
        const pool = await getPoolByKey("PriProProduction", config);

        const customer = await pool.request()
            .input('guid', sql.NVarChar, guid)
            .query(` 
                SELECT 
                ADDRESS,
                PHONE,
                CUSTDES,
                ZIP,
                ACCNAME,
                COUNTRYNAME,
                WTAXNUM,
                VATNUM,
                CITY,
                ADDRESS2,
                ADDRESS3,
                EMAIL,
                PACKAGE,
                CUST
                FROM CUSTOMERS
                WHERE GUID = @guid;
                `);

        if (customer.recordset.length > 0) {
            res.json(customer.recordset);
        } else {
            res.json([]);
        }

    } catch (err) {
        console.error("Error getting forms:", err);
        res.status(500).json({ message: "Server error" });
    }
});
/*********************************************************************************************************************/
router.post('/cloudServer/createCustomer', async (req, res) => {

    const dataArray = req.body?.dataArray;

    if (!dataArray) {
        return res.status(400).json({
            success: false,
            message: "Missing dataArray in request body"
        });
    }

    const {
        accname, custdes,
        address, address2, address3,
        city, zip, countryname,
        phone, email,
        wtaxnum, vatnum, packagecust
    } = dataArray;


    try {
        const pool = await getPoolByKey("PriProProduction", config);

        const result = await pool
            .request()
            .input('accname', sql.NVarChar, accname)
            .input('custdes', sql.NVarChar, custdes)
            .input('address', sql.NVarChar, address)
            .input('address2', sql.NVarChar, address2)
            .input('address3', sql.NVarChar, address3)
            .input('city', sql.NVarChar, city)
            .input('zip', sql.NVarChar, zip)
            .input('countryname', sql.NVarChar, countryname)
            .input('phone', sql.NVarChar, phone)
            .input('email', sql.NVarChar, email)
            .input('wtaxnum', sql.NVarChar, wtaxnum)
            .input('vatnum', sql.NVarChar, vatnum)
            .input('packagecust', sql.Int, packagecust)
            .query(`
                INSERT INTO CUSTOMERS(
                ACCNAME, CUSTDES,
                ADDRESS, ADDRESS2, ADDRESS3,
                CITY, ZIP, COUNTRYNAME,
                PHONE, EMAIL, 
                WTAXNUM, VATNUM, PACKAGE)
                OUTPUT INSERTED.CUST AS custId
                VALUES (
                @accname, @custdes,   
                @address, @address2, @address3,
                @city, @zip, @countryname,
                @phone, @email,
                @wtaxnum, @vatnum, @packagecust)
            `);

        const custId = result.recordset?.[0]?.custId;

        if (custId > 0) {
            return res.status(200).json({ success: true, message: "✅ added successfully" });
        }
        return res.status(500).json({ success: false, message: "Insert failed" });

    } catch (err) {
        console.error("Error getting forms:", err);
        res.status(500).json({ message: "Error receiving forms" });
    }

});
/*********************************************************************************************************************/
router.put("/cloudServer/updateCustomer", async (req, res) => {
    try {
        const { dataArray } = req.body;

        if (!dataArray) {
            return res.status(400).json({ success: false, message: "Missing dataArray" });
        }

        const {
            cust,
            accname, custdes,
            address, address2, address3,
            city, zip, countryname,
            phone, email,
            wtaxnum, vatnum, packagecust
        } = dataArray;

        if (!cust) {
            return res.status(400).json({ success: false, message: "Missing customer id (cust)" });
        }

        const pool = await getPoolByKey("PriProProduction", config);

        const result = await pool.request()
            .input("cust", sql.Int, cust)
            .input("accname", sql.NVarChar(100), accname ?? null)
            .input("custdes", sql.NVarChar(255), custdes ?? null)
            .input("address", sql.NVarChar(255), address ?? null)
            .input("address2", sql.NVarChar(255), address2 ?? null)
            .input("address3", sql.NVarChar(255), address3 ?? null)
            .input("city", sql.NVarChar(100), city ?? null)
            .input("zip", sql.NVarChar(20), zip ?? null)
            .input("countryname", sql.NVarChar(100), countryname ?? null)
            .input("phone", sql.NVarChar(50), phone ?? null)
            .input("email", sql.NVarChar(150), email ?? null)
            .input("wtaxnum", sql.NVarChar(50), wtaxnum ?? null)
            .input("vatnum", sql.NVarChar(50), vatnum ?? null)
            .input("packagecust", sql.Int(50), packagecust ?? null)
            .query(`
        UPDATE CUSTOMERS
        SET
          ACCNAME = @accname,
          CUSTDES = @custdes,
          ADDRESS = @address,
          ADDRESS2 = @address2,
          ADDRESS3 = @address3,
          CITY = @city,
          ZIP = @zip,
          COUNTRYNAME = @countryname,
          PHONE = @phone,
          EMAIL = @email,
          WTAXNUM = @wtaxnum,
          VATNUM = @vatnum,
          PACKAGE = @packagecust
          WHERE CUST = @cust;

        SELECT CUST, ACCNAME, CUSTDES, ADDRESS, ADDRESS2, ADDRESS3, CITY, ZIP, COUNTRYNAME,
               PHONE, EMAIL, WTAXNUM, VATNUM, PACKAGE
        FROM CUSTOMERS
        WHERE CUST = @cust;
      `);

        const updated = result.recordset?.[0];
        if (!updated) {
            return res.status(404).json({ success: false, message: "Customer not found" });
        }

        return res.json({ success: true, customer: updated });

    } catch (err) {
        console.error("Error updateCustomer:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
/*********************************************************************************************************************/
module.exports = router;