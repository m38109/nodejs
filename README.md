# End-Module Assignment

## Introduction
This project provides a RESTful API to meet the provied functionalities, built with Node.js and Express, and uses MySQL for data storage. It allows for operations such as assigning teachers to courses, managing course availability, enrolling students, and assigning marks.

## Getting Started

### Prerequisites
- Node.js (express, mysql2)
- MySQL

### Installation
1. Clone the repository to your local machine.
2. Install dependencies by running `npm install`.
3. Set up a MySQL database and update the database connection settings in `app.js`.

### Database Setup
- The application expects a MySQL database named `mydb`.
- Update the connection details in `app.js` with your database host, user, password, and database name.

### Running the Application
Run the application using the command `node app.js`. The server will start on port 3000.

## API Endpoints

### Assign Teacher to Course
- **PUT** `/assignTeacher/:id`
- Assigns a teacher to a course by course ID.

### Course Availability
- **PUT** `/courseAvailability/:id`
- Updates the availability status of a course.

### View Available Courses
- **GET** `/viewcourses/`
- Retrieves all available courses along with the teacher's name.

### Student Enrollment
- **PUT** `/enroll/`
- Enrolls a student in a course if the student is eligible.

### Assign Marks
- **PUT** `/marks/`
- Allows a teacher to assign marks to a student for a course.

## Security
This application does not include authentication or authorization mechanisms. It is recommended to implement suitable security measures for production use.

## Contributions
Contributions are welcome. Please open an issue or submit a pull request with your improvements.

## License
This project is open-sourced under the MIT License.

