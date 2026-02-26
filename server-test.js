const express = require('express');
const oracledb = require('oracledb');
const app = express();

app.use(express.json());

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

// Simple test endpoint
app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello World" });
});

// Get all resource logs
app.get('/api/all-logs', async (req, res) => {
    try {
        const sql = `SELECT log_id, res_type, quantity, entry_date FROM resource_logs ORDER BY entry_date DESC`;
        const result = await runQuery(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        res.json(result.rows || []);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.use(express.static('public'));

app.listen(3001, () => {
    console.log('Server running at http://localhost:3001');
});
