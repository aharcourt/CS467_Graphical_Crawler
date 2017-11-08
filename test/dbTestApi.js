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
   deleteOldSearches: function deleteOldSearches()   
   {
       let queryString = "CALL TEST_wcSp_DeleteOldSearches();";
       return new Promise((resolve, reject) => 
	   {
           // Run the query
           pool.query(queryString, function(err, rows, fields) 
		   {
               if(err) 
			   {
                   reject(err);
                   return;
               }
			   		   
               // Get the results
			   resolve(rows[0][0].wcSp_DeleteOldSearches);
           });
       });
   },
   
	doesSearchExist: function doesSearchExist()   
	{
	   let queryString = "CALL TEST_wcSp_DoesSearchExist();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_DoesSearchExist);
		   });
	   });
	},
	
	insertConfig: function insertConfig()   
	{
	   let queryString = "CALL TEST_wcSp_InsertConfig();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertConfig);
		   });
	   });
	},

	insertEdge: function insertEdge()   
	{
	   let queryString = "CALL TEST_wcSp_InsertEdge();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertEdge);
		   });
	   });
	},

	insertEdgeSingleGraph: function insertEdgeSingleGraph()   
	{
	   let queryString = "CALL TEST_wcSp_InsertEdgeSingleGraph();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertEdgeSingleGraph);
		   });
	   });
	},

	insertIntoTempEdges: function insertIntoTempEdges()   
	{
	   let queryString = "CALL TEST_wcSp_InsertIntoTempEdges();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertIntoTempEdges);
		   });
	   });
	},
	
	insertKeyword: function insertKeyword()   
	{
	   let queryString = "CALL TEST_wcSp_InsertKeyword();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertKeyword);
		   });
	   });
	},
	
	insertNewTree: function insertNewTree()   
	{
	   let queryString = "CALL TEST_wcSp_InsertNewTree();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertNewTree);
		   });
	   });
	},
	
	insertSearch: function insertSearch()   
	{
	   let queryString = "CALL TEST_wcSp_InsertSearch();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertSearch);
		   });
	   });
	},
	
	insertUrl: function insertUrl()   
	{
	   let queryString = "CALL TEST_wcSp_InsertUrl();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertUrl);
		   });
	   });
	},
	
	insertUser: function insertUser()   
	{
	   let queryString = "CALL TEST_wcSp_InsertUser();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
		   {
			   if(err) 
			   {
				   reject(err);
				   return;
			   }
					   
			   // Get the results
			   resolve(rows[0][0].wcSp_InsertUser);
		   });
	   });
	},
	
	getExistingTree: function getExistingTree()   
	{
	   let queryString = "CALL TEST_wcSp_GetExistingTree();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
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
	
	returnSetOfDestUrlsForSrc: function returnSetOfDestUrlsForSrc()   
	{
	   let queryString = "CALL TEST_wcSp_ReturnSetOfDestUrlsForSrc();";
	   return new Promise((resolve, reject) => 
	   {
		   // Run the query
		   pool.query(queryString, function(err, rows, fields) 
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