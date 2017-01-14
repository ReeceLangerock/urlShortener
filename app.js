var express = require('express');
var path = require('path');
var app = express();
var config = require('./config');
var mongo = require('mongodb').MongoClient;
var url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@ds161048.mlab.com:61048/url-shortener`;
var urlManager = require('./urlManager')
var port = process.env.PORT || 3000;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var db;


mongo.connect(url, function(err, database) {
    if (err) throw err;
    db = database;
    countersCollection = db.collection('counters');
    console.log("connected to DB");

});

app.get('/', function(req, res) {
    res.render("index");

});

app.get('/:short', function(req, res) {
    var short = req.params.short;
    var full;
    db.collection('shortenedURLs').findOne({
        shortURL: short
    }, function(err, doc) {
        if (err) {
          res.send("ERROR: " + error);
            console.error(error);
        }else if(doc){
          full = doc.longURL;
          return res.redirect(full);
        } else {
          res.send("Shortened URL not found in the database.")
        }
    })

});

app.get('/new/:url*', function(req, res) {

    var longURL = req.originalUrl.slice(5);
    var shortURL = '';
    var host = req.protocol + '://' + req.get('host') + '/';
    //quick check for valid web address
    if ((longURL.includes("http://") && longURL.includes(".")) || (longURL.includes("https://") && longURL.includes("."))) {

        db.collection('shortenedURLs').findOne({
            longURL: longURL
        }, function(err, doc) {
            if (doc) {

                shortURL = doc.shortURL;
                return res.send({
                    "original url": longURL,
                    "short url": host + shortURL
                });
            } else {
                getCounter().then(function(response) {
                    shortURL = urlManager.encodeURL(response);
                    db.collection('shortenedURLs').insert({
                        _id: response,
                        longURL: longURL,
                        shortURL,
                        shortURL
                    });

                    return res.send({
                        "original url": longURL,
                        "short url": host + shortURL
                    });

                }, function(error) {
                    return res.send("ERROR: "+ error);
                    console.log(error);
                })
            }


        })

    } else {
        res.send({
            "error": "This is an invalid url request."
        });
    }

});

//get current counter from databse, return it, and iterate database by 1
//first attempt at using promises
function getCounter() {
    return new Promise(function(resolve, reject) {

        db.collection('counters').findOneAndUpdate({
            _id: 'url_count'
        }, {
            $inc: {
                sequence: 1
            }
        }, function(error, counter) {
            if (error)
                reject(error);
            var id = counter.value.sequence;
            resolve(id);
        })
    });
}

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`)
});
