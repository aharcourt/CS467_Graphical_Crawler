let request = require("request-promise-native");
let cheerio = require("cheerio");
let validUrl = require("valid-url");
var resolveUrl = require('url');
let dbAPI = require("./dbApi");


// Define constants to use as flags for search results
const INVALID = -1;
const PENDING = 0;
const SUCCESS = 1;
const TERM_FOUND = 2;
const CACHED = 3;

const THRESHOLD = 50;
const TITLE = /<title>(.*)<\/title>/;
// REGEX from https://www.mkyong.com/regular-expressions/how-to-extract-html-links-with-regular-expression/
const ALL_LINKS = /href\s*=\s*("([^"]*")|'[^']*'|([^'">\s]+))/gi;
const ACTUAL_LINK = /href\s*=\s*"(.*)"/i;
const VALID_URL = new RegExp("^https?://", "i");

// Function that returns a promise to gather all links in a URL.
let getBFSLinks = function(url, level, sourceURL, sourceTitle, searchDepth, searchID, keyword, result) {

    // Make request
    let fetch = request({
        url: url,
        timeout: 30000,
        jar: true
    });
    return fetch.then((body) => {
        try {
            // Load HTML and get all links in page
            let title = body.match(TITLE);
            if (!title) { // response did not contain a <title>
                title = "";
            } else {
                title = title[1]; // get first matching group
                if (title.length > 200) {
                    title = "";
                }
            }
            console.log("Link <title>", title);

            // Insert link into temp edges table
            res = dbAPI.insertIntoTempEdges(searchID, sourceURL, sourceTitle, url, title).catch((err) => {
                console.log(err);
            });

            // Find keyword if present
            if ((keyword !== "") && (body.indexOf(keyword) > -1)) {
                // We found the search term: we're done.
                result.status = TERM_FOUND;
                result.keywordURL = url;
                return [];
            }
          
            // If URL is not a leaf node, get links
            if (level >= searchDepth) {
                body = null;
                return [];
            }
            
            let numLinks = 0;
            let linkList = [];
            let links = body.match(ALL_LINKS) || [];

            links.forEach((link) => {
                if (numLinks >= THRESHOLD) {
                    return false;
                }
                    
                let linkURL = link.match(ACTUAL_LINK);
                if (!linkURL) {
                    return;
                }
                linkURL = linkURL[1];
                
                // Try to resolve relative links with host name
                if (linkURL && !VALID_URL.test(linkURL)){
                    linkURL = resolveUrl.resolve(url, linkURL);
                }
                
                // If link looks valid, add to link list
                if (linkURL && validUrl.isUri(linkURL)) {
                    numLinks++;            
                    linkList.push({
                        "SourceURL": url,
                        "SourceTitle": title,
                        "DestinationURL": linkURL,
                    });
                }           
            });
            
            body = null;
            return linkList;
            
        } catch (error) {
            body = null;
            error.notFetchError = true;
            throw error;
        }
    }).catch((err) =>{
        if (err.notFetchError){
            delete err.notFetchError; // we don't need the key anymore and it still feels a little icky
            throw err;
        } else {
            // if the root URL is busted, we need to actually reject.
            if (level == 0) {
                throw err;
            } else {
                return [];
            }
        }
    });
};

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates immediately.
// * A searchDepth of 1 performs 1 request on the root url, and then stops with
//   all the links in edges
// * A searchDepth of 2 gets all the links on each page linked to the first page
let breadthFS = function (searchID, rootURL, searchDepth, keyword) {
    // Fill "level link list" with root to represent level 0.
    let root = [ {
        "SourceURL": "N/A",
        "SourceTitle": "N/A",
        "DestinationURL": rootURL,
    } ];
    
    // Declare result object
    let result = {
        status: PENDING,
        keywordURL: "",
    };

    function searchLevel(levelURLs, level) {
        //if (levelURLs.length > 100) {
            // return Promise.all([
            //     searchLevel(levelURLs.slice(0, 10), level),
            //     new Promise((resolve, reject) => {
            //         setTimeout(() => {
            //             searchLevel(levelURLs.slice(10), level).then(resolve, reject);
            //         }, 3000);
            //     })
            // ]);
        //    return searchLevel(levelURLs.slice(0, 100), level);
        //}
        console.log("Crawling level...", level);
        // Create promises for each link in level and store in array
        let linkPromises = levelURLs.map(function(l){
            return getBFSLinks(l.DestinationURL, level, l.SourceURL, l.SourceTitle, searchDepth, searchID, keyword, result);
        });
            // Process all promises (get array of links for each url)
        return Promise.all(linkPromises).then((links) => {
            // ISSUE: "links" returned is the body of the page loaded from my request call, instead of my nested promise result
            // Flatten array
            let mergedLinks = [].concat(...links);
            // If there is another level to process, call searchLevel again
            if (result.status == TERM_FOUND){
                return;
            }
            if (mergedLinks.length > 0) {
                return searchLevel(mergedLinks, level + 1);
            }
            else{
                result.status = SUCCESS;
                return;
            }
        });
    }

    return searchLevel(root, 0).then(() => {
        return result;
    }).catch((err) => {
        console.error(err);
        result.status = INVALID;
        return result;
    });
};

