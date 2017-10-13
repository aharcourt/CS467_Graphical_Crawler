var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var bodyParser = require('body-parser');
var mysql = require('./lib/dbcon');
var search = require('./lib/searches');

// Create server object
var app = express();

// Set port 
app.set('port', 5545);
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('public'));

// Route to main page
app.get('/', function(req, res, next) {
    res.sendFile('index.html');
});

// POST to crawler
app.post('/crawl', function(req, res, next) {
    var edges = [];
    
    if(req.body.SearchType == "BFS") {
        search.breadthFS(req.body.RootURL, req.body.SearchDepth, edges, function(err){
            if(err){ 
                next(err); 
                return; 
            }
            res.send(edges);
        });
    }
});

// 404 Error
app.use(function(req,res){
   res.status(404)
   res.send('404 - Page not found.');
});

// 500 Error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500)
  res.send('500 - Something went wrong.');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://flip3.engr.oregonstate.edu:' + app.get('port') + '; press Ctrl-C to terminate.');
});
