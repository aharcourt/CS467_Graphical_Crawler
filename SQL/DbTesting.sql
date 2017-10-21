-- CS467 database testing script
-- Run this script after every change to any element of the database.
-- This will ensure the core functionality have not been compromised. 

-- 1) wcSp_DoesCookieExist
SET @resLocal = -99; SET @countLocal = -99;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
SET @url3 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '3'));
SET @url4 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '4'));
SET @maxCookie = (SELECT MAX(CookieId) FROM wc_UserSearches);
INSERT INTO wc_TempEdges(SorcUrl, DestUrl, CookieId)   
VALUES(@url1, @url2, (@maxCookie + 1)), (@url3, @url4, (@maxCookie + 1));
CALL wcSp_InsertNewTree('TESTROOT', 'TESTUSER', (@maxCookie + 1), 'TESTTYPE', 22, @resLocal);
SET @resLocal = -99;
CALL wcSp_DoesCookieExist((@maxCookie + 2), @resLocal); -- DOES NOT EXIST BASIC PRESENCE
SELECT IF(@resLocal = 0, 'PASSED', 'FAILED') AS `wc_DoesCookieExist NOT Present`;
SET @resLocal = -99;
CALL wcSp_DoesCookieExist((@maxCookie + 1), @resLocal); -- DOES EXIST BASIC PRESENCE
SELECT IF(@resLocal = 1, 'PASSED', 'FAILED') AS `wc_DoesCookieExist Present`;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = @maxCookie + 1);
DELETE FROM wc_UserSearches WHERE CookieId = @maxCookie + 1;
DELETE FROM wc_TempEdges WHERE DestUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_TempEdges WHERE SorcUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_Edges WHERE SorcUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Edges WHERE DestUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4, 'TESTROOT');
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER';
SET SQL_SAFE_UPDATES = 1;

-- 2) wcSp_InsertConfig
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
SET @resLocal = -99;
CALL wcSp_InsertConfig(999, 'TEST PARAM', 'TEST VALUE', @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_Configuration WHERE Id = 999 AND `Desc` = 'TEST PARAM' AND `Value` = 'TEST VALUE');
SELECT IF(@resLocal = 1 AND @countLocal = 1, 'PASSED', 'FAILED') AS `wcSp_InsertConfig`;
DELETE FROM wc_Configuration WHERE Id = 999 AND `Desc` = 'TEST PARAM' AND `Value` = 'TEST VALUE';
SET SQL_SAFE_UPDATES = 1;

-- 3) wcSp_InsertUrl
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @resLocal = -99;
CALL wcSp_InsertUrl(@url1, @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_Urls WHERE Url = @url1);
SELECT IF(@resLocal = 1 AND @countLocal = 1, 'PASSED', 'FAILED') AS `wcSp_InsertUrl`;
DELETE FROM wc_Urls WHERE Url = @url1;
-- SELECT * FROM wc_Urls; SELECT @url1;
SET SQL_SAFE_UPDATES = 1;

-- 4) wc_InsertSearch
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
INSERT INTO wc_Users(`Name`) VALUES('TESTUSER');
INSERT INTO wc_Urls(Url) VALUES('TESTROOT');
SET @maxCookie = (SELECT MAX(CookieId) FROM wc_UserSearches);
CALL wcSp_InsertSearch((@maxCookie + 1), 'TESTUSER', 'TESTTYPE', 12, 'TESTROOT', @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_UserSearches WHERE CookieId = (@maxCookie + 1));
SELECT IF(@resLocal = 1 AND @countLocal = 1, 'PASSED', 'FAILED') AS `wcSp_InsertSearch`;
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER';
DELETE FROM wc_Urls WHERE Url = 'TESTROOT';
DELETE FROM wc_UserSearches WHERE CookieId = (@maxCookie + 1); 
SET SQL_SAFE_UPDATES = 1;

-- 5) wc_InsertEdge 
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
CALL wcSp_InsertEdge(@url1, @url2, @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_Urls WHERE Url IN(@url1, @url2));
SET @countLocal = @countLocal + (SELECT COUNT(Id) FROM wc_Edges WHERE SorcUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url1) 
AND DestUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url2));
SELECT IF(@resLocal = 1 AND @countLocal = 3, 'PASSED', 'FAILED') AS `wcSp_InsertEdge`;
DELETE FROM wc_Edges WHERE SorcUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url1)
AND DestUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url2);
DELETE FROM wc_Urls WHERE Url IN(@url1, @url2);
SET SQL_SAFE_UPDATES = 1;

-- 6) wc_InsertIntoTempEdges 
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
SET @nextCookie = (SELECT MAX(CookieId) FROM wc_UserSearches) + 1;
CALL wcSp_InsertIntoTempEdges(@url1, @url2, @nextCookie, @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_TempEdges WHERE SorcUrl = @url1 AND DestUrl = @url2 AND CookieId = @nextCookie); 
SELECT IF(@resLocal = 1 AND @countLocal = 1, 'PASSED', 'FAILED') AS `wcSp_InsertIntoTempEdges`;
DELETE FROM wc_TempEdges WHERE SorcUrl = @url1 AND DestUrl = @url2 AND CookieId = @nextCookie;
SET SQL_SAFE_UPDATES = 1;