let getDFSLinks = function (sourceLinks, level, searchDepth, searchID, attempts, result, keyword) {
    // Get URL and create promise
    randomLink = sourceLinks[Math.floor(Math.random() * sourceLinks.length)];
    
    let helperPromise = request({url: randomLink.DestinationURL, jar: true});
    return helperPromise.then((body) => {
        try {
            let destLinks = [];
           
            // Load HTML and get all links in page
            let $ = cheerio.load(body);
            let title = $("title").text();
            console.log("Link <title>", title);
            
            // Insert link into temp edges table
            dbAPI.insertIntoTempEdges(searchID, randomLink.SourceURL, randomLink.SourceTitle, randomLink.DestinationURL, title).catch((err) => {
                console.log(err);
            });
            
            // Find keyword if present
            if ((keyword !== "") && (body.indexOf(keyword) > -1)) {
                // We found the search term: we're done.
                result.status = TERM_FOUND;
                result.keywordURL = randomLink.DestinationURL;
                return;
            } 
            
            let links = $("a");
            let numLinks = 0;
            
            // Loop through page links and find valid-looking links
            $(links).each(function(i, link){
                let linkURL = $(link).attr("href");
                
                // Try to resolve relative links with host name
                if (linkURL && !VALID_URL.test(linkURL)){
                    linkURL = resolveUrl.resolve(randomLink.DestinationURL, linkURL);
                }
                
                // If link looks valid, add it to array (up to 50 links)
                if (linkURL && validUrl.isUri(linkURL)) {                
                    numLinks++;
                    destLinks.push({
                        "SourceURL": randomLink.DestinationURL,
                        "SourceTitle": title,
                        "DestinationURL": linkURL
                    });
                }
                // Once 50 links that look valid are added, return list
                if (numLinks >= THRESHOLD) {
                    return false;
                } 
            });
            
            return destLinks;
        } catch (error) {
            body = null;
            error.notFetchError = true;
            throw error;
        }   
    }).catch((err) => {
        if (err.notFetchError){
            delete err.notFetchError;
            throw error;
        } else if (level === 0) {
            // if the root URL is busted, we need to actually reject.
            throw err;
        } else if (attempts > 30) {
           return [];
        } else {
            return getDFSLinks(sourceLinks, level, searchDepth, searchID, attempts+1, result, keyword);
        }
    });

};

// Note on searchDepth parameter:
// * A searchDepth of 0 terminates with one edge (the root)
// * A searchDepth of n performs a search depth of n, beginning at the rootUrl
//   and following random nodes until a depth of n is reached.
// Will return 1 for successful search, -1 for search that terminated early, and 2
// for search where the search term was found.
let depthFS = function (searchID, rootURL, searchDepth, keyword) {
    let root = [ {
        "SourceURL": "N/A",
        "SourceTitle": "N/A",
        "DestinationURL": rootURL,
    } ];

    // Declare result object
    let result = {
        status: PENDING,
        keywordURL: ""
    };
    
    return searchingPromise = new Promise((resolve, reject) => {
        // Search random links until the searchDepth is reached.
        function getRandomLink(links, level) {

            // If searchDepth is reached, return
            if (level > searchDepth) {
                result.status = SUCCESS;
                resolve(result);
                return;
            }

            // Call getDFSLinks to get links from a valid URL in the current link list
            let helperPromise = getDFSLinks(links, level, searchDepth, searchID, 0, result, keyword);

            return helperPromise.then((links) => {
                // If term is found, return
                if (result.status == TERM_FOUND) {
                    resolve(result);
                    return;
                }  
                
                // If link has child links, keep searching 
                if (links && links.length > 0) {
                    return getRandomLink(links, level + 1);
                }
                
                // If search hits dead end, return results
                else{
                    result.status = SUCCESS;
                    resolve(result);
                    return;
                }
            }).catch((err) => {
                console.error(err);
                result.status = INVALID;
                return result;
            });
        }
        
        getRandomLink(root, 0);
    });

};

// Adds search tree to the database.
let addToDB = function(searchID, result, url, cookie, searchType, searchDepth, keyword, keywordURL) {
    return dbAPI.insertNewTree(searchID, url, "Ian Dalrymple", cookie, searchType, searchDepth, keyword, keywordURL).then(() => {
        return result;
    });
    
};

// Returns if search is already cached, routes to proper search function if
// crawler needs to be run.
let crawl = function(searchType, rootURL, searchDepth, cookie, searchID, keyword, searchExists){
    if (searchExists) {
        return Promise.resolve({ status: CACHED });
    } else if (searchType === "BFS") {
        return breadthFS(searchID, rootURL, searchDepth, keyword).then((result) => {
            console.log(result);
            if (result.status === INVALID) {
                return Promise.resolve(result);
            } else {
                return addToDB(searchID, result, rootURL, cookie, "BFS", searchDepth, keyword, result.keywordURL);
            }
        });
    } else if (searchType === "DFS") {
        return depthFS(searchID, rootURL, searchDepth, keyword).then((result) => {
            console.log(result);
            if (result.status === INVALID) {
                return Promise.resolve(result);
            } else {
                return addToDB(searchID, result, rootURL, cookie, "DFS", searchDepth, keyword, result.keywordURL);
            }
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
    CACHED: CACHED
};
