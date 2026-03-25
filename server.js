const express = require('express');
const oracledb = require('oracledb');
const app = express();

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

const dbConfig = {
    user: "system",          
    password: "irenesql",    
    connectString: "localhost/XE" 
};

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
            try { await conn.close(); } catch (e) { }
        }
    }
}

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
            res.status(400).json({ success: false, message: "Username or email already exists." });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required." });
    }

    try {
        const sql = `SELECT * FROM users WHERE username = :un AND password = :pw`;
        const result = await runQuery(sql, { un: username, pw: password });
        if (result.rows.length > 0) {
            return res.json({ success: true, message: "Login successful." });
        }
        return res.status(401).json({ success: false, message: "Invalid username or password." });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.post('/api/logout', (req, res) => {
    res.json({ success: true, message: "Logged out" });
});

app.post('/api/resources', async (req, res) => {
    const { type, qty, date, time, building } = req.body;
    const formattedTime = time && time.length===5 ? `${time}:00` : time || '00:00:00';
    try {
        const sql = `INSERT INTO resource_logs (res_type, quantity, building, entry_date, entry_time) 
                     VALUES (:type, :qty, :building, TO_DATE(:dt, 'YYYY-MM-DD'), TO_TIMESTAMP(:tm, 'HH24:MI:SS'))`;
        await runQuery(sql, { type, qty, building, dt: date, tm: formattedTime });
        res.json({ success: true });
    } catch (err) {
        console.error("Error saving resource (entry_date path):", err);
        if (err.errorNum === 904 || /ORA-00904/.test(err.message)) {
            // fallback for legacy schema where entry_date doesn't exist
            try {
                const sql2 = `INSERT INTO resource_logs (res_type, quantity, building, log_date, entry_time) 
                              VALUES (:type, :qty, :building, TO_DATE(:dt, 'YYYY-MM-DD'), TO_TIMESTAMP(:tm, 'HH24:MI:SS'))`;
                await runQuery(sql2, { type, qty, building, dt: date, tm: formattedTime });
                return res.json({ success: true, legacy: true });
            } catch (err2) {
                console.error("Error saving resource (log_date fallback):", err2);
                return res.status(500).json({ error: err2.message });
            }
        }
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports', async (req, res) => {
    try {
        const sql = `SELECT 
                      (SELECT NVL(SUM(quantity),0) FROM resource_logs WHERE res_type='electricity') as elec,
                      (SELECT NVL(SUM(quantity),0) FROM resource_logs WHERE res_type='water') as water,
                      (SELECT NVL(SUM(quantity),0) FROM resource_logs WHERE res_type='waste') as waste
                     FROM dual`;
        const result = await runQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const data = result.rows[0] || { ELEC: 0, WATER: 0, WASTE: 0 };
        res.json({ elec: data.ELEC || 0, water: data.WATER || 0, waste: data.WASTE || 0 });
    } catch (err) {
        console.error("Error fetching reports:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/resource-list', async (req, res) => {
    try {
        const sql = `SELECT id, res_type, quantity, building,
                            NVL(entry_date, log_date) AS entry_date,
                            NVL(entry_time, log_time) AS entry_time
                     FROM resource_logs
                     ORDER BY NVL(entry_date, log_date) DESC, NVL(entry_time, log_time) DESC`;
        console.log('resource-list SQL:', sql);
        const result = await runQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error fetching logs:", err);
        res.status(500).json({ error: err.message });
    }
});

app.use(express.static('public'));
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
