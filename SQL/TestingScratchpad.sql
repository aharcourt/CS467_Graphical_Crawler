-- Testing Selects 
SELECT * FROM wc_TempEdges;
SELECT * FROM wc_Users;
SELECT * FROM wc_Urls;
SELECT * FROM wc_Edges;
SELECT * FROM wc_UserSearches WHERE Id = 92;
SELECT * FROM wc_SingleGraphs WHERE UserSearchId = 92;

-- Order of operations 
SET @resLocal = -99;
CALL wcSp_DoesCookieExist(11, @resLocal);
SELECT @resLocal; SET @resLocal = -99;

CALL wcSp_GetExistingTree(8);
SELECT @resLocal; SET @resLocal = -99;

CALL wcSp_ReturnSetOfDestUrlsForSrc("http://9");
SELECT @resLocal; SET @resLocal = -99;

CALL wcSp_InsertIntoTempEdges("http://15", "http://16", 11, @resLocal);
SELECT @resLocal; SET @resLocal = -99;

CALL wcSp_InsertNewTree("http://newCookie", "RogerPedacker", 11, "BFS", 22, @resLocal);
SELECT @resLocal; SET @resLocal = -99;

DELETE FROM wc_TempEdges;
SET @url1 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '1'));
SET @url2 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '2'));
SET @url3 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '3'));
SET @url4 = CONCAT('http://', CONCAT(CAST(unix_timestamp() AS char), '4'));
SET @maxCookie = (SELECT MAX(CookieId) FROM wc_UserSearches);
INSERT INTO wc_TempEdges(SorcUrl, DestUrl, CookieId)   
VALUES(@url1, @url2, (@maxCookie + 1)), (@url3, @url4, (@maxCookie + 1));

SELECT * FROM wc_TempEdges;