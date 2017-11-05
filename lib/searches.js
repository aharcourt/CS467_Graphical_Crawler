let request = require("request-promise-native");
let cheerio = require("cheerio");
let validUrl = require("valid-url");
let dbAPI = require("./dbApi");

// define constants to use as flags for search results
const INVALID = -1;
const PENDING = 0;
const SUCCESS = 1;
const TERM_FOUND = 2;

let bfsHelper = function (url, edges, toCrawl, searchDepth, level, cookie, rootUrl) {
    // Get URL. If there is an error, do not add URL to toCrawl list
    let helperPromise = request({url: url, jar: true});
    helperPromise.then((body) => {
        // Load HTML and get all links in page
        let $ = cheerio.load(body);
        let sourceTitle = $("title").text();
        console.log("Link <title>", sourceTitle);
        let links = $("a");

        // Add all valid links to edges array
        $(links).each(function(i, link){
            let linkUrl = $(link).attr("href");
            if(linkUrl != "javascript:void(0)" && validUrl.isUri(linkUrl)){
                edges.push({
                    "SourceUrl": url,
                    "SourceTitle": sourceTitle,
                    "DestinationUrl": linkUrl,
                    "TermFound": false
                });

                // Insert link into temp edges table
                let tempInsert = dbAPI.insertIntoTempEdges(url, linkUrl, cookie, "Ian Dalrymple", "BFS", searchDepth, rootUrl);
                tempInsert.catch((err) =>  {
                    throw err;
                });

                // Add links that need to be crawled to toCrawl array
                if (level < searchDepth) {
                    toCrawl.push({
                        url: linkUrl,
                        level: level
                    });
                }
            }
        });
    });
    helperPromise.catch((err) => {
        // We don't do anything if there is an error. The helperPromise object,
        // which was "rejected" by whatever caused this error, is changed to
        // "resolved" when it calls this "catch" handler. After this is done doing
        // whatever it needs to with the error (nothing, in this case), the
        // helperPromise will continue through its list of callbacks as though
        // nothing went wrong. For us, since we return this promise and chain a
        // then handler below, the next "then" is called which will search the
        // next link in the list.
    });

    return helperPromise;
};

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates immediately.
// * A searchDepth of 1 performs 1 request on the root url, and then stops with
//   all the links in edges
// * A searchDepth of 2 gets all the links on each page linked to the first page
let breadthFS = function (url, searchDepth, cookie) {
    // Add root URL to toCrawl array
    let toCrawl = [ {url: url, level: 0} ];
    let currentDepth = 0;
    let edges = [];

    // Create a Promise to return to crawler.js
    // A Promise will immediately execute the function you pass it, but it won't
    // call the "then" callbacks until this function has called "resolve" or
    // "reject". This is different from the "then" and "catch" callbacks, which
    // resolve when they return and reject when they throw errors.
    let searchingPromise = new Promise((resolve, reject) => {
        console.log("Crawling level 0...");

        // Removing the first element of an array and adding to the end makes the
        // array act like a queue. If you remember from data structures, a queue
        // was used for BFS. The links we get from the first URL will go on the
        // end of the queue, and we will search everything else before reaching
        // them. Then we have to do all of the to see the results from the
        // second link, etc, etc, until either there are no links or we reach
        // the search depth.
        function getLinksForFirstURL() {
            if (toCrawl.length == 0) {
                resolve(1);
                return;
            }

            // remove the first url from the array and search it.
            let urlToCrawl = toCrawl.shift();
            if (urlToCrawl.level > currentDepth) {
                // we are finished with the "current" level and have reached a new one
                console.log("Crawling level " + urlToCrawl.level + "...");
                currentDepth = urlToCrawl.level;
            }

            // we still have searching to do...
            let helperPromise = bfsHelper(urlToCrawl.url, edges, toCrawl, searchDepth, urlToCrawl.level + 1, cookie, url);
            // ...and do again, recursively, until a base case is reached...
            helperPromise.then(getLinksForFirstURL);
            // ...or something breaks (pretty much impossible since we catch
            // errors in the bfsHelper)
            helperPromise.catch(reject);
        }

        getLinksForFirstURL();
    });

    return searchingPromise;
};

