var express = require('express'),
bodyParser = require('body-parser');
const {spawn} = require('child_process')
var router = express.Router();
const axios = require('axios')
let cheerio = require('cheerio');
let fs = require('fs');
const { time } = require('console');
// let mysql = require('mysql');
const sqlite3 = require('sqlite3').verbose();

var app = express();

var port = process.env.PORT || 3002

// Allow CORS so that backend and frontend could be put on different servers
var allowCrossDomain = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
};
app.use(allowCrossDomain);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'project'
// });

// connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
  
//     console.log('Connected to the MySQL server.');
//   });

let db = new sqlite3.Database('data/project.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });
  
// Use routes as a module (see index.js)
// require('./routes')(app, router);

function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 5000);
    })
}
app.get('/', async (req, res) => {
    var dataToSend

    const python_ = spawn('python', ['back-end/web_scraper.py']);

    python_.stdout.on('data', async (data) => {
        // console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        
        let link_arr = await dataToSend.split('\'')
        let i = 0

        for (const d of link_arr) {
            const result = await resolveAfter2Seconds()

            if (d != '[' && d != ', ' && d != ']\r\n')  {
                scrapeLinks(d)
            }
            i += 1
        }
        
    });

    python_.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        res.send({ message: dataToSend} )
    });
})

app.get('/query', async (req, res) => {
    const channelName = req.body.ChannelName
    const startDate = req.body.StartDate
    const endDate = req.body.endDate
    const searchQuery = req.body.SearchQuery

    var dataToSend
    var link = "https://www.youtube.com/c/" + channelName + "/videos"
    const python_ = spawn('python', ['back-end/web_scraper.py', link, startDate, endDate]);

    python_.stdout.on('data', async (data) => {
        // console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        
        let link_arr = await dataToSend.split('\'')
        let i = 0

        for (const d of link_arr) {
            const result = await resolveAfter2Seconds()

            if (d != '[' && d != ', ' && d != ']\r\n')  {
                scrapeLinks(d)
            }
            i += 1
        }
        
    });

    python_.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        res.send({ message: dataToSend} )
    });
})

var scrapeLinks = async (data) => {
    const python_ = spawn('python', ['back-end/scraper.py', data]);
    python_.stdout.on('data', (data) => {
        // console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        // scrapeLinks(data)
        console.log(dataToSend)
    });

    python_.on('close', (code) => {
        console.log(`scrape process close all stdio with code ${code}`);

    });

}

// const asyncScrape = data =>
//   new Promise(resolve =>
//     setTimeout(
//       () => resolve(scrapeLinks(data))
//     )
//   );

// Start the server
app.listen(port);
console.log('Server running on port ' + port);

app.get('/getData', (req, res) => {
    db.get('SELECT * FROM Users', (err, result) => {
       if(err) {
        console.log(err);
       } else {
        res.send(result);
       }
    })

    // let sql = `CREATE TAB`;

    // db.all(sql, [], (err, rows) => {
    // if (err) {
    //     throw err;
    // }
    // rows.forEach((row) => {
    //     console.log(row.name);
    // });
    // });


    // let sql = `SELECT * FROM Users`;

    // db.all(sql, [], (err, rows) => {
    
    // if (err) {
    //     throw err;
    // }
    // rows.forEach((row) => {
    //     console.log(row.name);
    // });
// });
});