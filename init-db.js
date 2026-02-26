const oracledb = require('oracledb');

const dbConfig = {
    user: "system",
    password: "irenesql",
    connectString: "localhost/XE"
};

async function initializeDatabase() {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        console.log("Connected to Oracle Database");

        // Create users table
        try {
            await conn.execute(`
                CREATE TABLE users (
                    username VARCHAR2(50) PRIMARY KEY,
                    password VARCHAR2(100) NOT NULL,
                    email VARCHAR2(100) NOT NULL
                )
            `, [], { autoCommit: true });
            console.log("✓ Created users table");
        } catch (err) {
            if (err.errorNum === 955) {
                console.log("✓ users table already exists");
            } else {
                throw err;
            }
        }

        // Create resource_logs table
        try {
            await conn.execute(`
                CREATE TABLE resource_logs (
                    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                    res_type VARCHAR2(50) NOT NULL,
                    quantity NUMBER NOT NULL,
                    log_date DATE NOT NULL
                )
            `, [], { autoCommit: true });
            console.log("✓ Created resource_logs table");
        } catch (err) {
            if (err.errorNum === 955) {
                console.log("✓ resource_logs table already exists");
            } else {
                throw err;
            }
        }

        console.log("\n✓ Database initialization complete!");

    } catch (err) {
        console.error("Error:", err);
    } finally {
        if (conn) {
            try { await conn.close(); } catch (e) { console.error(e); }
        }
    }
}

initializeDatabase();
