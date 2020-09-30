\c jobly-test

DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;


CREATE TABLE companies (
   handle text PRIMARY KEY,
   name text NOT NULL UNIQUE,
   num_employees integer,
   description text,
   logo_url text
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title text NOT NULL,
    salary float NOT NULL,
    equity float NOT NULL,
    company_handle text NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted date DEFAULT CURRENT_DATE NOT NULL,
    CHECK (equity <= 1)
);

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL UNIQUE,
    photo_url text,
    is_admin boolean DEFAULT false NOT NULL
);

INSERT INTO companies
    VALUES ('goog', 'Google', 5000, 'Largest search engine', 'www.google.com'),
           ('appl', 'Apple', 2000, 'Maker of Macintosh', 'www.apple.com');

INSERT INTO jobs
    VALUES (1, 'SWE', 125000.50, 0.01, 'goog'),
           (2, 'RE', 110000, 0.02, 'goog'),
           (3, 'UXD', 115000, 0.03, 'goog'),
           (4, 'UXD', 99000.30, 0.05, 'appl'),
           (5, 'CE', 145000, 0.1, 'appl');