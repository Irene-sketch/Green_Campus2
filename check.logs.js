const oracledb = require('oracledb');
(async()=>{
  const dbConfig={user:'system',password:'irenesql',connectString:'localhost/XE'};
  let conn;
  try {
    conn = await oracledb.getConnection(dbConfig);
    const result = await conn.execute('SELECT id,res_type,quantity,building,entry_date,entry_time FROM resource_logs ORDER BY entry_date DESC, entry_time DESC', [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e) {
    console.error('err', e);
  } finally {
    if (conn) await conn.close();
  }
})();