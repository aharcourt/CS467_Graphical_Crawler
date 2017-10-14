-- Desc: 			Web Crawler Creates
-- Course:			CS467
-- Semester:		Fall 2017
-- Service name = 	MySQL57
-- Admin is CowBoy12## on local MYSQL
-- iandalrymple is another user name on local MySql
-- Authors:		Hercules

-- 1) Form data sent to server containing cookie ID, username, root url, search type and depth. 
-- crawler will first check to see if the search has been performed by checking the single search table.
SELECT COUNT(Id) FROM wc_UserSearches 
WHERE CookieId = ?;

-- 2) Count for (1) is more than 0 so the user has a stored crawl so return the data set.
SELECT US.CookieId, U.Name AS 'User', US.SearchType, US.SearchDepth, URL.Url AS 'RootUrl', 
URLS.Url AS 'SourceUrl', URLD.Url AS 'DestinationUrl', URLS.Id AS 'SourceId', URLD.Id AS 'DestinationId'
FROM wc_UserSearches US 
INNER JOIN wc_SingleGraphs SG ON US.Id = SG.UserSearchId 
INNER JOIN wc_Edges E ON SG.Edge = E.Id 
INNER JOIN wc_Urls URL ON US.RootUrl = URL.Id 
INNER JOIN wc_Users U ON US.UserId = U.Id 
INNER JOIN wc_Urls URLS ON E.SorcUrlId = URLS.Id 
INNER JOIN wc_Urls URLD ON E.DestUrlId = URLD.Id 
WHERE US.CookieID = 2;

-- 3) When (1) above returns 0 means there is no cached user search so a new crawl is performed and 
-- 	  during the crawl the following inserts take place.

-- 	i) Insert into the URL table if the new root does not exist 
DELIMITER $$
CREATE PROCEDURE `wcSp_InsertUrl`(IN url text)
BEGIN
	DECLARE present int;
    SET present = 
	(
		SELECT COUNT(Id) FROM wc_Urls
		WHERE Url = url
	);
    
    IF present = 0 THEN
		INSERT INTO wc_Urls(Url) VALUES(url);	
	END IF;
END$$
CALL `webcrawler`.`wcSp_InsertUrl`(?);

-- 	ii) Insert into the user table if the user does not exist
DELIMITER $$
CREATE PROCEDURE `wcSp_InsertUser`(IN name varchar(255))
BEGIN
	DECLARE present int;
    SET present = 
	(
		SELECT COUNT(Id) FROM wc_Users
		WHERE Name = name
	);
    
    IF present = 0 THEN
		INSERT INTO wc_Users(Name) VALUES(name);	
	END IF;
END$$
CALL `webcrawler`.`wcSp_InsertUser`(?);

-- iii) Insert into the search table finally 
DELIMITER $$
CREATE PROCEDURE `wcSp_InsertSearch`(IN cookieId INT(11), IN userName varchar(255), IN sType varchar(255), IN sDepth INT(11), IN root text)
BEGIN
	DECLARE userId int;
	DECLARE urlId int;
	DECLARE curTime datetime;
	
	-- Get the user id 
	SET userId = (SELECT Id FROM wc_Users WHERE Name = userName);
	
	-- Get the urlId 
	SET urlId = (SELECT Id FROM wc_Urls WHERE Url = root);
	
	-- Get the current sys time 
	SET curTime = (SELECT NOW());
	
	-- Do the insert 
	INSERT INTO wc_UserSearches(CookieId, UserId, SearchType, SearchDepth, RootUrl, TimeOfSearch) VALUES(cookieId, userId, sType, sDepth, urlId, curTime);
	
END$$
CALL `webcrawler`.`wcSp_InsertSearch`(?, ?, ?, ?, ?);

-- iv) Insert to the edge table - looping on the client side  
DELIMITER $$
CREATE PROCEDURE `wcSp_InsertEdge`(IN sorc text, IN dest text)
BEGIN
	-- First insert the two urls into the url table. This SP checks for presence 
    CALL webcrawler.wcSp_InsertUrl(sorc);
    CALL webcrawler.wcSp_InsertUrl(dest);
    
    -- Insert the edge 
    INSERT INTO wc_edges(SorcUrlId, DestUrlId, LastTime) 
    VALUES((SELECT Id FROM wc_Urls WHERE Url = sorc), (SELECT Id FROM wc_Urls WHERE Url = dest), (SELECT NOW())); 

END$$

-- v) Insert to the single graph table for the user 
DELIMITER $$
CREATE PROCEDURE `wcSp_InsertEdgeSingleGraph`(IN cookie INT, IN sorc text, IN dest text)
BEGIN
	DECLARE sId INT(11);
    DECLARE dId INT(11);
	DECLARE eId INT(11);
		
	-- First insert the two urls into the url table. This SP checks for presence 
    CALL webcrawler.wcSp_InsertUrl(sorc);
    CALL webcrawler.wcSp_InsertUrl(dest);
    
    -- Get the edge id 
    SET sId = (SELECT Id FROM wc_Urls WHERE Url = sorc);
    SET dId = (SELECT Id FROM wc_Urls WHERE Url = dest);
    SET eId = (SELECT Id FROM wc_Edges WHERE SorcUrlId = sId AND DestUrlId = dId);
    
    -- Insert the edge to the user id'd specific table
    INSERT INTO wc_SingleGraphs(UserSearchId, Edge) 
    VALUES((SELECT Id FROM wc_UserSearches WHERE CookieId = cookie), eId); 

END$$

-- 4) Return the result set to the user. This is the same query as when the 
-- user has a cookied query in place 
SELECT * FROM wc_SingleGraphs 
WHERE UserSearchId = 
	(
		SELECT Id FROM wc_UserSearches
		WHERE CookieId = ?
	)
ORDER BY Id;