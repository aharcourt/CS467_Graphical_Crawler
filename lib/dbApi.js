var mysql = require('mysql');
var pool = mysql.createPool(
{
	host  : 'herculesinstance.c9jhafqve2yh.us-west-2.rds.amazonaws.com',
	user  : 'robbinsn',
	password: 'Samre1942??',
	database: 'WebCrawler',
	multipleStatements: true
});

module.exports = 
{	
   // Wrapper for wcSp_DoesCookieExist(IN cookie int, OUT result int)
   // Checks for the presence of this cookie in the wc_UserSearches table.
   doesCookieExist: function doesCookieExist(cookie)   
   {
       // Locals - multiple statements must be enabled in sql config to run the query like this. 
	   // This is the only way I could find to get output parameters values. It seems like a hack. 
       let queryString = "SET @result = -99; CALL wcSp_DoesCookieExist(?, @result); SELECT @result;";

       return new Promise((resolve, reject) => 
	   {
           // Run the query
           pool.query(queryString, [ cookie ], function(err, rows, fields) 
		   {
               if(err) 
			   {
                   reject(err);
                   return;
               }
			   		   
               // Get the results
               resolve(Boolean(JSON.parse(JSON.stringify(rows))[2][0]['@result']));
           });
       });
   },
   
	// Wrapper for wcSp_ReturnSetOfDestUrlsForSrc(IN sorc text)
	// Returns set of urls and associated hostnames for the destinations with the provided source
	returnSetOfDestUrls: function returnSetOfDestUrls(sorcUrl)   
	{
	   // Locals
	   let queryString = "CALL wcSp_ReturnSetOfDestUrlsForSrc(?);";

	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, [ sorcUrl ], function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(JSON.stringify(JSON.parse(JSON.stringify(rows))[0]));
		   });
	   });
	},
	
	// Wrapper for wcSp_InsertIntoTempEdges(IN s text, IN d text, IN cookie int, OUT result int)
	// Inserts into the temp edge table. Handles adding if a new URL. The wrapper will return 
	// boolean if the edge is present after execution so PASS or FAIL. 
	insertIntoTempEdges: function insertIntoTempEdges(sUrl, dUrl, cookie)   
	{
	   // Locals
	   let queryString = "SET @result = -99; CALL wcSp_InsertIntoTempEdges(?, ?, ?, @result); SELECT @result;";

	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, [ sUrl, dUrl, cookie ], function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
				// Get the results
				resolve(Boolean(JSON.parse(JSON.stringify(rows))[2][0]['@result']));
		   });
	   });
	}
};

