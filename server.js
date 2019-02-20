var app = require('express')();       //this line gives the variable app a server framework
var http = require('http').Server(app);         //used to connect to the Server

var io = require('socket.io')(http);

var admin = require("firebase-admin");

//Get the firebase credentials from the private folder
var chattrServiceAccountPath = require(__dirname + "/private/chattrServiceCredentials.json")

//Initialise the firebase credentials of the app.
admin.initializeApp({
  credential: admin.credential.cert(chattrServiceAccountPath),
  databaseURL: "https://chattr-d500d.firebaseio.com"
});

//Moved socket code from server.js to account-services.js and called from server.js
var accountRegistrationReq = require('./Firebase/account-services');
accountRegistrationReq.userAccountCreateRequests(io);

/*
  This uses an arrow function, new way to define a function.
*/
http.listen(3000, ()=>{
  console.log("Server is listening on port 3000");
});
