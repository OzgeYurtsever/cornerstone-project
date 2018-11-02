DROP DATABASE IF EXISTS medical_image;	

CREATE DATABASE medical_image;

USE medical_image;

-- CREATE TABLE users (
--     id int NOT NULL AUTO_INCREMENT,
--     user varchar(30) NOT NULL UNIQUE,
--     file_name varchar(100) NOT NULL,
--     -- primary key(id)
--     KEY (file_name), -- <---- this is newly added index key
--     PRIMARY KEY(id)
-- );

CREATE TABLE annotations (
    id int NOT NULL AUTO_INCREMENT,
	user varchar(30) NOT NULL,
	file_name VARCHAR(100) NOT NULL,
	ann_name VARCHAR(100) NOT NULL,
    start_x int NOT NULL,
    start_y int NOT NULL,
    end_x int NOT NULL,
    end_y int NOT NULL,
    PRIMARY KEY(id)

    -- INDEX (user), 
    -- INDEX (file_name), 

    -- FOREIGN KEY (user)
    --     REFERENCES users(id)
    --     ON DELETE CASCADE ON UPDATE CASCADE,
    -- FOREIGN KEY (file_name)
    --     REFERENCES users(file_name)
    --     ON DELETE CASCADE ON UPDATE CASCADE
);