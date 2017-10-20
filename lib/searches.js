let request = require("request-promise-native");
let cheerio = require("cheerio");
let validUrl = require("valid-url");

let getEdgesFromDatabase = (url) => {
    // TODO: return null if there were no edges. Otherwise return nice JSON
};

let bfsHelper = function (url, edges, toCrawl, searchDepth, level) {
    // test for presence in database first (doesn't work)
    let existingEdges = getEdgesFromDatabase(url);
    if (existingEdges) {
        existingEdges.forEach((edge) => {
            edges.push(edge);
        });
        // We don't want to continue and make an HTTP request, but we also don't
        // have a promise to return yet. Because breadthFS called us and expects
        // a promise, we have to be sure to return one. This may seem hard to
        // remember, but my work IDE has a rule which tells you when you have
        // inconsistent return statements. I'll add linting to this project, but
        // for now we just remember to return a promise. The native Promise
        // class has a handy shortcut for creating a promise which is already
        // resolved, which is exactly what we want.
        return Promise.resolve();
        // There's a similar static method Promise.reject() for making rejected
        // promises, as well.
    }
    // Get URL. If there is an error, do not add URL to toCrawl list
    let helperPromise = request({url: url, jar: true});
    helperPromise.then((body) => {
        // Load HTML and get all links in page
        let $ = cheerio.load(body);
        let sourceTitle = $("title").text();
        console.log("Link title", sourceTitle);
        let links = $("a");

        // Add all valid links to edges array
        $(links).each(function(i, link){
            let linkUrl = $(link).attr("href");
            if(linkUrl != "javascript:void(0)" && validUrl.isUri(linkUrl)){
                edges.push({
                    "SourceUrl": url,
                    "SourceTitle": sourceTitle,
                    "DestinationUrl": linkUrl,
                    "Level": level
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
let breadthFS = function (url, searchDepth) {
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
            if (toCrawl.length === 0) {
                // we have no more links, resolve the promise with our results.
                resolve(edges);
                return;
            }

            // remove the first url from the array and search it.
            let urlToCrawl = toCrawl.shift();
            if (urlToCrawl.level >= searchDepth) {
                // we have searched all the links up to searchDepth. We're done.
                resolve(edges);
                return;
            }
            if (urlToCrawl.level > currentDepth) {
                // we are finished with the "current" level and have reached a new one
                console.log("Crawling level " + urlToCrawl.level + "...");
                currentDepth = urlToCrawl.level;
            }

            // we still have searching to do...
            let helperPromise = bfsHelper(urlToCrawl.url, edges, toCrawl, searchDepth, urlToCrawl.level + 1);
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

let dfsHelper = function (url, edges, level) {
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
        let links = $("a");

        // Loop through random page links until an absolute link that looks valid is found.
        while (!isValid){
            if (((typeof(randomUrl) == "undefined" || !validUrl.isUri(randomUrl)) || !r.test(randomUrl)) && numInvalidLinks < 50) {
                randomUrl = $($(links).get(Math.floor(Math.random() * $(links).length))).attr("href");
                numInvalidLinks++;
                continue;
            }
            // If page loops for valid links 50 times, conclude there are none and return.
            if(numInvalidLinks == 50){
                console.log("No more links. Sending results...");
                break;
            }
            // If link looks valid, add to edge list and return.
            isValid = true;
            numInvalidLinks = 0;
            edges[level] = ({
                "SourceUrl": url,
                "SourceTitle": sourceTitle,
                "DestinationUrl": randomUrl,
                "Level": level + 1
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
let depthFS = function (rootUrl, searchDepth) {
    let currentDepth = 0;
    let edges = [];
    let nextUrl = rootUrl;

    let searchingPromise = new Promise((resolve, reject) => {
        console.log("Crawling level 0...");

        // Get random links until the searchDepth is reached.
        function getRandomLink(url) {
            if (currentDepth >= searchDepth) {
                resolve(edges);
                return;
            }

            let helperPromise = dfsHelper(nextUrl, edges, currentDepth);

            helperPromise.then(() => {
                // If link error, return results thus far.
                if (edges[currentDepth] === undefined){
                    resolve(edges);
                }
                nextUrl = edges[currentDepth].DestinationUrl;
                currentDepth++;
                console.log("Crawling level " + currentDepth + "...");
                // Get another random link recursively.
                getRandomLink(nextUrl);
            });

            helperPromise.catch((err) => {
                resolve(edges);
                return;
            });
        }

        getRandomLink(nextUrl);
    });

    return searchingPromise;
};

module.exports = {
    breadthFS: breadthFS,
    depthFS: depthFS
};
