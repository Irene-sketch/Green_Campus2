const oracledb = require('oracledb');
(async()=>{
  const dbConfig={user:'system',password:'irenesql',connectString:'localhost/XE'};
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute("SELECT column_name, data_type FROM user_tab_cols WHERE table_name='RESOURCE_LOGS'", [], { outFormat: oracledb.OUT_FORMAT_OBJECT});
    console.log(result.rows);
  } catch (e) {
    console.error(e);
  } finally {
    if(conn) await conn.close();
  }
})();