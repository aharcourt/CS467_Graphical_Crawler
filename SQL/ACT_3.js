// Canned set up code for the server. This is copied directly from the 
// instructor's "express-forms" project folder from GIT. 
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('mysql');
var dbApi = require('./dbApi');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

// Create connection pool to local instance and student database in that instance
// Only do once at the top 
// var pool = mysql.createPool(
// {
	// host  : 'localhost',
	// user  : 'root',
	// password: 'CowBoy12##',
	// database: 'webcrawler'
// });

var pool = mysql.createPool(
{
	host  : 'herculesinstance.c9jhafqve2yh.us-west-2.rds.amazonaws.com',
	user  : 'robbinsn',
	password: 'Samre1942??',
	database: 'WebCrawler'
});


// When called from the query string in the browser initially
app.get('/',function(req,res,next)
{
	var context = {};
	res.render("home", context);
});

function crawlerResultsToJson(raw) 
{
	// Define the return string 
	var retStr = '{"MetaData": {"CookieId":';
	
	// Create a json object 
	var oJson = raw; 
	
	// Grab the pieces for the metadata 
	var CookieId = oJson[0].CookieId;
	var User = oJson[0].User;
	var SearchType = oJson[0].SearchType;
	var SearchDepth = oJson[0].SearchDepth;
	var RootUrl = oJson[0].RootUrl;
	
	// Add in the meta data
	retStr += String(CookieId) + ',';
	retStr += '"User":"' + String(User) + '",';
	retStr += '"SearchType":"' + String(SearchType) + '",';
	retStr += '"SearchDepth":' + String(SearchDepth) + ',';
	retStr += '"RootUrl":"' + String(RootUrl) + '"},"Edges":[';
		
	// Loop and get the edges 
	for(let i = 0; i < oJson.length; i++)
	{
		retStr += '{"SourceUrl":"' + String(oJson[i].SourceUrl) + '",'
		retStr += '"SourceId":' + String(oJson[i].SourceId) + ','
		retStr += '"DestinationUrl":"' + String(oJson[i].DestinationUrl) + '",'
		retStr += '"DestinationId":' + String(oJson[i].SourceId) + '},'
	}
	
	retStr = retStr.slice(0, -1) + ']}'
	return retStr;
}

// Post handling - two buttons: one for completed and one 
// for stuff that is not completed 
app.post('/',function(req,res)
{
	var context = {};
	var list = [];
	
	// Not completed list request
	if(req.body['all'])
	{
		// wcSp_DoesCookieExist
		// var cookie = parseInt(req.body.cookie); 
		// var promiseResult = dbApi.doesCookieExist(cookie);
		// promiseResult.then
		// (
			// function(result)
			// {
				// res.type('text/plain');
				// res.send("wcSp_DoesCookieExist with cookie " + String(cookie) + " : " + result);
			// }
		// );	

		// wcSp_ReturnSetOfDestUrlsForSorc
		// var sorcUrl = String(req.body.sorc); 
		// var promiseResult = dbApi.returnSetOfDestUrls(sorcUrl);
		// promiseResult.then
		// (
			// function(result)
			// {
				// res.type('text/plain');
				// res.send("wcSp_ReturnSetOfDestUrlsForSorc with source url " + String(sorcUrl) + " : \n" + result);
			// }
		// );
		
		// wcSp_InsertIntoTempEdges
		// var sorc = String(req.body.sorc); 
		// var dest = String(req.body.dest);
		// var cookie = parseInt(req.body.cookie);
		// var promiseResult = dbApi.insertIntoTempEdges(sorc, dest, cookie);
		// promiseResult.then
		// (
			// function(result)
			// {
				// res.type('text/plain');
				// res.send("wcSp_InsertIntoTempEdges for cookie : " + String(cookie) + "\n" + result);
			// }
		// );	

		// wcSp_InsertNewTree
		// var root = String(req.body.root); 
		// var user = String(req.body.user);
		// var cookie = parseInt(req.body.cookie);
		// var srchtype = String(req.body.type);
		// var srchdepth = parseInt(req.body.depth);
		// var promiseResult = dbApi.insertNewTree(root, user, cookie, srchtype, srchdepth);
		// promiseResult.then
		// (
			// function(result)
			// {
				// res.type('text/plain');
				// res.send("wcSp_InsertNewTree: " + String(result) +  " records inserted.");
			// }
		// );
		
		// wcSp_ReturnSetOfDestUrlsForSorc
		var cookie = String(req.body.cookie); 
		var promiseResult = dbApi.getExistingTree(cookie);
		promiseResult.then
		(
			function(result)
			{
				res.type('text/plain');
				res.send("wcSp_GetExistingTree with cookieId " + String(cookie) + " : \n" + result);
			}
		);	
	}	
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});


