// Importing necessary dependencies
const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const path = require("path");
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

// Create `ExpressHandlebars` instance and configure the layouts and partials dir
const hbs = handlebars.create({
  extname: "hbs",
  layoutsDir: path.join(__dirname, "/views/layouts"),
  partialsDir: path.join(__dirname, "/views/partials"),
});

// Database configuration
const dbConfig = {
  host: "db", // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const user = {
  username: 0,
  bio: undefined,
  email: undefined,
};
const db = pgp(dbConfig);

// Test the database connection
db.connect()
  .then((obj) => {
    console.log("Database connection successful");
    obj.done();
  })
  .catch((error) => {
    console.log("ERROR:", error.message || error);
  });

// Register `hbs` as the view engine
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// Serve static files from the "src" directory
app.use(express.static(path.join(__dirname, "resources")));
app.use("/images", express.static(path.join(__dirname, "resources", "images")));
app.use("/css", express.static(path.join(__dirname, "resources", "css")));

// *****************************************************
// <!-- Section : API HANDLING SEARCH-->
// *****************************************************

// Define your API routes here

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get("/", (req, res) => {
  res.redirect("/aboutus");
});

app.get("/register", (req, res) => {
  res.render("pages/register");
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const existingUser = await db.oneOrNone(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (existingUser) {
      return res.render("pages/register", {
        message: "Username already exists. Please choose a different username.",
      });
    }

    const hash = await bcrypt.hash(password, 10);
    await db.none("INSERT INTO users(username, password) VALUES($1, $2)", [
      username,
      hash,
    ]);

    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    res.render("pages/register", {
      message: "Registration failed. Please try again.",
    });
  }
});

app.get("/search", (req, res) => {
  res.render("pages/search", { query: req.query.q });
});

app.get("/home", (req, res) => {
  if (req.session.username) {
    res.render("pages/search", {
      query: req.query.q,
      username: req.session.username,
    });
  } else {
    res.render("pages/login", { query: req.query.q });
  }
});

app.get("/login", (req, res) => {
  res.render("pages/login", { query: req.query.q });
});

app.get("/profile", (req, res) => {
  try {
    const username = req.session.username;
    if (req.session.username) {
      db.any(
        "SELECT bio, email\
          FROM users\
          WHERE username = $1;",
        [username]
      ).then((information) => {
        res.render("pages/profile", {
          query: req.query.q,
          username: username,
          bio: information[0].bio,
          email: information[0].email,
          // yourRecipe: []
        });
      });
    } else {
      res.redirect("login");
    }
  } catch (error) {
    res.status(500).render("pages/search", { error: "Internal Server Error" });
  }
});

app.get("/recipe/:id", (req, res) => {
  const recipeId = req.params.id;
  console.log(recipeId);
  res.render("pages/recipe", { recipeId: recipeId });
});

app.get("/welcome", (req, res) => {
  res.json({ status: "success", message: "Welcome!" });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/logout");
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).send("Error logging out");
    } else {
      res.redirect("/login");
    }
  });
});

app.post("/login", async (req, res) => {
  try {
    const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [
      req.body.username,
    ]);

    if (!user) {
      // Pass error message to template
      return res.status(500).render("pages/login", {
        message:
          "User does not exist. \n Please try again or make a new account.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!passwordMatch) {
      // Pass error message to template
      return res
        .status(500)
        .render("pages/login", { message: "Incorrect password." });
    }
    req.session.username = req.body.username;
    req.session.user = user;
    req.session.save(() => {
      res.redirect("/home");
    });
  } catch (error) {
    console.error("Error during login:", error);
    // Render login page with internal server error message
    res.status(500).render("pages/login", { error: "Internal Server Error" });
  }
});

app.get("/favorite-recipe", (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    // If logged in, render the favorite recipe page
    res.render("pages/favRecipe");
  } else {
    // If not logged in, redirect to the register page
    res.redirect("/login");
  }
});

app.get("/update", (req, res) => {
  res.render("pages/update");
});

app.post("/update", async (req, res) => {
  try {
    if (!req.body.email && !req.body.bio) {
      return res.status(400).json({ message: "Email or bio are required." });
    } else if (req.body.email && !req.body.bio) {
      await db.none(
        "UPDATE users \
                    SET email = ($1), \
                    WHERE username = $2;",
        [req.body.email, req.session.username]
      );
    } else if (!req.body.email && req.body.bio) {
      await db.none(
        "UPDATE users \
                    SET bio = ($1), \
                    WHERE username = $2;",
        [req.body.bio, req.session.username]
      );
    } else {
      await db.none(
        "UPDATE users \
                    SET email = ($1), \
                    bio = ($2) \
                    WHERE username = $3;",
        [req.body.email, req.body.bio, req.session.username]
      );
    }

    res.status(200).redirect("/profile");
  } catch (error) {
    res.status(400).redirect("/profile");
  }
});

app.get("/aboutus", (req, res) => {
  res.render("pages/aboutus");
});

app.get("/yourRecipe", (req, res) => {
  // Check if the user is logged in
  if (req.session.user) {
    // If logged in, render the your recipe page
    res.render("pages/yourRecipe");
  } else {
    // If not logged in, redirect to the login page
    res.redirect("/login");
  }
});

app.post("/yourRecipe", async (req, res) => {
  try {
    var username = req.body.recipe;
    var recipeName = req.body.recipe;
    var ingredient = req.body.recipe;
    var instructions = req.body.recipe;

    // Finding if the username exists within the website
    const existingUser = await db.one(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    console.log();

    // If not, then bring them to the register page
    if (!existingUser) {
      return res.render("pages/register", {
        message:
          "Username does not exists. Please sign in before importing your recipe.",
      });
    }

    console.log();

    // Grab ID of the user
    const user_id = await db.one("SELECT id FROM users WHERE username = $1", [
      existingUser,
    ]);

    console.log();

    // Insert the users recipe in "user_recipe" table
    await db.any(
      "INSERT INTO user_recipe(username, recipe_name, instruction, ingredient) VALUES ($1, $2, $3, $4)",
      [existingUser, recipeName, ingredient, instructions]
    );

    console.log();

    // Grab ID of user's recipe
    const recipe_id = await db.one(
      "SELECT id FROM user_recipe WHERE recipe_name = $1",
      [recipeName]
    );

    console.log();

    // insert into table () values () returning id -- pseudocode, don't worry about this

    // Insert the ID's into the "user_to_recipe" table for mapping
    await db.any(
      "INSERT INTO user_to_recipe(user_id, recipe_id) VALUES ($1, $2)",
      [user_id, recipe_id]
    );

    console.log();
  } catch (error) {
    res
      .status(500)
      .render("pages/yourRecipe", { error: "Internal Server Error" });
  }
});

app.get("/review", (req, res) => {
  // Check if the user is authenticated (logged in)
  if (req.session.username) {
    // If authenticated, render the review page
    res.render("pages/review");
  } else {
    // If not authenticated, redirect to the login page
    res.redirect("/login");
  }
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************

// Start the server and keep the connection open to listen for more requests
const server = app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = server;
