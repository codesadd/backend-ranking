const express = require('express')
const firebase = require('firebase')

firebase.initializeApp({
    apiKey: "AIzaSyDIpDDBTd08Lwh8uYYybwJQvHwZEe6ACjE",
    authDomain: "fun-fun-53400.firebaseapp.com",
    databaseURL: "https://fun-fun-53400.firebaseio.com",
    storageBucket: "fun-fun-53400.appspot.com"
})

var app = express()
var self = this
self.users = []
self.demo = []
self.loadSchool = []
self.schools = []
const usersRef = firebase.database().ref().child('users')
const demoRef = firebase.database().ref().child('demo')

//getUsers()
loadSchool()

function getUsers() {
    usersRef.on('value', function(snapshot) {
        self.users = snapshot.val()
        console.log(self.users)
    })
}

function loadSchool() {
    firebase.database().ref().child('schools').on('child_added', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        self.schools.push(item)
        //console.log(self.schools)
    })
    return self.schools
}

function loadInfoSchool(uid, req, res) {
    self.infoSchools = []
    firebase.database().ref('schools').child(uid).on('value', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        self.infoSchools.push(item)
        //console.log(self.infoSchools)
    })
    return self.infoSchools
}


app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})


app.get('/schools', function(req, res) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
    res.json(self.schools)
})

app.post('/infoschool/:uid/', function(req, res) {
    console.log('ID:', req.params.uid)
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
    res.json(loadInfoSchool(req.params.uid))
    //res.json(self.infoSchools)
})

// POST method route
app.post('/', function(req, res) {
    res.send('POST request to the homepage')
})
