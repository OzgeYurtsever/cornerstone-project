DROP DATABASE IF EXISTS medical_image;	

CREATE DATABASE medical_image;

USE medical_image;

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
);