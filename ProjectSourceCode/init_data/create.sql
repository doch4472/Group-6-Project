CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

CREATE TABLE recipe(
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    calorie INT NOT NULL
    author VARCHAR(100), NOT NULL,
    date_created VARCHAR(100) NOT NULL,
 ---- Not done yet, will finish when I figure out API ---
);

CREATE TABLE recipe_to_author(
    recipe_id INT,
    author_id INT
);

CREATE TABLE author(
    id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    ---- Not done yet, will finish when I figure out API ---
)

CREATE TABLE recipe_to_ingredient(
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL
);

CREATE TABLE ingredient(
    id INT PRIMARY KEY,
    name VARCHAR(100)
    ---- Not done yet, will finish when I figure out API ---
);

CREATE TABLE ingredient_to_allergy(
    ingredient_id INT,
    allergy_id INT
);

CREATE TABLE allergy(
    id INT PRIMARY KEY,
    name VARCHAR(100)
    ---- Not done yet, will finish when I figure out API ---
);
