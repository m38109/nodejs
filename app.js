const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json())
const port = 3000;

// Setup database connection
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'mydb',
    password: 'mysql8109'
});

// Connect to the database
connection.connect(error => {
    if (error) throw error;
    console.log("Successfully connected to the database.");
});


// Endpoint to assign a teacher to a course
app.put('/assignTeacher/:id', (req, res) => {
    const Course_upid = req.params.id;
    const TeacherID = req.body.TeacherID;
    const UserID = req.body.UserID;

    //verify user's role
    const checkAdminSql = `SELECT RoleID
                           FROM users
                           WHERE UserID = ?`;

    connection.query(checkAdminSql, [UserID], (error, results) => {
        if (error) {
            res.status(500).send("Failed to verify user role.");
            throw error;
        }

        //Check if the user is an Admin
        if (results.length > 0 && results[0].RoleID === 1) {
            //User is an Admin, proceed to assign teacher to course
            const AssignTeacherSql = `UPDATE courses
                                      SET TeacherID=?
                                      WHERE CourseID = ?`;
            connection.query(AssignTeacherSql, [TeacherID, Course_upid], (error, results) => {
                if (error) {
                    res.status(500).send("Failed to assign teacher to course.");
                    throw error;
                }

                const updatedData = {
                    CourseID: Course_upid,
                    TeacherID: TeacherID
                };

                res.status(200).json({
                    message: "Teacher successfully assigned to course.",
                    updatedData: updatedData
                });
            });
        } else {
            //User is not an Admin, deny the request
            res.status(403).send("Unauthorized!!")
        }
    });
});


// Endpoint to enable or disable the availability of a course
app.put('/courseAvailability/:id', (req, res) => {
    const Course_upid = req.params.id;
    const isAvailable = req.body.isAvailable;
    const UserID = req.body.UserID;

    //verify user's role
    const checkAdminSql = `SELECT RoleID FROM users WHERE UserID = ?`;

    connection.query(checkAdminSql, [UserID], (error, results) => {
        if (error) {
            res.status(500).send("Failed to verify user role.");
            throw error;
        }

        //Check if the user is an Admin
        if (results.length > 0 && results[0].RoleID === 1) {
            //User is an Admin, proceed to assign teacher to course
            const courseAvailabilitySql = 'UPDATE courses SET isAvailable =? WHERE CourseID=?';
            connection.query(courseAvailabilitySql, [isAvailable, Course_upid], (error, results) => {
                if (error) {
                    res.status(500).send("Failed to Enable or Disable the availability of a course.");
                    throw error;
                }

                const updatedData = {
                    CourseID: Course_upid,
                    isAvailable: isAvailable
                };

                res.status(200).json({
                    message: "Course Availability has been changed.",
                    updatedData: updatedData
                });
            });
        } else {
            //User is not an Admin, deny the request
            res.status(403).send("Unauthorized!!")
        }
    });
});

// View all available courses with teacher's name
app.get('/viewcourses/',(req, res) => {

    const AvailableCourseSql = `SELECT 
        courses.Title AS CourseTitle, users.Name AS TeacherName
        FROM courses
        JOIN users ON courses.TeacherID = users.UserID
        WHERE courses.isAvailable = 1`

    connection.query(AvailableCourseSql, (error, results) => {
        if (error) {
            res.status(500).send('Fail to list the courses.');
            throw error;
        }
        res.status(200).json(results)

    });

});

// Student enroll in available course once
app.put('/enroll', (req,res) =>{

    const CourseID = req.body.CourseID;
    const UserID = req.body.UserID;

    //verify role
    const checkRoleSql= 'SELECT Role FROM roles WHERE userID=?';
    connection.query(checkRoleSql, [UserID], (error, results) => {
        if (error) {
            res.status(500).send("Failed to verify user role.");
            throw error;
        }

        //If the user is not a student
        if (results.length > 0 && results[0].RoleID !== 3) {
           res.status(400).send('Only Student can enroll in courses');
        }
        // Check if Courses is Available
        const CourseAbailabilitySql ='SELECT isAvailable FROM courses WHERE CourseID=?';
        connection.query(CourseAbailabilitySql, [CourseID], (error, results) =>{
            if (results.length >0 && results[0].isAvailable === 0){
                res.status(400).send('Course is not Available.');
            }
            // Check if the student has enrolled in the course
            const enrollmentCheckSql = 'SELECT * FROM enrolments WHERE CourseID =? AND UserID=?';
            connection.query(enrollmentCheckSql, [CourseID, UserID], (error, results) =>{
                if (results.length > 0) {
                    res.status(400).send('Student has enrolled in the course.')
                }
                //Enroll the student in the course
                const enrollstuendtSql = 'INSERT INTO enrolments (Marks,CourseID, UserID) VALUES (NULL,?,?)';
                connection.query(enrollstuendtSql, [CourseID, UserID], (error,results) =>{
                    if (error){
                        res.status(400).send('Failed');
                        throw error;
                    }
                    const updateData ={
                        CourseID:CourseID,
                        UserID: UserID
                    }

                    res.status(200).json({
                    message: "Student enrolled successfully.",
                    updateData: updateData
                    });
                });
            });
        });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});