// import ----------------------------------------

const express = require('express')
const firebase = require('firebase-admin')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const ttest = require('ttest')
const summary = require('summary');


// Example T-test =================================
var sampleA = [7, 10, 5, 8, 3, 4, 6, 5]
var sampleB = [9, 12, 7, 8, 7, 6, 5, 10]
const options = {
    // Default: 0
    // One sample case: this is the µ that the mean will be compared with.
    // Two sample case: this is the ∂ value that the mean diffrence will be compared with.
    mu: 1,

    // Default: false
    // If true don't assume variance is equal and use the Welch approximation.
    // This only applies of two samples are used.
    varEqual: false,

    // Default: 0.05
    // The significance level of the test
    alpha: 0.05,

    // Default "not equal"
    // What should the alternative hypothesis be:
    // - One sample case: could the mean be less, greater or not equal to mu property.
    // - Two sample case: could the mean diffrence be less, greater or not equal to mu property.
    alternative: "greater"
};
const stat = ttest(sampleA, sampleB, options)
console.log(stat, stat.valid())


// init variable ---------------------------------

var serviceAccount = require("./serviceAcc/fun-fun-53400-firebase-adminsdk-t6i60-6a09c094f1.json")
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://fun-fun-53400.firebaseio.com"
})

var app = express()
var self = this
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json())
app.use(methodOverride())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST")
    next()
})

self.users = []
self.database = []

const database = firebase.database()
const schoolsRef = database.ref().child('schools')
const usersRef = database.ref().child('users')
const demoRef = database.ref().child('demo')
    //var date = new Date()
var date = getDateTime()
    // main ------------------------------------------

database.ref().on('value', function(snapshot) {
        self.database = snapshot.val()
        console.log('Database updated', date)
    },
    function(errorObject) {
        console.log("The read failed: " + errorObject.code)
    })

app.listen(3000, function() {
    console.log('Running app listening on port 3000!')
})

app.get('/api/v1/schools', function(req, res) {
    res.json(loadSchool(self.database.schools))
})

app.get('/api/v1/users', function(req, res) {
    res.json(loadSchool(self.database.users))
})

app.get('/api/v1/infoschool/:uid/', function(req, res) {
    updateViewSchool(req.params.uid)
    res.json(loadInfoSchool(req.params.uid))
})

app.get('/api/v1/allcoures/:uid/', function(req, res) {
    res.json(loadAllCoures(req.params.uid))
})

app.get('/api/v1/get/dashboard', function(req, res) {
    res.json(getDashboardSchool(req.query.uid))
})

app.get('/api/v1/coures/:schoolId/:courseId', function(req, res) {
    res.json(loadThisCourse(req.params.schoolId, req.params.courseId))
})

app.post('/api/v1/updateschool/:uid', function(req, res) {
    var item = {
        schoolName: req.body.schoolName,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        postalCode: req.body.postalCode,
        biography: req.body.biography
    }
    res.json(updateSchoolInfo(item, req.params.uid))
        // res.json(item, req.params.uid)
})
app.post('/api/v1/register', function(req, res) {
    res.json(registerStd(req.body.schoolId, req.body.courseId, req.body.student))
})

app.post('/api/v1/cregister', function(req, res) {
    console.log(req.body)
    res.json(cregister(req.body))
        //res.json(registerStd(req.body.schoolId, req.body.courseId, req.body.student))
})

app.get('/api/v1/user/:user', function(req, res) {
    // console.log(req.params.user)
    res.json(getDashboardUser(req.params.user))
})

app.post('/api/v1/create_course', function(req, res) {
    console.log(req.body)
    res.json(createCourse(req.body.uid, req.body.params))
})

app.post('/api/v1/delete/course', function(req, res) {
    res.json(deleteCourse(req.body))
})

app.post('/api/v1/accept', function(req, res) {
    res.json(acceptStudent(req.body.schoolId, req.body.courseId, req.body.studentId))
})

app.post('/api/v1/submitpoll', function(req, res) {
    res.json(submitPoll(req.body))
})

// method --------------------------------------------

