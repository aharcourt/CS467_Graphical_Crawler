// Canned set up code for the server. This is copied directly from the 
// instructor's "express-forms" project folder from GIT. 
var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('mysql');

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
	host  : 'mysql.eecs.oregonstate.edu',
	user  : 'cs290_harcoura',
	password: '0996',
	database: 'cs290_harcoura'
});


// When called from the query string in the browser initially
app.get('/',function(req,res,next)
{
	var context = {};
	res.render("home", context);
});

// Check if a cookie is present. Return Count(Id) for present 
// 0 for not present and -1 for error
function isCookiePresent(sqlPool, cookie)
{
	// Query string define 
	queryString = 'SELECT COUNT(Id) AS Count FROM wc_UserSearches ' 
	queryString += 'WHERE CookieId = ?';

	// Run the query 
	sqlPool.query(queryString,[cookie], function(err, rows, fields)
	{		
		if(err)
		{
			console.log(err.message);
			return -1;
		}
		
		// Check the results for the count value 		
		console.log("isCookiePresent Count(Id) " + String(rows[0].Count));
		return rows[0].Count;
	});
}

// Helper function to wrap up the javascipt into the json string 
// Example of what the results should look like below.
// {
	// "MetaData": {
		// "CookieId": 4,
		// "User": "Ian",
		// "SearchType": "BFS",
		// "SearchDepth": 3,
		// "RootUrl": "google.com"
	// },
	// "Edges": [{
		// "SourceUrl": "google.com",
		// "SourceId": 1,
		// "DestinationUrl": "yahoo.com"
		// "DestinationId": 2
	// }, {
		// "SourceUrl": "google.com",
		// "SourceId": 1,
		// "DestinationUrl": "yahoo.com"
		// "DestinationId": 2
	// }]
// }
function crawlerResultsToJson(raw) 
{
	// Define the return string 
	var retStr = '{"MetaData": {"CookieId":';
	
	// Create a json object 
	var oJson = JSON.parse(raw); 
	
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
		// Check if the cookie id exists 
		var result = isCookiePresent(pool, 2);
		console.log(result);
		return;
		
		// Make the query string to pull back a single user query 
		var queryString = 'SELECT US.CookieId, U.Name AS \'User\', US.SearchType, US.SearchDepth,'
		queryString += ' URL.Url AS \'RootUrl\', URLS.Url AS \'SourceUrl\', URLD.Url AS \'DestinationUrl\',' 
		queryString += ' URLS.Id AS \'SourceId\', URLD.Id AS \'DestinationId\''
		queryString += ' FROM wc_UserSearches US'
		queryString += ' INNER JOIN wc_SingleGraphs SG ON US.Id = SG.UserSearchId'
		queryString += ' INNER JOIN wc_Edges E ON SG.Edge = E.Id'
		queryString += ' INNER JOIN wc_Urls URL ON US.RootUrl = URL.Id'
		queryString += ' INNER JOIN wc_Users U ON US.UserId = U.Id'
		queryString += ' INNER JOIN wc_Urls URLS ON E.SorcUrlId = URLS.Id'
		queryString += ' INNER JOIN wc_Urls URLD ON E.DestUrlId = URLD.Id'
		queryString += ' WHERE US.CookieID = 2;'	
		
		// Call the select statement
		pool.query(queryString, function(err, rows, fields)
		{		
			if(err)
			{
				res.type('text/plain');	
				res.send(err);
				return;
			}
			res.type('text/plain');	
			res.send(crawlerResultsToJson(JSON.stringify(rows)));
		});
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


