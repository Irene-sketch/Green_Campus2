const oracledb = require('oracledb');

const dbConfig = {
    user: "system",
    password: "irenesql",
    connectString: "localhost/XE"
};

async function checkTableStructure() {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        
        // Check resource_logs columns
        const result = await conn.execute(`
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM USER_TAB_COLUMNS 
            WHERE TABLE_NAME = 'RESOURCE_LOGS'
            ORDER BY COLUMN_ID
        `, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        
        console.log("resource_logs table structure:");
        console.log(result.rows);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) {
            try { await conn.close(); } catch (e) { console.error(e); }
        }
    }
}

checkTableStructure();
