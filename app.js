const express = require('express');
const bodyParser = require('body-parser');
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


    const AssignTeacherSql = `UPDATE courses SET TeacherID=? WHERE CourseID=?`;
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
});

// End point to enable or disable the availability of a course

app.put('/courseAvailability/:id', (req, res) => {
    const Course_upid = req.params.id;
    const isAvailable = req.body.isAvailable;

    const courseAvailabilitySql = 'UPDATE courses SET isAvailable =? WHERE CourseID=?';
    connection.query(courseAvailabilitySql, [isAvailable, Course_upid], (error, results) => {
        if (error) {
            res.status(500).send("Failed to Enable or Disable the availability of a course.");
            throw error;
        }

        const updatedDate={
            CourseID : Course_upid,
            isAvailable : isAvailable
        };

        res.status(200).json({
            message: "Course Availability has been changed.",
            UpdatedData: updatedDate

        });
    });
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});