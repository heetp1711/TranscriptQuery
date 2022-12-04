const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':me3mory:', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });

const users = ["Sara", "Mike", "James", "David", "Emily"];

db.serialize(function() {
    db.run("CREATE TABLE mytable (id, name)");
});



db.close();