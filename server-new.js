const express = require('express');
const oracledb = require('oracledb');
const path = require('path');
const app = express();

app.use(express.json());

// --- ORACLE DATABASE CONNECTION CONFIG ---
const dbConfig = {
    user: "system",          
    password: "irenesql",    
    connectString: "localhost/XE" 
};

// Helper function to handle connections
async function runQuery(query, params = [], options = { autoCommit: true }) {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        const result = await conn.execute(query, params, options);
        return result;
    } catch (err) {
        console.error("Query error:", err);
        throw err;
    } finally {
        if (conn) {
            try { await conn.close(); } catch (e) { console.error(e); }
        }
    }
}

// ---REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    if (!username || !password || !email) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    
    try {
        const sql = `INSERT INTO users (username, password, email) VALUES (:un, :pw, :em)`;
        await runQuery(sql, { un: username, pw: password, em: email });
        res.json({ success: true, message: "User registered successfully!" });
    } catch (err) {
        console.error("Registration error:", err);
        if (err.errorNum === 1) {
            res.status(400).json({ success: false, message: "Username already exists." });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

// --- LOGOUT ROUTE ---
app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: "Logged out" });
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const sql = `SELECT * FROM users WHERE username = :un AND password = :pw`;
        const result = await runQuery(sql, { un: username, pw: password });
        
        if (result.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: "Invalid Login" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// --- SAVE RESOURCE USAGE ---
app.post('/api/resources', async (req, res) => {
    const { type, qty, date } = req.body;
    try {
        const sql = `INSERT INTO resource_logs (res_type, quantity, entry_date) 
                     VALUES (:type, :qty, TO_DATE(:dt, 'YYYY-MM-DD'))`;
        await runQuery(sql, { type, qty, dt: date });
        res.json({ success: true });
    } catch (err) {
        console.error("Error saving resource:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- GET REPORTS/TOTALS ---
app.get('/api/reports', async (req, res) => {
    try {
        const sql = `
            SELECT 
                (SELECT SUM(quantity) FROM resource_logs WHERE res_type='electricity') as elec,
                (SELECT SUM(quantity) FROM resource_logs WHERE res_type='water') as water
            FROM dual`;
        const result = await runQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        const data = result.rows[0] || { ELEC: 0, WATER: 0 };
        res.json({
            elec: data.ELEC || 0,
            water: data.WATER || 0
        });
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- GET ALL RESOURCE LOGS ---
app.get('/api/resource-list', async (req, res) => {
    try {
        const sql = `SELECT log_id, res_type, quantity, entry_date FROM resource_logs ORDER BY entry_date DESC`;
        const result = await runQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- SERVE STATIC FILES ---
app.use(express.static('public'));

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
