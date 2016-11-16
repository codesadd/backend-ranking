const express = require('express')
const firebase = require('firebase')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

var app = express()
var self = this

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
  next();
});

firebase.initializeApp({
    apiKey: "AIzaSyDIpDDBTd08Lwh8uYYybwJQvHwZEe6ACjE",
    authDomain: "fun-fun-53400.firebaseapp.com",
    databaseURL: "https://fun-fun-53400.firebaseio.com",
    storageBucket: "fun-fun-53400.appspot.com"
})

self.users = []
self.demo = []
self.loadSchool = []
self.database = []
self.schools = []

const database = firebase.database()
const usersRef = database.ref().child('users')
const demoRef  = database.ref().child('demo')

database.ref().on('value', function(snapshot) {
    self.database = snapshot.val()
    console.log('data Ready')
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
})

app.get('/schools', function(req, res) {
    res.json(loadSchool(self.database.schools))
})

app.get('/infoschool/:uid/', function(req, res) {
    console.log('ID-school:', req.params.uid)
    res.json(loadInfoSchool(req.params.uid))
})

app.get('/allcoures/:uid/:course', function(req, res) {
    // console.log('ID:', req.params.uid, req.params.course)
    // console.log(loadAllCoures(req.params.uid, req.params.course));
    res.json(loadAllCoures(req.params.uid, req.params.course))
})

// POST method route
app.post('/', function(req, res) {
    res.send('POST request to the homepage')
})

function updateViewSchool() {
    param = {
        view: self.schoolSelected[0].value.view + 1
    }
    firebase.database().ref('schools').child(id).update(param);
}

function loadSchool(schools) {
    self.schools = []
    var keys = Object.keys(schools);
    keys.sort(); // sort the array of keys
    keys.forEach(function(item) {
        var item = {
            id: item,
            value: schools[item]
        }
        //console.log(item);
        self.schools.push(item)
    });
    return self.schools
}


function loadInfoSchool(uid, req, res) {
    self.infoSchools = []
    database.ref('schools').child(uid).on('value', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        self.infoSchools.push(item)
    })
    return self.infoSchools
}

function loadAllCoures(uid, req, res) {
    self.allCourses = []
    database.ref('schools/' + uid).child('courses').on('child_added', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        self.allCourses.push(item)
    })
    return self.allCourses
}
