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

<<<<<<< HEAD
app.get('/home', (req, res) => {
  res.render('pages/search', { query: req.query.q });
});

app.get('/login', (req, res) => {
  res.render('pages/login', {query: req.query.q});
});

app.get('/profile', async (req, res) => {
  try {
     // Retrieve user data from the database based on the user's ID or any other identifier
     user = req.session.user.username; // Assuming you have the user's ID stored in the session
     
    
    res.render('pages/profile', {userData: req.session.user});
  } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/recipe/:id', (req, res) => {
  const recipeId = req.params.id;
  res.render('pages/recipe', { recipeId: recipeId });
});

app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

app.post('/login', async (req, res) => {
  try {
        const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', [req.body.username]);
    
        if (!user) {
          throw new Error('Incorrect username.');
        }
    
        // Compare
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    
        if (!passwordMatch) {
          throw new Error('Incorrect password.');
        }
    
        // Save the user in the session
        req.session.user = user;
        req.session.save(() => {
        res.redirect('/home');

      });
      } catch (error) {
        console.error('Error during login:', error);

        res.status(500).render('pages/login', { error: 'Internal Server Error' });
      }
});

app.post('/register', async (req, res) => {
  //hash the password using bcrypt 
  try{

    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

      const hash = await bcrypt.hash(req.body.password, 10);
      // To-DO: Insert username and hashed password into the 'users' table
      await db.one('INSERT INTO users(username, password) VALUES($1, $2)', [req.body.username, hash]);
      res.status(200).redirect('/login'); 
  } catch (error) {
      res.status(400).redirect('/register'); 
=======
app.get("/home", (req, res) => {
  if (req.session.username) {
    res.render("pages/search", {
      query: req.query.q,
      username: req.session.username,
    });
  } else {
    res.render("pages/login", { query: req.query.q });
>>>>>>> 3d968e8e4926db959692f1e74abde51557806e50
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


// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************

// Start the server and keep the connection open to listen for more requests
const server = app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

module.exports = server;
