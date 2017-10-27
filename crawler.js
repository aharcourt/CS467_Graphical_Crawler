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
    res.sendFile("index.html");
});

// POST to crawler
app.post("/crawl", function(req, res, next) {
    let cookie = req.cookies.cookieID; 
     
    // If no cookie, create one
    if (cookie === undefined) { 
        let cookie = Math.floor(Math.random() * (90000) + 10000); 
        res.cookie('cookieID', cookie);
    } 
    
    // Check if search is already cached for user
    let isSearch = dbAPI.doesSearchExist(1, 'Ian Dalrymple', req.body.SearchType, req.body.SearchDepth, req.body.RootURL);
    
    
    isSearch.then((results) => {
        return results;
    }).then((searchExists) => {
        // If search is cached, return results
        if (searchExists) {
            let cachedSearch = dbAPI.getExistingTree(1, 'Ian Dalrymple', req.body.SearchType, req.body.SearchDepth, req.body.RootURL);
            cachedSearch.then((edges) => { 
                res.send(edges);
            });
            cachedSearch.catch((err) => {
                next(err);
                return;
            });
        // If search is not cached, perform DFS or BFS search
        } else {
            if(req.body.SearchType == "BFS") {
                // return a promise from search.breadthFS. Now we can add success and
                // failure handlers to the promise instead of as a callback. "then"
                // handlers are called when a promise resolve, and "catch" handlers are
                // called when it rejects (this happens automatically if there's an
                // error). When a handler returns, its return value (or thrown error) is
                // packacged into the same promise, so you can call it like:
                // promise.then(stuffWhichReturnsANumber);
                // promise.then(stuffWhichUsesThatNumber);
                // promise.catch(stuffToDoWithErrors);
                let bfs = search.breadthFS(req.body.RootURL, req.body.SearchDepth, cookie);

                bfs.then((edges) => {
                    res.send(edges);
                });

                bfs.catch((err) => {
                    next(err);
                    return;
                });
            } else if (req.body.SearchType === "DFS") {
                let dfs = search.depthFS(req.body.RootURL, req.body.SearchDepth, cookie);

                dfs.then((edges) => {
                    res.send(edges);
                });

                dfs.catch((err) => {
                    next(err);
                    return;
                });
            } else {
                throw new Error("Invalid SearchType");
            }
        }
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

app.listen(app.get("port"), function(){
    console.log("Express started on http://flip3.engr.oregonstate.edu:" + app.get("port") + "; press Ctrl-C to terminate.");
});
