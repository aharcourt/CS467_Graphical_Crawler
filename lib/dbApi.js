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
	/* Wrapper for`wcSp_DoesSearchExist`(
											IN cookie int,
											IN user varchar(255),
											IN srchtype varchar(255),
											IN srchdepth int,
											IN root text,
											IN kwordtext text,
											IN kwordurl text,
											OUT result int
										) */
	// Checks for the presence of this search in the wc_UserSearches table.
   doesSearchExist: function doesSearchExist(cookie, usr, stype, sdepth, root, kwtxt, kwurl)   
   {
       // Locals - multiple statements must be enabled in sql config to run the query like this.
	   // This is the only way I could find to get output parameters values. It seems like a hack.
       let queryString = "SET @result = -99; CALL wcSp_DoesSearchExist(?, ?, ?, ?, ?, ?, ?, @result); SELECT @result;";

       return new Promise((resolve, reject) =>
	   {
           // Run the query
           pool.query(queryString, [ cookie, usr, stype, sdepth, root, kwtxt, kwurl ], function(err, rows, fields)
		   {
               if(err)
			   {
                   reject(err);
                   return;
               }

               // Get the results
			   resolve(Boolean(rows[2][0]['@result']));
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

	/* Wrapper for `wcSp_InsertIntoTempEdges`(
												IN s text,
												IN sTitle text,
												IN d text,
												IN dTitle text,
												IN cookie int,
												IN username varchar(255),
												IN stype varchar(255),
												IN sdepth int,
												IN root text,
												IN rTitle text,
												IN kwordtext text,
												IN kwordurl text,
												IN kwUrlTitle text,
												OUT result int
											)
	*/
	// Inserts into the temp edge table. Handles adding if a new URL. The wrapper will return
	// boolean if the edge is present after execution so PASS or FAIL.
	insertIntoTempEdges: function insertIntoTempEdges(sUrl, sTitle, dUrl, dTitle, cookie, user, stype, sdepth, root, rTitle, kwtxt, kwurl, kwurlTitle)
	{
	   // Locals
	   let queryString = "SET @result = -99; CALL wcSp_InsertIntoTempEdges(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result); SELECT @result;";

	   return new Promise((resolve, reject) =>
	   {
		   // Run the query
		   pool.query(queryString, [ sUrl, sTitle, dUrl, dTitle, cookie, user, stype, sdepth, root, rTitle, kwtxt, kwurl, kwurlTitle ], function(err, rows, fields)
		   {
			   if(err)
			   {
				   reject(err);
				   return;
			   }

				// Get the results
				resolve(Boolean(rows[2][0]['@result']));
		   });
	   });
	},

	/* Wrapper for`wcSp_InsertNewTree`	(
											IN root text,
											IN userIn varchar(255),
											IN cookie int,
											IN typeIn varchar(255),
											IN depthIn int,
											IN kwordtext text,
											IN kwordurl text,
											OUT result int
										) */
	// Insert statement that is the workhorse. Intended to be called when the crawl is complete and the temp edges table
	// has been fully populated. Performs insert of user, root, search, and edges into wc_Edges and into wc_SingleGraphs.
	// Returns the number of records that have been inserted into wc_SingleGraphs. The intent is the caller will compare this to
	// the number of edges they thought should have been inserted and make an accept reject decision accordingly.
	insertNewTree: function insertNewTree(root, user, cookie, srchtype, srchdepth, kwtxt, kwurl)
	{
	   // Locals
	   let queryString = "SET @result = -99; CALL wcSp_InsertNewTree(?, ?, ?, ?, ?, ?, ?, @result); SELECT @result;";

	   return new Promise((resolve, reject) =>
	   {
		   // Run the query
		   pool.query(queryString, [ root, user, cookie, srchtype, srchdepth, kwtxt, kwurl ], function(err, rows, fields)
		   {
			   if(err)
			   {
				   reject(err);
				   return;
			   }

				// Get the results
				resolve(rows[2][0]['@result']);
		   });
	   });
	},

	/* Wrapper for `wcSp_GetExistingTree`(
											IN cookie int,
											IN user varchar(255),
											IN srchtype varchar(255),
											IN srchdepth int,
											IN root text,
											IN kwordtext text,
											IN kwordurl text
										) */
	// Returns set of records for a specific user search identified by a specific cookie
	getExistingTree: function getExistingTree(cookie, user, stype, sdepth, root, kwtxt, kwurl)
	{
	   // Locals
	   let queryString = "CALL wcSp_GetExistingTree(?, ?, ?, ?, ?, ?, ?);";

	   return new Promise((resolve, reject) =>
	   {
		   // Run the query
		   pool.query(queryString, [ cookie, user, stype, sdepth, root, kwtxt, kwurl ], function(err, rows, fields)
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

};
