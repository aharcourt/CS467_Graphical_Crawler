-- Desc: 		Web Crawler Creates
-- Course:		CS467
-- Semester:	Fall 2017
-- Service name = MySQL57
-- Admin is CowBoy12## on local MYSQL
-- iandalrymple
-- Authors:		Hercules

-- Drop the tables if they already exist. Start with a clean slate.
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `wc_Urls`;
DROP TABLE IF EXISTS `wc_Edges`;
DROP TABLE IF EXISTS `wc_Users`;
DROP TABLE IF EXISTS `wc_UserSearches`;
DROP TABLE IF EXISTS `wc_SingleGraphs`;
SET FOREIGN_KEY_CHECKS = 1;

-- List of URL's 
CREATE TABLE IF NOT EXISTS wc_Urls 
(
	Id int(11) NOT NULL AUTO_INCREMENT,
	Url text NOT NULL,
	
	PRIMARY KEY (Id),
	
	UNIQUE KEY Url (Url(767))
	
) ENGINE=InnoDB;

-- Cumulative edge list
CREATE TABLE IF NOT EXISTS wc_Edges 
(
	Id int(11) NOT NULL AUTO_INCREMENT,
	SorcUrlId int(11) NOT NULL,
	DestUrlId int(11) NOT NULL,
	LastTime datetime NOT NULL,

	PRIMARY KEY (Id),

	FOREIGN KEY (SorcUrlId) REFERENCES wc_Urls(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (DestUrlId) REFERENCES wc_Urls(Id) ON DELETE CASCADE ON UPDATE CASCADE
  
) ENGINE=InnoDB;

-- Users 
CREATE TABLE IF NOT EXISTS wc_Users 
(
  Id int(11) NOT NULL AUTO_INCREMENT,
  Name varchar(255) NOT NULL,
  
  PRIMARY KEY (Id),
  
  UNIQUE KEY Name(Name)
  
) ENGINE=InnoDB;

-- Search meta data 
CREATE TABLE IF NOT EXISTS wc_UserSearches 
(
	Id int(11) NOT NULL AUTO_INCREMENT,
	CookieId int(11) NOT NULL,
	UserId int(11) NOT NULL,
	SearchType varchar(255) NOT NULL,
	SearchDepth int(11) NOT NULL,
	RootUrl int(11) NOT NULL,
	TimeOfSearch datetime NOT NULL,
	
	PRIMARY KEY (Id),
	
	UNIQUE KEY CookieId (CookieId),
	
	FOREIGN KEY (UserId) 	REFERENCES 	wc_Users(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (RootUrl) 	REFERENCES wc_Urls(Id) ON DELETE CASCADE ON UPDATE CASCADE
	
) ENGINE=InnoDB;

-- User saved searches which are subset of wc_Edges. Needs to be cleaned up based on
-- date from foreign key wc_Searches
CREATE TABLE IF NOT EXISTS wc_SingleGraphs
(
	Id int(11) NOT NULL AUTO_INCREMENT,
	UserSearchId int(11) NOT NULL,
	Edge int(11) NOT NULL,

	PRIMARY KEY (Id),
	FOREIGN KEY (UserSearchId) 	REFERENCES 	wc_UserSearches(Id) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Edge) 			REFERENCES 	wc_Edges(Id) ON DELETE CASCADE ON UPDATE CASCADE
	
)ENGINE=InnoDB;
