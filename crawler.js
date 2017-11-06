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

// POST to sign in to a user account (just a name)
app.post("/signin", function(req, res, next) {
    let name = req.body.Name;
    console.log("POST /signin", name);
    if (!name) {
        res.status = 400;
        res.send("400 - Bad Request");
        return;
    }
    dbAPI.getUserID(name).then((userID) => {
        // If no user, create one. Future crawls will add to this user's crawls
        if (userID == null) {
            // TODO: ask the DB for a new user id so they aren't possibly clashing
            userID = Math.floor(Math.random() * (90000)) + 10000;
        }
        res.cookie("UserID", userID);
        res.cookie("Name", name);

        // TODO: these should probably be one request, but it's weird to return
        // two kinds of things.
        return dbAPI.getPreviousSearches(userID).then((prevSearches) => {
            res.send(prevSearches);
        });
    }).catch((err) => {
        next(err);
    });
});

// POST to crawler
app.post("/crawl", function(req, res, next) {
    let user = {
        id: req.cookies.UserID,
        name: req.cookies.Name
    };
    let searchType = req.body.SearchType;
    let searchDepth = req.body.SearchDepth;
    let rootURL = req.body.RootURL;
    let keyword = req.body.Keyword || ""; // the default keyword is an empty string so the SP doesn't explode.
    let keywordURL = req.body.KeywordURL || "";
    console.log("POST /crawl", searchType, rootURL);

    // Check if search is already cached for user
    let isSearch = dbAPI.doesSearchExist(user.id, user.name, searchType, searchDepth, rootURL, keyword, keywordURL);

    isSearch.then((searchExists) => {

        let crawl;
        if (searchExists) {
            // Mimic a successful crawl which found the expected keywordURL
            let fakeResult = {
                status: keywordURL === "" ? search.SUCCESS : search.TERM_FOUND,
                keywordURL: keywordURL,
            };
            crawl = Promise.resolve(fakeResult);
        } else {
            crawl = search.crawl(searchType, rootURL, searchDepth, user, keyword);
        }

        crawl.then((result) => {
            // Extract the resulting crawl, which was stored during search.crawl
            let cachedSearch = dbAPI.getExistingTree(user.id, user.name, searchType, searchDepth, rootURL, keyword, result.keywordURL);

            // Get tree from database and return it with metadata
            cachedSearch.then((edges) => {
                let response = new Object();
                response.result = result;
                response.Edges = JSON.parse(edges);

                res.send(response);
            });
            cachedSearch.catch((err) => {
                throw err;
            });
        });
        crawl.catch((err) => {
            throw err;
        });

        return crawl;
    });
    isSearch.catch((err) => {
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