function submitPoll(param) {
    firebase.database().ref('schools/' + param.schoolId).child('poll').push({
        currentId: param.currentUserId,
        schoolId: param.schoolId,
        courseId: param.courseId,
        dataPoll: param.pollSchool,
        ttest: {
            before: param.pollUser[0].data,
            after: param.pollUser[1].data
        }
    })
}

function getDashboardSchool(param) {
    self.temp = []
    self.returnItem = []
    self.course = []
    self.data = []
    self.countStudent = 0
    firebase.database().ref('schools/' + param + '/courses').on('value', function(snapshot_course) {
        if (snapshot_course.val() == undefined) {
            console.log("empty Course");
        } else {
            self.course = snapshot_course.val()
            var keyCourse = Object.keys(snapshot_course.val())
            keyCourse.forEach(function(item) {
                if (self.course[item].students == undefined) {
                    self.temp = [] // set empty student
                } else {
                    self.temp = [] // set new array
                    Object.keys(self.course[item].students).forEach(function(studentId) {
                        self.countStudent += Object.keys(self.course[item].students).length
                        firebase.database().ref('users').child(studentId).on('value', function(snapshot_user) {
                            self.temp.push({
                                std_id: studentId,
                                std_status: self.course[item].students[studentId].status,
                                value: snapshot_user.val()
                            })
                        })
                    })
                }
                self.data.push({
                    courseId: item,
                    course: self.course[item],
                    students: self.temp
                })
            })
        }
    })
    self.returnItem.push({
        data: self.data,
        countStudent: self.countStudent
    })
    console.log(self.countStudent);
    return self.returnItem
}

function getDashboardUser(userId) {
    self.item = []
    var user = []
    user.push(self.database.users[userId])
    var course = self.database.users[userId].courses
        //console.log(course);
    if (course == undefined) {
        console.log("ยังไม่ได้ลงเรียน");
    } else {
        var keys = Object.keys(course)
        keys.sort() // sort the array of keys
        keys.forEach(function(item) {
            self.checkPoll = false
            database.ref('schools/' + course[item].schoolId).child('poll').on('value', function(poll) {
                if (poll.val() == undefined) {
                    console.log("Empty poll")
                } else {
                    Object.keys(poll.val()).forEach(function(checkPoll) {
                        if (poll.val()[checkPoll].courseId == course[item].courseId && userId == poll.val()[checkPoll].currentId) {
                            self.checkPoll = true
                        }
                    })
                }
            })
            database.ref('schools/' + course[item].schoolId).on('value', function(snapshot_school) {

                database.ref('schools/' + course[item].schoolId + '/courses/' + course[item].courseId).on('value', function(snapshot_course) {
                    if (snapshot_course.val() == undefined) {
                        console.log("debug error")
                    } else {
                        var countRegister = Object.keys(snapshot_course.val().students)
                            // console.log(snapshot_course.val());
                        self.item.push({
                            school: {
                                schoolId: course[item].schoolId,
                                value: snapshot_school.val()
                            },
                            course: {
                                courseId: course[item].courseId,
                                value: snapshot_course.val()
                            },
                            infoRegister: {
                                dateRegister: snapshot_course.val().students[userId].date,
                                status: snapshot_course.val().students[userId].status
                            },
                            countRegister: countRegister.length,
                            checkPoll: self.checkPoll
                        })
                    }
                })
            })
        })
        user.push({
            course: self.item
        })
    }
    return user
}

function acceptStudent(schoolId, courseId, studentId) {
    console.log(schoolId, courseId, studentId)
    firebase.database().ref('schools/' + schoolId + '/courses/' + courseId + '/students').child(studentId).update({
        status: "accepted"
    })
    firebase.database().ref('users/' + studentId + '/courses').child(courseId).update({
        status: "accepted"
    })
    return getDashboardSchool(schoolId)
}

function cregister(params) {
    self.checkRegister = []
    database.ref('schools/' + params.schoolId + '/courses/' + params.courseId + '/students/').child(params.studentId).on('value',
        function(snapshot) {
            self.checkRegister = snapshot.val()
        },
        function(errorObject) {
            console.log("The read failed: " + errorObject.code)
        })
    return self.checkRegister
}

