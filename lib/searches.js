let request = require("request-promise-native");
let cheerio = require("cheerio");
let validUrl = require("valid-url");
let dbAPI = require("./dbApi");


// Function that returns a promise to gather all links in a URL.  
let getLinks = function(url, level, sourceURL, sourceTitle, searchDepth, searchID) {

    // Make request
    let fetch = request({url: url, jar: true});
    fetch.then((body) => {
        let searchingPromise = new Promise((resolve, reject) => {
            
            // Load HTML and get all links in page
            let $ = cheerio.load(body);
            let title = $("title").text();
            console.log("Link <title>", title); 

             // Insert link into temp edges table
            let tempInsert = dbAPI.insertIntoTempEdges(searchID, sourceURL, sourceTitle, url, title);   
            tempInsert.catch((err) =>  {
                throw err;
            });

            // If URL is not a leaf node, get links
            if (level < searchDepth) {
                var linkList = [];
                let links = $("a");
               
                $(links).each(function(i, link){
                    let linkUrl = $(link).attr("href");
                    if(linkUrl != "javascript:void(0)" && validUrl.isUri(linkUrl)){
                        linkList.push({
                            "SourceUrl": url,
                            "SourceTitle": title,
                            "DestinationUrl": linkUrl,
                        });
                    }
                });
                resolve(linkList);
                return;
            }
            else{
                resolve([]);
                return;
            }
        });
        
        return searchingPromise;
        
    }).catch((err) =>{
        if (level == 0){
            throw err; 
        }
        else{
            Promise.resolve([]);
            return;
        }
    });
    
    return fetch; 
};

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates immediately.
// * A searchDepth of 1 performs 1 request on the root url, and then stops with
//   all the links in edges
// * A searchDepth of 2 gets all the links on each page linked to the first page
let breadthFS = function (searchID, rootURL, searchDepth) {
    // Fill "level link list" with root to represent level 0.
    let root = [{
        "SourceURL": "N/A",
        "SourceTitle": "N/A",
        "DestinationUrl": rootURL,
    }];
    
    function searchLevel(levelURLs, level) {
       let searchingPromise = new Promise((resolve, reject) => {
            // Create promises for each link in level and store in array
            let linkPromises = levelURLs.map(function(l){
                return getLinks(l.DestinationUrl, level, l.SourceURL, l.SourceTitle, searchDepth, searchID);
            });
            // Process all promises (get array of links for each url)
            Promise.all(linkPromises).then((links) => {
                // ISSUE: "links" returned is the body of the page loaded from my request call, instead of my nested promise result
                // Flatten array
                let mergedLinks = [].concat.apply([], links);
                // If there is another level to process, call searchLevel again
                if (mergedLinks.length > 0) {
                    searchLevel(mergedLinks, level + 1);
                }  
                // If finished searching, resolve promise
                else {
                   resolve(1);
                   return;
                }
            }).catch((err) => {
                resolve(-1);
                return;
            });
       });
       
       return searchingPromise;
    };
    
    return searchLevel(root, 0);
};

let dfsHelper = function (url, edges, level, currentDepth) {
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
            if (((typeof(randomUrl) == "undefined" || !validUrl.isUri(randomUrl)) || !r.test(randomUrl)) && numInvalidLinks < 20) {
                randomUrl = $($(links).get(Math.floor(Math.random() * $(links).length))).attr("href");
                numInvalidLinks++;
                continue;
            }
            // If page loops for valid links 20 times, conclude there are none and return.
            if(numInvalidLinks == 20){
                console.log("No more links. Sending results...");
                return;
            }
            // If link looks valid, add to edge list and return.
            isValid = true;
            numInvalidLinks = 0;
            edges[level] = ({
                "SourceUrl": url,
                "SourceTitle": sourceTitle,
                "DestinationUrl": randomUrl,
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
let depthFS = function (rootUrl, searchDepth, cookie) {
    let currentDepth = 0;
    let edges = [];
    let nextUrl = rootUrl;
    let linkError = false;

    let searchingPromise = new Promise((resolve, reject) => {
        console.log("Crawling level 0...");

        // Get random links until the searchDepth is reached.
        function getRandomLink(url) {
            
            // If searchDepth is reached, insert the tree into the database
            if (currentDepth >= searchDepth) {
                resolve(1);
                return;
            } 
            
            // Call dfsHelper to insert the next random link into the edge array
            let helperPromise = dfsHelper(nextUrl, edges, currentDepth);

            helperPromise.then(() => {
                // If link error, return results thus far.
                if (edges[currentDepth] === undefined){
                    resolve(-1);
                    return;
                }
               
                if (edges[currentDepth].termFound === true){
                    resolve(2);
                    return;
                }
                // Insert link into temp edges table
                let tempInsert = dbAPI.insertIntoTempEdges(edges[currentDepth].SourceUrl, edges[currentDepth].DestinationUrl, cookie, 'Ian Dalrymple', 'DFS', searchDepth, rootUrl);   
            
                tempInsert.catch((err) =>  {
                    throw err;
                });
               
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
let addToDB = function(searchID, returnValue, url, cookie, searchType, searchDepth, keyword, keywordURL) { 
    if (returnValue == -1) {
        return -1;
    }
    else {
        return dbAPI.insertNewTree(searchID, url, 'Ian Dalrymple', cookie, searchType, searchDepth, keyword, keywordURL).then(() => { 
            return returnValue; 
        }); 
    }
};

// Returns 1 if search is already cached, routes to proper search function if
// crawler needs to be run. 
let crawl = function(searchType, rootURL, searchDepth, cookie, searchID, keyword, searchExists){
    if (searchExists) {
      return Promise.resolve(1);
    } else if (searchType === "BFS") {
        return breadthFS(searchID, rootURL, searchDepth).then((result) => {
            return addToDB(searchID, result, rootURL, cookie, "BFS", searchDepth, keyword, "");
        });
    } else if (searchType === "DFS") {
        return depthFS(rootURL, searchDepth, cookie).then((result) => {
             return addToDB(searchID, result, rootURL, cookie, "DFS", searchDepth, keyword, "");
        });
    } else {
        return Promise.resolve(-1);
    }
    
    return crawlPromise;
};

module.exports = {
    crawl: crawl
};
