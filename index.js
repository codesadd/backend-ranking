const express = require('express')
const firebase = require('firebase')

firebase.initializeApp({
    apiKey: "AIzaSyDIpDDBTd08Lwh8uYYybwJQvHwZEe6ACjE",
    authDomain: "fun-fun-53400.firebaseapp.com",
    databaseURL: "https://fun-fun-53400.firebaseio.com",
    storageBucket: "fun-fun-53400.appspot.com"
});

var app = express()
var self = this;
self.users = []
self.demo = []
const usersRef = firebase.database().ref().child('users')
const demoRef = firebase.database().ref().child('demo')

//getUsers()
getDemo()

function getDemo() {
    demoRef.on('value', function(snapshot) {
        self.demo = snapshot.val();
        console.log(self.demo);
    });
}

function getUsers() {
    usersRef.on('value', function(snapshot) {
        self.users = snapshot.val();
        console.log(self.users);
    });
}


app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});


app.get('/demo', function(req, res) {
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    // res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
    res.json(self.demo)
});

// GET method route
app.get('/', function(req, res) {
    res.send('GET request to the homepage')
})

// POST method route
app.post('/', function(req, res) {
    res.send('POST request to the homepage')
})
