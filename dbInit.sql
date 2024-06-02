-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS barni;

-- Connect to the kuoyo database
\c barni;

-- Drop existing tables if they exist
/*
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS users_keys;
DROP TABLE IF EXISTS access_control;
*/

CREATE TABLE users (
    username VARCHAR(24) PRIMARY KEY,
    firstname VARCHAR(48),
    lastname VARCHAR(48),
    nickname VARCHAR(48),
    email VARCHAR(128),
    is_disabled SMALLINT DEFAULT 0
);

ALTER TABLE users ADD COLUMN dictionary_id INT;

CREATE TABLE users_keys (
    username VARCHAR(24) PRIMARY KEY,
    password VARCHAR(128),
    password_date TIMESTAMP DEFAULT '1970-01-01 00:00:00',
    token VARCHAR(32),
    token_date TIMESTAMP
);

CREATE TABLE access_control (
    id SERIAL PRIMARY KEY,
    username VARCHAR(24),
    auth_code VARCHAR(48),
    auth_grant VARCHAR(8)
);

CREATE TABLE dictionaries (
    dictionary_id SERIAL PRIMARY KEY,
    dictionary_name VARCHAR(48)
);

CREATE TABLE dictionaries_entries (
    dictionary_id INT,
    tag VARCHAR(128),
    tag_name VARCHAR(128),
    PRIMARY KEY (dictionary_id, tag)
);

CREATE TABLE devices (
    device VARCHAR(48),
    property VARCHAR(128),
    value VARCHAR(128),
    PRIMARY KEY (device, property)
);
