let express = require("express");
let bodyParser = require("body-parser");
let search = require("./lib/searches");
let cookieParser = require("cookie-parser");
let dbAPI = require("./lib/dbApi");

// Create server object
let app = express();

// Set port
app.set("port", 5545);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("public"));

// Route to main page
app.get("/", function(req, res, next) {
    console.log("GET /");
    res.sendFile("index.html");
});

// POST to crawler
app.post("/crawl", function(req, res, next) {
    let cookie = req.cookies.cookieID;
    let searchID = new Date().valueOf();
    let keyword = req.body.Keyword || "";

    // If no cookie, create one
    if (cookie == undefined) {
        cookie = Math.floor(Math.random() * (90000) + 10000);
        res.cookie("cookieID", cookie);
    }
    console.log("POST /crawl", req.body.RootURL, req.body.SearchType, cookie);

    // Check if search is already cached for user
    let isSearch = dbAPI.doesSearchExist(cookie, "Ian Dalrymple", req.body.SearchType, req.body.SearchDepth, req.body.RootURL, keyword);

    return isSearch.then((searchExists) => {
        let crawl = search.crawl(req.body.SearchType, req.body.RootURL, req.body.SearchDepth, cookie, searchID, keyword, searchExists);

        return crawl.then((result) => {
            let cachedSearch = dbAPI.getExistingTree(cookie, "Ian Dalrymple", req.body.SearchType, req.body.SearchDepth, req.body.RootURL, keyword);

            // Get tree from database and return it with metadata
            return cachedSearch.then((edges) => {
                let response = new Object();
                response.Result = result;
                response.Edges = JSON.parse(edges);
                res.send(response);
            });
        });
    }).catch((err) => {
        next(err);
        return;
    });
});

// 404 Error
app.use(function(req, res){
    res.status(404);
    res.send("404 - Page not found.");
});

// 500 Error
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type("plain/text");
    res.status(500);
    res.send("500 - Something went wrong.");
});

let server = app.listen(app.get("port"), function(){
    console.log("Express started on http://flip3.engr.oregonstate.edu:" + app.get("port") + "; press Ctrl-C to terminate.");
});

module.exports = server; // for testing
