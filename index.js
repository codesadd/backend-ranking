// import ----------------------------------------

const express = require('express')
    //const firebase = require('firebase')
const firebase = require('firebase-admin');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

// init variable ---------------------------------

var serviceAccount = require("./fun-fun-53400-firebase-adminsdk-t6i60-6a09c094f1.json");
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://fun-fun-53400.firebaseio.com"
});

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

self.users = []
self.database = []

const database = firebase.database()
const schoolsRef = database.ref().child('schools')
const usersRef = database.ref().child('users')
const demoRef = database.ref().child('demo')

// main ------------------------------------------

database.ref().on('value',
    function(snapshot) {
        self.database = snapshot.val()
        console.log('Database updated');
    },
    function(errorObject) {
        console.log("The read failed: " + errorObject.code);
    })

app.listen(3000, function() {
    console.log('Running app listening on port 3000!')
})

app.get('/schools', function(req, res) {
    res.json(loadSchool(self.database.schools))
})

app.get('/users', function(req, res) {
    res.json(loadSchool(self.database.users))
})

app.get('/infoschool/:uid/', function(req, res) {
    updateViewSchool(req.params.uid)
    console.log('ID-school : ', req.params.uid)
    res.json(loadInfoSchool(req.params.uid))
})

app.get('/allcoures/:uid/:course', function(req, res) {
    // console.log('ID:', req.params.uid, req.params.course)
    // console.log(loadAllCoures(req.params.uid, req.params.course));
    res.json(loadAllCoures(req.params.uid, req.params.course))
})

app.get('/updateschool/:schoolName/:address/:city/:state/:postalCode/:biography/:uid', function(req, res) {
    console.log('check here', req.params.schoolName);
    var item = {
        schoolName: req.params.schoolName,
        address: req.params.address,
        city: req.params.city,
        state: req.params.state,
        postalCode: req.params.postalCode,
        biography: req.params.biography
    }
    res.json(updateSchoolInfo(item, req.params.uid))
})

// method --------------------------------------------
function updateSchoolInfo(param, id) {
    firebase.database().ref('schools').child(id).update(param);
    loadInfoSchool(id)
    var status = {
        status: 200,
        text: "success"
    }
    self.infoSchools.push(status)
    return self.infoSchools
}

function updateViewSchool(id) {
    var thisSchool = self.school.find(
        school => school.id === id)

    var param = {
        view: thisSchool.value.view + 1
    }
    firebase.database().ref('schools').child(id).update(param)
}

function loadSchool(schools) {
    self.school = []
    var keys = Object.keys(schools);
    keys.sort(); // sort the array of keys
    keys.forEach(function(item) {
        var item = {
            id: item,
            value: schools[item]
        }
        self.school.push(item)
    });
    return self.school
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
    var allCourses = []
    database.ref('schools/' + uid).child('courses').on('child_added', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        allCourses.push(item)
    })
    return allCourses
}
