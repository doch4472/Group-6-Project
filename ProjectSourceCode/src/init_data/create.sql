-- DROP TABLE IF EXISTS users;

-- CREATE TABLE users(
--     id SERIAL PRIMARY KEY,
--     username VARCHAR(50) NOT NULL,
--     email VARCHAR(50) NOT NULL,
--     password CHAR(60) NOT NULL
-- );

-- -- Holding off of these for now, in case of future use --

-- -- CREATE TABLE recipe (
-- --     id SERIAL PRIMARY KEY,
-- --     title VARCHAR(100) NOT NULL,
-- --     description VARCHAR(100) NOT NULL,
-- --     ingredients VARCHAR(100) NOT NULL,
-- --     author VARCHAR(100) NOT NULL, -- Move the NOT NULL constraint to the correct position
-- --     date_created VARCHAR(100) NOT NULL,
-- --     image VARCHAR(100) NOT NULL,
-- --     image_title VARCHAR(100) NOT NULL
-- -- );


-- -- CREATE TABLE recipe_to_author(
-- --     recipe_id INT,
-- --     author_id INT
-- -- );

-- -- CREATE TABLE author(
-- --     id INT PRIMARY KEY,
-- --     name VARCHAR(100) NOT NULL
-- --     ---- Not done yet, will finish when I figure out API ---
-- -- );

-- -- CREATE TABLE recipe_to_ingredient(
-- --     recipe_id INT NOT NULL,
-- --     ingredient_id INT NOT NULL
-- -- );

-- -- CREATE TABLE ingredient(
-- --     id INT PRIMARY KEY,
-- --     name VARCHAR(100)
-- --     ---- Not done yet, will finish when I figure out API ---
-- -- );

-- -- CREATE TABLE ingredient_to_allergy(
-- --     ingredient_id INT,
-- --     allergy_id INT
-- -- );

-- -- CREATE TABLE allergy(
-- --     id INT PRIMARY KEY,
-- --     name VARCHAR(100)
-- --     ---- Not done yet, will finish when I figure out API ---
-- -- );
