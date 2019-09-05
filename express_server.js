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
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "9Hjsw3": { longURL: "http://www.notgoogle.com", userID: "userRandom" }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "password"
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
  let filteredURLs = urlsForUser(urlDatabase, req.cookies.user_id)
  let templateVars = {urls: filteredURLs, user: users[req.cookies.user_id] };
  res.render("urls_index", templateVars);
});

//add
app.get("/urls/new", (req, res) => {
  let templateVars = { urlDatabase, user: users[req.cookies.user_id] };

   if (req.cookies['user_id']) {
    res.render("urls_new", templateVars);
  } else {
    res.render("login_page", templateVars);
  }

});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  };
  console.log(urlDatabase[shortURL]);
  res.redirect(`/urls/${shortURL}`); // redirecting to shortURL page
});

//read
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies['user_id']) {
    let templateVars = { shortURL: req.params.shortURL, user: users[req.cookies.user_id], urls: urlDatabase}
    res.render("urls_show", templateVars);
  }
  
  let filteredURLs = urlsForUser(urlDatabase, req.cookies.user_id);
  const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);

  if (req.cookies['user_id']) {
    if (hasUrl) {
      let templateVars = { shortURL: req.params.shortURL, longURL: filteredURLs[req.params.shortURL]['longURL'], user: users[req.cookies.user_id], hasUrl: hasUrl, urls: urlDatabase };
      res.render("urls_show", templateVars);
    } else {
      let templateVars = { shortURL: req.params.shortURL, user: users[req.cookies.user_id], hasUrl: hasUrl, urls: urlDatabase };
      res.render("urls_show", templateVars);
    }
  }
  
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});

// edit
app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies['user_id']) {
    let filteredURLs = urlsForUser(urlDatabase, req.cookies.user_id);
    const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);
    if (hasUrl()) {
      const newLongURL = req.body.newLongURL;
      const shortURL = req.params.shortURL;
      urlDatabase[shortURL] = newLongURL;
      res.redirect(`/urls/`);
    } else {
      console.log(Error);
    } 
  } else {
    res.redirect('/login');
  }
});

//delete
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies['user_id']) {
    let filteredURLs = urlsForUser(urlDatabase, req.cookies.user_id);
    const hasUrl = Object.keys(filteredURLs).includes(req.params.shortURL);
    if (hasUrl()) {  
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    } else {
      console.log(Error);
    }
  } else {
    res.redirect('/login');
  }
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

//generate random string for short URL and registering new user id
const generateRandomString = function() {
  let shortURL = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
};

//determine if email has already been created
const emailLookup = function (emailNew) {
    for(const user in users) {
      if (users[user]["email"] === emailNew) {
        return users[user];
      }
    }
    return undefined;
  };

//filter database 
const urlsForUser = function (object, id) {
  let filteredUrlDatabase = {}
    for (const item in object) {
      if (object[item]["userID"] === id) {
  
        filteredUrlDatabase[item] = {
          longURL: object[item]["longURL"],
          userID: object[item]["userID"]
        };
      }
    }
    return filteredUrlDatabase;  
  };
  

  