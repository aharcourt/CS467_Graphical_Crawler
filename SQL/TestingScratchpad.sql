-- Testing Selects 
SELECT * FROM wc_TempEdges;
SELECT * FROM wc_Users;
SELECT * FROM wc_Urls;
SELECT * FROM wc_Edges;
SELECT * FROM wc_UserSearches;
SELECT * FROM wc_SingleGraphs;

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
