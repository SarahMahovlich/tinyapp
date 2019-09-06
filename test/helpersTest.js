const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helper');

const testUsers = {
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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" },
  "9Hjsw3": { longURL: "http://www.notgoogle.com", userID: "userRandom" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user['id'], expectedOutput);
  });

  it('should return undefined if the user is not in the database', function() {
    const user = getUserByEmail("userNotThere@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });

});

describe('urlsForUser', function() {
  it('should return a filtered list for a given user', function() {
    const list = urlsForUser(urlDatabase, "userRandomID");
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
    };
    assert.deepEqual(list, expectedOutput);
  });
});

