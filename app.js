const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json())
const port = 3000;

// Setup database connection
const connection = mysql.createConnection({
    host: 'your host ip',
    user: 'your user name',
    database: 'your database name',
    password: 'yourpassword'
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
app.put('/enroll/', (req, res) => {
    const { CourseID, UserID } = req.body;

    // Verify role
    const checkRoleSql = 'SELECT RoleID FROM users WHERE UserID = ?';
    connection.query(checkRoleSql, [UserID], (error, results) => {
        if (error) {
            console.error("Failed to verify user role:", error);
            return res.status(500).send("Failed to verify user role.");
        }

        // If the user is not a student
        if (results.length > 0 && results[0].RoleID !== 3) {
            return res.status(400).send('Only Students can enroll in courses.');
        }

        // Check if the course is available
        const CourseAvailabilitySql = 'SELECT isAvailable FROM courses WHERE CourseID = ?';
        connection.query(CourseAvailabilitySql, [CourseID], (error, results) => {
            if (error || results.length === 0 || results[0].isAvailable === 0) {
                console.error("Course availability check failed:", error);
                return res.status(400).send('Course is not available.');
            }

            // Check if the student has already enrolled in the course
            const enrollmentCheckSql = 'SELECT * FROM enrolments WHERE CourseID = ? AND UserID = ?';
            connection.query(enrollmentCheckSql, [CourseID, UserID], (error, results) => {
                if (error || results.length > 0) {
                    console.error("Enrollment check failed:", error);
                    return res.status(400).send('Student has already enrolled in the course.');
                }

                // Enroll the student in the course
                const enrollStudentSql = 'INSERT INTO enrolments (Mark, CourseID, UserID) VALUES (NULL, ?, ?)';
                connection.query(enrollStudentSql, [CourseID, UserID], (error, results) => {
                    if (error) {
                        console.error("Failed to enroll student:", error);
                        return res.status(500).send('Failed to enroll student.');
                    }

                    const updatedData = {
                    CourseID: CourseID,
                    UserID: UserID
                    };

                    res.status(200).json({
                        message: "Student enrolled successfully.",
                        enrolment: updatedData
                    });
                });
            });
        });
    });
});


//Teacher assign marks to students
app.put('/marks/', (req, res) => {
    const { CourseID, Mark, UserID, enrolmentID, TeacherID } = req.body

    // Verify role
    const checkRoleSql = 'SELECT RoleID FROM users WHERE UserID = ?';
    connection.query(checkRoleSql, [UserID], (error, results) => {
        if (error) {
            console.error("Failed to verify user role:", error);
            return res.status(500).send("Failed to verify user role.");
        }

        // If the user is not a student
        if (results.length > 0 && results[0].RoleID !== 2) {
            return res.status(400).send('Only Teachers can give the marks.');
        }
        // check if the teacher teaches the course
        const teachingSql= 'SELECT * FROM courses WHERE CourseID = ? AND TeacherID = ? AND isAvailable = true';
        connection.query(teachingSql, [CourseID,TeacherID], (error,results) =>{
            if (results.length === 0){
            res.status(400).send('Not the teacher of this course.');
            }
            //Check if the enrolmentID exist
            const CheckEnrolmentSql = 'SELECT * FROM enrolments WHERE enrolmentID=? ';
                connection.query(CheckEnrolmentSql,[enrolmentID], (error, results) =>{
                if (results.length === 0){
                res.status(400).send('Enrolment ID do not exist.');
                }
                //Pass all checks, update the mark
                const UpdateMarkSql = 'UPDATE enrolments SET Mark =? WHERE enrolmentID=?';
                connection.query(UpdateMarkSql,
                    [Mark, enrolmentID],
                    (error, results) => {
                        if (error) {
                            return res.status(500).send('Failed to assign mark.');
                        }

                        const updatedData = {
                            "EnrolmentID": enrolmentID,
                            "Mark": Mark,
                            "Course": CourseID
                        };

                        res.status(200).json({
                            message: "Mark Updated!.",
                            enrolment: updatedData
                        });
                    });
            });
        });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
});
