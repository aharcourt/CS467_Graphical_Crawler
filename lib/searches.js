var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var validUrl = require('valid-url');

var bfsHelper = function (url, edges, toCrawl, searchDepth, level, callback) { 
    // Get URL. If there is an error, do not add URL to toCrawl list
request({url: url, jar: true}, function(err, resp, body){
        if(!err) {
            // Load HTML and get all links in page
            var $ = cheerio.load(body);
            var sourceTitle = $("title").text();
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
        }
        callback();
    });
}


var breadthFS = function (url, searchDepth, edges, callback) {  
    // Add root URL to toCrawl array
    var toCrawl = [{url: url, level: 0}];
    var currentDepth = 0;
    
    // While searchDepth not reached, continue to crawl
    async.whilst(function() {
        return currentDepth < searchDepth;
    },
    function(next) {
        console.log("Crawling level " + (currentDepth + 1) + "...");
        
        // Crawl each URL in toCrawl array
        async.each(toCrawl, function(urlToCrawl, callback) {
            if (urlToCrawl.level == currentDepth) {
                bfsHelper(urlToCrawl.url, edges, toCrawl, searchDepth, currentDepth + 1, function(){ 
                    callback();
                });       
            }
        }, function(err){
            if (err){
                callback(err);
                return;
            }
            // Pop all crawled URLs from toCrawl list
            for (i = 0; i < toCrawl.length; i++){
                if(toCrawl[0] && toCrawl[0].level == currentDepth) {
                    toCrawl.shift();
                }
            }
            // Continue to next search depth level
            currentDepth++;             
            next();
        }); 
    },
    function(err) {;
        console.log("Finished crawling!")
        callback(err);
    });
}

var depthFS = function () {
    // To be implemented
}

module.exports = {
    breadthFS: breadthFS,
    depthFS: depthFS
}