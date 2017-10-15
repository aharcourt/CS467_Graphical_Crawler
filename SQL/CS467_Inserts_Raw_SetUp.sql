-- Urls
INSERT INTO wc_Urls(Url) 
VALUES('http://www.google.com'),('http://www.yahoo.com'),
('http://www.Ermas.com'),('http://www.Ermas/home.com'),
('http://www.Ermas/store.com'),('http://www.Ermas/flavors.com');

-- Users 
 INSERT INTO wc_Users(Name) 
 VALUES('Ian Dalrymple'),('Raymond'),
 ('Samuel'),('Sara'),('Timmy');
 
 -- User searches
 INSERT INTO wc_UserSearches(CookieId, UserId, SearchType, SearchDepth, RootUrl, TimeOfSearch) 
 VALUES(2,2,'BFS',6,3,(SELECT NOW())),(1,1,'DFS',3,1,(SELECT NOW()));
 
 -- Edges
 INSERT INTO wc_Edges(SorcUrlId, DestUrlId, LastTime) 
 VALUES(1,3,(SELECT NOW())), (1,4,(SELECT NOW())),(1,5,(SELECT NOW())),
 (1,6,(SELECT NOW())),(3,6,(SELECT NOW()));
 
 -- Single Graphs 
 INSERT INTO wc_SingleGraphs(UserSearchId, Edge) 
 VALUES(1,1),(1,3),(1,4),(1,5),(2,5),(2,6),(2,7);
 
 INSERT INTO wc_TempEdges(SorcUrl, DestUrl, CookieId) VALUES("https://yahoos.com", "http://methodicalillusion.com", 3), ("https://yaho.com", "http://lunacy.com", 3);