function registerStd(schoolId, courseId, student) {
    console.log(schoolId, courseId, student);
    firebase.database().ref('schools/' + schoolId + '/courses/' + courseId + '/students').child(student.uid).set({
        data: student.providerData[0],
        date: date,
        status: "pending"

    })
    firebase.database().ref('users/' + student.uid + '/courses').child(courseId).set({
        schoolId: schoolId,
        courseId: courseId,
        date: date,
        status: "pending"
    })
    return {
        status: 200,
        text: "success"
    }
}

function createCourse(id, params) {
    self.statusCreateCourse = []
    firebase.database().ref('schools/' + id).child('courses').push(params)
    return getDashboardSchool(id)
}

function updateSchoolInfo(param, id) {
    firebase.database().ref('schools').child(id).update(param, function(error) {
        // body...
        if (error) {
            console.log("Data could not be saved." + error);
            // self.infoSchools.push({ status: 400 })
        } else {
            loadInfoSchool(id)
                //self.infoSchools.push({ status: 200 })
            console.log("Data saved successfully.");
        }
    })
    return self.infoSchools
}

function updateViewSchool(id) {
    console.log(id);
    loadSchool(self.database.schools)
    var thisSchool = self.school.find(
        school => school.id === id)

    var param = {
        view: thisSchool.value.view + 1
    }
    firebase.database().ref('schools').child(id).update(param)
}

function loadSchool(schools) {
    self.school = []
    var keys = Object.keys(schools)
    keys.sort() // sort the array of keys
    keys.forEach(function(item) {
        var item = {
            id: item,
            value: schools[item]
        }
        self.school.push(item)
    })
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
        // console.log(self.infoSchools)
    return self.infoSchools
}

function loadThisCourse(schoolId, courseId) {
    // body...
    var allCourses = []
    firebase.database().ref('schools/' + schoolId + '/courses/').child(courseId).on('value', function(snapshot) {
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        allCourses.push(item)
    })
    return allCourses
}

function loadAllCoures(uid) {
    var allCourses = []
    var returnItem = []
    var resultPoll = []
    database.ref('schools/' + uid).child('courses').on('child_added', function(snapshot) {
        // var countRegister = Object.keys(snapshot.val().students)
        var item = {
            id: snapshot.key,
            value: snapshot.val()
        }
        allCourses.push(item)
    })

    database.ref('schools/' + uid).child('poll').on('value', function(poll) {
        var t1, t2, t3, t4, t5, t6
        t1 = t2 = t3 = t4 = t5 = t6 = 0
        if (poll.val() == undefined) {
            console.log("Empty poll")
        } else {
            console.log(Object.keys(poll.val()).length)
            Object.keys(poll.val()).forEach(function(id) {
                var getDataPoll = poll.val()[id].dataPoll
                var count = 0
                Object.keys(getDataPoll).forEach(function(snp) {
                    count++
                    if (count == 1) {
                        t1 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 1 ", getDataPoll[snp].data)
                    } else if (count == 2) {
                        t2 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 2 ", getDataPoll[snp].data)
                    } else if (count == 3) {
                        t3 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 3 ", getDataPoll[snp].data)
                    } else if (count == 4) {
                        t4 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 4 ", getDataPoll[snp].data)
                    } else if (count == 5) {
                        t5 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 5 ", getDataPoll[snp].data)
                    } else if (count == 6) {
                        t6 += getDataPoll[snp].data
                        console.log("คะแนนข้อที่ 6 ", getDataPoll[snp].data)
                    }
                })
            })
            resultPoll.push({
                n:Object.keys(poll.val()).length,
                p1:t1,
                p2:t2,
                p3:t3,
                p4:t4,
                p5:t5,
                p6:t6
            })
        }
    })

    return {
        courses: allCourses,
        resultPoll: resultPoll
    }
}

function deleteCourse(params) {
    console.log(params)
    firebase.database().ref('schools/' + params.schoolId + '/courses/').child(params.courseId).remove()
    return getDashboardSchool(params.schoolId)
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return hour + ":" + min + ":" + sec + " - " + day + "/" + month + "/" + year;

}