-- 7) wcSp_InsertEdgeSingleGraph
SET @resLocal = -99; SET @countLocal = -99;
SET SQL_SAFE_UPDATES = 0;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
INSERT INTO wc_Users(`Name`) VALUES('TESTUSER');
INSERT INTO wc_Urls(Url) VALUES('TESTROOT');
SET @nextCookie = (SELECT MAX(CookieId) FROM wc_UserSearches) + 1;
CALL wcSp_InsertSearch(@nextCookie, 'TESTUSER', 'TESTTYPE', 12, 'TESTROOT', @resLocal);
CALL wcSp_InsertEdge(@url1, @url2, @resLocal);
CALL wcSp_InsertEdgeSingleGraph(@nextCookie, @url1, @url2, @resLocal);
SET @countLocal = (SELECT COUNT(Id) FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = @nextCookie));
SELECT IF(@resLocal = 1 AND @countLocal = 1, 'PASSED', 'FAILED') AS `wcSp_InsertEdgeSingleGraph`;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = @nextCookie);
DELETE FROM wc_UserSearches WHERE CookieId = @nextCookie; 
DELETE FROM wc_Edges WHERE SorcUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url1) AND DestUrlId = (SELECT Id FROM wc_Urls WHERE Url = @url2);
DELETE FROM wc_Urls WHERE Url IN('TESTROOT', @url1, @url2);
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER'; DELETE FROM wc_Urls WHERE Url = 'TESTROOT';
SET SQL_SAFE_UPDATES = 1;

-- 8) wcSp_InsertNewTree
SET SQL_SAFE_UPDATES = 0;
SET @resLocal = -99; SET @countLocal = -99;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
SET @url3 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '3'));
SET @url4 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '4'));
SET @nextCookie = (SELECT MAX(CookieId) FROM wc_UserSearches) + 1;
-- SELECT @nextCookie, @url1, @url2, @url3, @url4;
INSERT INTO wc_TempEdges(SorcUrl, DestUrl, CookieId)   
VALUES(@url1, @url2, @nextCookie), (@url3, @url4, @nextCookie);
CALL wcSp_InsertNewTree('TESTROOT', 'TESTUSER', @nextCookie, 'TESTTYPE', 22, @resLocal);
SET @urlPres = (SELECT COUNT(Id) FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4, 'TESTROOT'));
SET @usrPres = (SELECT COUNT(Id) FROM wc_Users WHERE `Name` = 'TESTUSER');
SET @edgPres = (SELECT COUNT(Id) FROM wc_Edges WHERE SorcUrlId IN((SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4))));
SET @schPres = (SELECT COUNT(Id) FROM wc_UserSearches WHERE CookieId = @nextCookie);
SET @trePres = (SELECT COUNT(Id) FROM wc_SingleGraphs 
WHERE Edge IN((SELECT Id FROM wc_Edges WHERE SorcUrlId IN((SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4))))));
SET @temPres = (SELECT COUNT(Id) FROM wc_TempEdges WHERE CookieId = @nextCookie);
-- SELECT @urlPres, @usrPres, @edgPres, @schPres, @trePres;
SELECT IF(@resLocal = 2, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree proc call result`;
SELECT IF(@temPres = 0, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree edges left in temp table`;
SELECT IF(@urlPres = 5, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree URLs present`;
SELECT IF(@usrPres = 1, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree user present`;
SELECT IF(@edgPres = 2, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree edges present`;
SELECT IF(@schPres = 1, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree usersearch present`;
SELECT IF(@trePres = 2, 'PASSED', 'FAILED') AS `wcSp_InsertNewTree edges in single graph present`;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = @nextCookie);
DELETE FROM wc_UserSearches WHERE CookieId = @nextCookie;
DELETE FROM wc_TempEdges WHERE DestUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_TempEdges WHERE SorcUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_Edges WHERE SorcUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Edges WHERE DestUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4, 'TESTROOT');
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER';
SET SQL_SAFE_UPDATES = 1;

-- 9) wcSp_GetExistingTree
SET SQL_SAFE_UPDATES = 0;
SET @resLocal = -99; SET @countLocal = -99;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
SET @url3 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '3'));
SET @url4 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '4'));
SET @nextCookie = (SELECT MAX(CookieId) FROM wc_UserSearches) + 1;
-- SELECT @nextCookie, @url1, @url2, @url3, @url4;
INSERT INTO wc_TempEdges(SorcUrl, DestUrl, CookieId)   
VALUES(@url1, @url2, @nextCookie), (@url3, @url4, @nextCookie);
CALL wcSp_InsertNewTree('TESTROOT', 'TESTUSER', @nextCookie, 'TESTTYPE', 22, @resLocal);
SET @urlPres = (SELECT COUNT(Id) FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4, 'TESTROOT'));
SET @usrPres = (SELECT COUNT(Id) FROM wc_Users WHERE `Name` = 'TESTUSER');
SET @edgPres = (SELECT COUNT(Id) FROM wc_Edges WHERE SorcUrlId IN((SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4))));
SET @schPres = (SELECT COUNT(Id) FROM wc_UserSearches WHERE CookieId = @nextCookie);
SET @trePres = (SELECT COUNT(Id) FROM wc_SingleGraphs 
WHERE Edge IN((SELECT Id FROM wc_Edges WHERE SorcUrlId IN((SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4))))));
SET @temPres = (SELECT COUNT(Id) FROM wc_TempEdges WHERE CookieId = @nextCookie);
-- SELECT @urlPres, @usrPres, @edgPres, @schPres, @trePres;
CALL wcSp_GetExistingTree(@nextCookie);
SET SQL_SAFE_UPDATES = 0;
DELETE FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = @nextCookie);
DELETE FROM wc_UserSearches WHERE CookieId = @nextCookie;
DELETE FROM wc_TempEdges WHERE DestUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_TempEdges WHERE SorcUrl IN(@url1, @url2, @url3, @url4);
DELETE FROM wc_Edges WHERE SorcUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Edges WHERE DestUrlId IN (SELECT Id FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4));
DELETE FROM wc_Urls WHERE Url IN(@url1, @url2, @url3, @url4, 'TESTROOT');
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER';
SET SQL_SAFE_UPDATES = 1;