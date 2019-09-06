//determine if email has already been created, then return user OR return undefined with registering
const getUserByEmail = function(emailNew, database) {
  for (const user in database) {
    if (database[user]["email"] === emailNew) {
      return database[user];
    }
  }
  return undefined;
};

//generate random string for short URL and registering new user id
const generateRandomString = function() {
  let shortURL = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    shortURL += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortURL;
};

//filter database
const urlsForUser = function(object, id) {
  let filteredUrlDatabase = {};
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

module.exports = { getUserByEmail, generateRandomString, urlsForUser };