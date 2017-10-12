// Not completed list request
if(req.body['all'])
{
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
		res.send(QueryResultsToJson(JSON.stringify(rows)));
	});
}
	
	
function CrawlResultsToJson(raw) 
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