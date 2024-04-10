// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
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
app.use(express.static(path.join(__dirname, 'resources')));

// Serve images from the "images" directory inside the "src" folder
app.use("/images", express.static(path.join(__dirname, "resources", "images")));

app.use("/css", express.static(path.join(__dirname, "resources", "css")));

// *****************************************************
// <!-- Section : API HANDLING SEARCH-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests




// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
  res.redirect('/register');  
});

app.get('/register', (req, res) => {
  res.render('pages/register')
});

// Register
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists in the database
    const existingUser = await db.oneOrNone("SELECT * FROM users WHERE username = $1", [username]);
    if (existingUser) {
      // If the user already exists, render the registration page with an error message
      return res.render("pages/register", {
        message: "Username already exists. Please choose a different username.",
      });
    }

    // Hash the password using bcrypt library
    const hash = await bcrypt.hash(password, 10);

    // Insert username and hashed password into the 'users' table
    await db.none("INSERT INTO users(username, password) VALUES($1, $2)", [username, hash]);

    // Redirect to login page after successful registration
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error);
    // Render the registration page with an error message if registration fails
    res.render("pages/register", {
      message: "Registration failed. Please try again.",
    });
  }
});



app.get('/search', (req, res) => {
  res.render('pages/search', { query: req.query.q });
});

app.get('/home', (req, res) => {
  res.render('pages/search', { query: req.query.q });
});

app.get('/login', (req, res) => {
  res.render('pages/login', {query: req.query.q});
});

app.get('/profile', (req, res) => {
  res.render('pages/profile', {query: req.query.q});
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
  }
});


// TODO - Include your API routes here

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
//app.listen(3000);
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');
