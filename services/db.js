const { Pool } = require("pg");
const config = require("../configs/config_db");
const response = require("./responseHelper.js");

let poolMain = new Pool(config.db);

async function query(sql, res = undefined) {
  const client = await poolMain.connect();

  try {
    const result = await client.query(sql);
    return Promise.resolve(result.rows);
  } catch (err) {
    console.error(`Terjadi Error Pada: ${err.message}`, err);
    client.query("ROLLBACK");
    console.info("Rollback berhasil");
    if (res != undefined) {
      return response.jsonServerError(
        "Terjadi kesalahan database pada server",
        res,
        "",
        "",
        ""
      );
    }
    return;
  } finally {
    client.release();
  }
}

async function query_transaksional(list_sql, res = undefined) {
  const client = await poolMain.connect();
  let result = [];
  try {
    await client.query("BEGIN");
    await client.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

    for (const sql of list_sql) {
      result.push(client.query(sql));
    }
    await Promise.all(result);
    await client.query("COMMIT");
  } catch (err) {
    console.error(`Terjadi Error Pada: ${err.message}`, err);
    await client.query("ROLLBACK");
    console.info("Rollback berhasil");
    await client.release();
    return "Error";
  }
  await client.release();
  return result;
}

module.exports = {
  query,
  query_transaksional,
};
