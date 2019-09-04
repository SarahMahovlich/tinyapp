//things to load
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

//view engine set to ejs
app.set("view engine", "ejs");

//body-parser middleware is needed to make POST human-readable
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

//cookie-parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

//res.render will load an ejs view file

//browse
app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//add
app.get("/urls/new", (req, res) => {
  let templateVars = { urlDatabase, user: users[req.cookies.user_id] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`); // redirecting to shortURL page
});

//read
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// edit
app.post("/urls/:shortURL", (req, res) => {
  const newLongURL = req.body.newLongURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/`);
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//login
app.get("/login", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("login_page", templateVars);
})


app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = emailLookup(email);
  const id = user.id;
  if (user !== undefined && user.password === password) {
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.send("Status Code: 403");
  }
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

//register
app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.cookies.user_id] };
  res.render("reg_page", templateVars);
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  //if registration errors, else continue with registration
  if (emailLookup(email) !== undefined || email === "" || password === ""){ 
    res.send("Status Code: 400")
  } else {
    users[id] = {
      id,
      email,
      password
    };
    res.cookie('user_id', id);
    res.redirect("/urls");
  }   
});

// will redirect user for any other URL they try to use
app.get("/*", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = function() {
  let shortURL = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
};

const emailLookup = function (emailNew) {
    for(const user in users) {
      if (users[user]["email"] === emailNew) {
        return users[user];
      }
    }
    return undefined;
  };


  