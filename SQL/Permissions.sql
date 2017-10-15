USE WebCrawler;
CREATE USER 'harcoura'@'%' IDENTIFIED BY 'Samre1942??';
Grant SELECT on *.* to 'harcoura'@'%';
Grant INSERT on *.* to 'harcoura'@'%';
Grant UPDATE on *.* to 'harcoura'@'%';
Grant CREATE on *.* to 'harcoura'@'%';
GRANT EXECUTE ON *.* TO 'harcoura'@'%';

CREATE USER 'robbinsn'@'%' IDENTIFIED BY 'Samre1942??';
Grant SELECT on *.* to 'robbinsn'@'%';
Grant INSERT on *.* to 'robbinsn'@'%';
Grant UPDATE on *.* to 'robbinsn'@'%';
Grant CREATE on *.* to 'robbinsn'@'%';
GRANT EXECUTE ON *.* TO 'robbinsn'@'%';

-- SELECT * FROM information_schema.user_privileges;
-- DROP USER 'harcoura'@'%'; DROP USER 'robbinsn'@'%';