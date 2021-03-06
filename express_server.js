//express_server.js for TinyApp

//utilize express
const express = require("express");
const app = express();

//port
const PORT = 8080; // default port 8080

//view engine set to ejs
app.set("view engine", "ejs");

//body-parser middleware is utilized to make POST human-readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//cookie-session
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

//bcrypt for storing passwords
const bcrypt = require('bcrypt');

//helper functions found here
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helper');

//example code
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "9Hjsw3": { longURL: "http://www.notgoogle.com", userID: "userRandom" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("password", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

//ROUTES
//res.render will load ejs view files

//browse URLs
app.get("/urls", (req, res) => {
  let filteredURLs = urlsForUser(urlDatabase, req.session.user_id);
  let templateVars = {urls: filteredURLs, user: users[req.session.user_id] };
  res.render("urls_index", templateVars);
});

//add URL
app.get("/urls/new", (req, res) => {
  let templateVars = { urlDatabase, user: users[req.session.user_id] };

  if (req.session['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login_page", templateVars);
  }

});

app.post("/urls", (req, res) => {
  if (req.session['user_id']) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session['user_id']
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render('error_login', templateVars);
  }
});

//read URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session['user_id']) {
    let templateVars = { shortURL: req.params.shortURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
  let filteredURLs = urlsForUser(urlDatabase, req.session.user_id);
  const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);
  if (req.session['user_id']) {
    if (hasUrl) {
      let templateVars = { longURL: filteredURLs[req.params.shortURL]['longURL'], shortURL: req.params.shortURL, user: users[req.session.user_id], hasUrl: hasUrl };
      res.render("urls_show", templateVars);
    } else {
      let templateVars = { shortURL: req.params.shortURL, user: users[req.session.user_id], hasUrl: hasUrl };
      res.render("urls_show", templateVars);
    }
  } 
});

app.get("/u/:shortURL", (req, res) => {
  const hasUrl = Object.keys(urlDatabase).includes(req.params.shortURL);
  if (hasUrl) {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render("u_error_page", templateVars);
  }
});

//edit URL
app.post("/urls/:shortURL", (req, res) => {
  if (req.session['user_id']) {
    let filteredURLs = urlsForUser(urlDatabase, req.session.user_id);
    const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);
    if (hasUrl) {
      const newLongURL = req.body.newLongURL;
      const shortURL = req.params.shortURL;
      urlDatabase[shortURL]['longURL'] = newLongURL;
      res.redirect(`/urls/`);
    } else {
      const shortURL = req.params.shorURL;
      let templateVars = { urlDatabase, user: users[req.session.user_id], shortURL };
      res.render('error_login', templateVars);
    }
  } else {
    const shortURL = req.params.shorURL;
    let templateVars = { urlDatabase, user: users[req.session.user_id], shortURL };
    res.render('error_login', templateVars);
  }
});

//delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session['user_id']) {
    let filteredURLs = urlsForUser(urlDatabase, req.session.user_id);
    const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);
    if (hasUrl) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    } else {
      const shortURL = req.params.shorURL;
      let templateVars = { urlDatabase, user: users[req.session.user_id], shortURL };
      res.render('error_login', templateVars);
    }
  } else {
    const shortURL = req.params.shorURL;
    let templateVars = { urlDatabase, user: users[req.session.user_id], shortURL };
    res.render('error_login', templateVars);
  }
});

//login
app.get("/login", (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    let templateVars = {urls: urlDatabase, user: users[req.session.user_id] };
    res.render("login_page", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  const id = user.id;
  if (user !== undefined && bcrypt.compareSync(password, user.password,)) {
    req.session['user_id'] = id;
    res.redirect('/urls');
  } else {
    let templateVars = {urls: urlDatabase, user: users[req.session.user_id] };
    res.render("wrong_login", templateVars);
  }
});

//logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//register
app.get("/register", (req, res) => {
  if (req.session['user_id']) {
    res.redirect('/urls');
  } else {
    let templateVars = {urls: urlDatabase, user: users[req.session.user_id] };
    res.render("reg_page", templateVars);
  }
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const pass = req.body.password;
  const password = bcrypt.hashSync(pass, 10); //hashed
  //if registration errors, else continue with registration
  if (getUserByEmail(email, users) !== undefined || email === "" || pass === "") {
    let templateVars = { email, pass, user: users[req.session.user_id] };
    res.render('error_register', templateVars);
  } else {
    users[id] = {
      id,
      email,
      password
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

// redirect user for any other URL
app.get("/*", (req, res) => {
  if (req.session['user_id']) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

  

  