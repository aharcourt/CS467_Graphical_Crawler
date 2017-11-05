-- SPUT
call WebCrawler.TEST_wcSp_GetExistingTree();

-- Testing Selects 
SELECT * FROM wc_TempEdges;
SELECT * FROM wc_Edges;
SELECT * FROM wc_Users;
SELECT * FROM wc_Urls;
SELECT * FROM wc_SearchKeywords;
SELECT * FROM wc_UserSearches;
SELECT * FROM wc_SingleGraphs;

SET SQL_SAFE_UPDATES = 0;
-- DELETE FROM wc_TempEdges; DELETE FROM wc_SearchKeywords; DELETE FROM wc_SingleGraphs;
SET SQL_SAFE_UPDATES = 1;
DELETE FROM wc_SingleGraphs WHERE UserSearchId = (SELECT Id FROM wc_UserSearches WHERE CookieId = 1);
DELETE FROM wc_UserSearches WHERE CookieId = 1; 
DELETE FROM wc_Urls WHERE Url IN('TESTROOT','TESTKWURL');
DELETE FROM wc_SearchKeywords WHERE SearchKeyword = 'TESTKWTEXT';
DELETE FROM wc_Users WHERE `Name` = 'TESTUSER';