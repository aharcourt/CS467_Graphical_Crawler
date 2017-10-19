let mysql = require("mysql");
let pool = mysql.createPool({
    connectionLimit: 10,
    host: "mysql.eecs.oregonstate.edu",
    user: "cs290_harcoura",
    password: "0996",
    database: "cs290_harcoura"
});

module.exports.pool = pool;