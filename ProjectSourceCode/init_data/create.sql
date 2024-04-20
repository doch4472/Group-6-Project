DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_recipe;
-- DROP TABLE IF EXISTS recipe_to_author;
-- DROP TABLE IF EXISTS author;
-- DROP TABLE IF EXISTS recipe_to_ingredient;
-- DROP TABLE IF EXISTS allergy;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(60) NOT NULL,
    fav_recipe VARCHAR(100) NULL,
    bio VARCHAR(2000),
    email VARCHAR(50)
);

CREATE TABLE user_to_recipe(
    user_id INT,
    recipe_id INT
);

CREATE TABLE user_recipe(
    id SERIAL PRIMARY KEY,
    dynamic_id VARCHAR(20) UNIQUE,
    username VARCHAR(51) NOT NULL,
    recipe_name VARCHAR NOT NULL,
    instruction VARCHAR NOT NULL,
    ingredient VARCHAR NOT NULL
);

ALTER TABLE user_to_recipe ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE user_to_recipe ADD CONSTRAINT recipe_id FOREIGN KEY (recipe_id) REFERENCES user_recipe(id);

-- Commenting these out for now, might use later --

-- CREATE TABLE recipe (
--     id SERIAL PRIMARY KEY,
--     title VARCHAR(100) NOT NULL,
--     description VARCHAR(100) NOT NULL,
--     ingredients VARCHAR(100) NOT NULL,
--     author VARCHAR(100) NOT NULL, -- Move the NOT NULL constraint to the correct position
--     date_created VARCHAR(100) NOT NULL,
--     image VARCHAR(100) NOT NULL,
--     image_title VARCHAR(100) NOT NULL
-- );


-- CREATE TABLE recipe_to_author(
--     recipe_id INT,
--     author_id INT
-- );

-- CREATE TABLE author(
--     id INT PRIMARY KEY,
--     name VARCHAR(100) NOT NULL
--     ---- Not done yet, will finish when I figure out API ---
-- );

-- CREATE TABLE recipe_to_ingredient(
--     recipe_id INT NOT NULL,
--     ingredient_id INT NOT NULL
-- );

-- CREATE TABLE ingredient(
--     id INT PRIMARY KEY,
--     name VARCHAR(100)
--     ---- Not done yet, will finish when I figure out API ---
-- );

-- CREATE TABLE ingredient_to_allergy(
--     ingredient_id INT,
--     allergy_id INT
-- );

-- CREATE TABLE allergy(
--     id INT PRIMARY KEY,
--     name VARCHAR(100)
--     ---- Not done yet, will finish when I figure out API ---
-- );