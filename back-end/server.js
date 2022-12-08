var express = require('express'),
bodyParser = require('body-parser');
const {spawn} = require('child_process')
var router = express.Router();
const axios = require('axios')
let cheerio = require('cheerio');
let fs = require('fs');
const { time } = require('console');
const { start } = require('repl');
const {spawnSync} = require('child_process')

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

function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 15000);
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

app.post('/query', async (req, res) => {
    const channelName = req.body.ChannelName
    const startDate = req.body.StartDate
    const endDate = req.body.EndDate
    const searchQuery = req.body.SearchQuery

    var dataToSend
    var link = "https://www.youtube.com/c/" + channelName + "/videos"
    const python_ = spawn('python', ['back-end/web_scraper.py', link, startDate, endDate]);

    python_.stdout.on('data', async (data) => {
        // console.log('Pipe data from python script ...');
        dataToSend = data.toString();
        
        let link_arr = await dataToSend.split('\'')
        let i = 0
        const result = await resolveAfter2Seconds()
        for (const d of link_arr) {

            if (d != '[' && d != ', ' && d != ']\r\n')  {
                scrapeLinks(d, channelName, startDate, endDate)
            }
            if (d == ']\r\n') {
                searchTranscripts(searchQuery, channelName, startDate, endDate)
                
            }
            i += 1
        }
        
    });

    python_.on('close', (code) => {
        console.log(`child process close all stdio with code ${code}`);
        res.send({ message: dataToSend} )
    });
})

var scrapeLinks = async (data, channelName, startDate, endDate) => {
    const python_ = spawnSync('python', ['back-end/scraper.py', data, channelName, startDate, endDate]);
 

}

var searchTranscripts = async (searchQuery, channelName, startDate, endDate) => {
    const python_ = spawnSync('python', ['back-end/searchEngine.py', searchQuery, channelName, startDate, endDate]);
    console.log(python_.output.toString('utf8'))
}

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('back-end/data/project.db', (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
  });


app.post('/results/display', (req, res) => {
    db.all("SELECT * FROM Results", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Read statement was successful")
            res.send(result);
        }
    });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);

