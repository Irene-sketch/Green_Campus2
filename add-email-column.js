const oracledb = require('oracledb');

const dbConfig = {
    user: "system",
    password: "irenesql",
    connectString: "localhost/XE"
};

async function addEmailColumn() {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        console.log("Connected to Oracle Database");

        // Try to add EMAIL column to users table
        try {
            await conn.execute(`
                ALTER TABLE users 
                ADD email VARCHAR2(100)
            `, [], { autoCommit: true });
            console.log("✓ Added EMAIL column to users table");
        } catch (err) {
            if (err.errorNum === 1430) {
                console.log("✓ EMAIL column already exists");
            } else {
                throw err;
            }
        }

        console.log("\n✓ Database update complete!");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) {
            try { await conn.close(); } catch (e) { console.error(e); }
        }
    }
}

addEmailColumn();