let dfsHelper = function (url, edges, currentDepth, keyword, result) {
    // Get URL and create promise
    let helperPromise = request({url: url, jar: true});
    helperPromise.then((body) => {
        let r = new RegExp("^https?://", "i");
        let numInvalidLinks = 0;
        let randomUrl = "";
        let isValid = false;

        // Load HTML and get all links in page
        let $ = cheerio.load(body);
        let sourceTitle = $("title").text();
        console.log("Link <title>", sourceTitle);
        if ((keyword !== "") && (body.indexOf(keyword) > -1)) {
            // We found the search term: we're done.
            result.status = TERM_FOUND;
            result.keywordURL = url;
            result.keywordTitle = sourceTitle;
            return;
        }
        let links = $("a");

        // Loop through random page links until an absolute link that looks valid is found.
        while (!isValid){
            if (((typeof(randomUrl) == "undefined" || !validUrl.isUri(randomUrl)) || !r.test(randomUrl)) && numInvalidLinks < 20) {
                randomUrl = $($(links).get(Math.floor(Math.random() * $(links).length))).attr("href");
                numInvalidLinks++;
                continue;
            }
            // If page loops for valid links 20 times, conclude there are none and return.
            if(numInvalidLinks == 20){
                console.log("No more links. Sending results...");
                result.status = INVALID;
                return;
            }
            // If link looks valid, add to edge list and return.
            isValid = true;
            numInvalidLinks = 0;
            edges[currentDepth] = ({
                "SourceUrl": url,
                "SourceTitle": sourceTitle,
                "DestinationUrl": randomUrl,
                // TODO: I don't think we can know the DestinationTitle yet.
                "DestinationTitle": "",
                "TermFound": false
            });
        }
    });

    helperPromise.catch((err) => {
        throw err;
    });

    return helperPromise;
};

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates immediately.
// * A searchDepth of n performs a search depth of n, beginning at the rootUrl
//   and following random nodes until a depth of n is reached.
// Will return 1 for successful search, -1 for search that terminated early, and 2
// for search where the search term was found.
let depthFS = function (rootUrl, searchDepth, cookie, keyword) {
    let currentDepth = 0;
    let edges = [];
    let nextUrl = rootUrl;
    let rootTitle;

    let result = {
        status: PENDING,
        keywordURL: "",
        keywordTitle: "" // only used internally
    };

    let searchingPromise = new Promise((resolve, reject) => {
        console.log("Crawling level 0...");

        // Get random links until the searchDepth is reached.
        function getRandomLink(url) {

            // If searchDepth is reached, insert the tree into the database
            if (currentDepth >= searchDepth) {
                result.status = SUCCESS;
                resolve(result);
                return;
            }

            // Call dfsHelper to insert the next random link into the edge array
            let helperPromise = dfsHelper(nextUrl, edges, currentDepth, keyword, result);

            helperPromise.then(() => {
                // If the search is no longer pending, return the results
                if (result.status !== PENDING) {
                    resolve(result);
                    return;
                }
                // If we haven't defined the rootTitle yet, this is the first edge.
                if (!rootTitle) {
                    rootTitle = edges[currentDepth].SourceTitle || "--";
                }

                // Otherwise insert link into temp edges table asynchronously.
                // TODO: it this dangerous? We might call insertNewTree right after this.
                let edge = edges[currentDepth];
                dbAPI.insertIntoTempEdges(
                    edge.SourceUrl,
                    edge.SourceTitle,
                    edge.DestinationUrl,
                    edge.DestinationTitle,
                    cookie,
                    "Ian Dalrymple",
                    "DFS",
                    searchDepth,
                    rootUrl,
                    rootTitle,
                    keyword,
                    // TODO: keywordURL is not known until the search ends, but
                    // is required here while the search is in progress.
                    (result.status === TERM_FOUND) ? result.keywordURL : "",
                    (result.status === TERM_FOUND) ? result.keywordTitle : ""
                );

                nextUrl = edges[currentDepth].DestinationUrl;
                currentDepth++;
                console.log("Crawling level " + currentDepth + "...");

                // Get another random link recursively.
                getRandomLink(nextUrl);
            });

            helperPromise.catch((err) => {
                reject(err);
                return;
            });
        }

        getRandomLink(nextUrl);
    });

    return searchingPromise;
};

// Adds search tree to the database.
let addToDB = function(result, url, cookie, searchType, searchDepth, keyword) {
    return dbAPI.insertNewTree(url, "Ian Dalrymple", cookie, searchType, searchDepth, keyword, result.keywordURL).then(() => {
        return result;
    });
};

// Routes to proper search function, resolves to -1 if the search is malformed.
let crawl = function(searchType, rootURL, searchDepth, cookie, keyword) {
    if (searchType === "BFS") {
        return breadthFS(rootURL, searchDepth, cookie, keyword).then((result) => {
            return addToDB(result, rootURL, cookie, "BFS", searchDepth, keyword);
        });
    } else if (searchType === "DFS") {
        return depthFS(rootURL, searchDepth, cookie, keyword).then((result) => {
            return addToDB(result, rootURL, cookie, "DFS", searchDepth, keyword);
        });
    } else {
        return Promise.resolve({ status: INVALID, keywordURL: "" });
    }
};

module.exports = {
    crawl: crawl,
    INVALID: INVALID,
    SUCCESS: SUCCESS,
    TERM_FOUND: TERM_FOUND,
};
