var request = require('request-promise-native');
var cheerio = require('cheerio');
var validUrl = require('valid-url');

var getEdgesFromDatabase = (url) => {
    // TODO: return null if there were no edges. Otherwise return nice JSON
}

var bfsHelper = function (url, edges, toCrawl, searchDepth, level) {
    // test for presence in database first (doesn't work)
    var existingEdges = getEdgesFromDatabase(url);
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
    var helperPromise = request({url: url, jar: true});
    helperPromise.then((body) => {
        // Load HTML and get all links in page
        var $ = cheerio.load(body);
        var sourceTitle = $("title").text();
        console.log("Link <title>", sourceTitle);
        links = $('a');

        // Add all valid links to edges array
        $(links).each(function(i, link){
            var linkUrl = $(link).attr("href");
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
}

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates immediately.
// * A searchDepth of 1 performs 1 request on the root url, and then stops with
//   all the links in edges
// * A searchDepth of 2 gets all the links on each page linked to the first page
var breadthFS = function (url, searchDepth) {
    // Add root URL to toCrawl array
    var toCrawl = [{url: url, level: 0}];
    var currentDepth = 0;
    var edges = [];

    // Create a Promise to return to crawler.js
    // A Promise will immediately execute the function you pass it, but it won't
    // call the "then" callbacks until this function has called "resolve" or
    // "reject". This is different from the "then" and "catch" callbacks, which
    // resolve when they return and reject when they throw errors.
    var searchingPromise = new Promise((resolve, reject) => {
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
            var urlToCrawl = toCrawl.shift();
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
            var helperPromise = bfsHelper(urlToCrawl.url, edges, toCrawl, searchDepth, urlToCrawl.level + 1);
            // ...and do again, recursively, until a base case is reached...
            helperPromise.then(getLinksForFirstURL);
            // ...or something breaks (pretty much impossible since we catch
            // errors in the bfsHelper)
            helperPromise.catch(reject);
        }

        getLinksForFirstURL();
    });

    return searchingPromise;
}

var depthFS = function () {
    // To be implemented
}

module.exports = {
    breadthFS: breadthFS,
    depthFS: depthFS
}
