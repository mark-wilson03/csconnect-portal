const express = require('express'); // require express
const mysql = require('mysql2'); // require mysql
const bodyParser = require('body-parser'); // require body-parser
const path = require('path'); // require path

const app = express();

app.use(bodyParser.json());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'csconnect_portal/frontend'))); // file path
app.use(express.json());


// Connection to MySql Database
const database = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '120305',
    database: 'csconnect_portal_database'
});


// Check if the connection is successful
database.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL Database!');
});


// Serve Main HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'csconnect_portal/frontend/Main.html')); // 
});


/*===== API ENDPOINT TO GET STUDENT COUNTS BY YEAR =====*/
app.get('/api/student-counts', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total_all,
            SUM(CASE WHEN Hours = 0 THEN 1 ELSE 0 END) as completed_all,
            
            COUNT(CASE WHEN YearLevel = '1st Year' THEN 1 END) as total_y1,
            SUM(CASE WHEN YearLevel = '1st Year' AND Hours = 0 THEN 1 ELSE 0 END) as completed_y1,
            
            COUNT(CASE WHEN YearLevel = '2nd Year' THEN 1 END) as total_y2,
            SUM(CASE WHEN YearLevel = '2nd Year' AND Hours = 0 THEN 1 ELSE 0 END) as completed_y2,
            
            COUNT(CASE WHEN YearLevel = '3rd Year' THEN 1 END) as total_y3,
            SUM(CASE WHEN YearLevel = '3rd Year' AND Hours = 0 THEN 1 ELSE 0 END) as completed_y3,
            
            COUNT(CASE WHEN YearLevel = '4th Year' THEN 1 END) as total_y4,
            SUM(CASE WHEN YearLevel = '4th Year' AND Hours = 0 THEN 1 ELSE 0 END) as completed_y4
        FROM student_table
    `;

    database.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching counts:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results[0]);
    });
});


/*===== STUDENT REGISTRATION =====*/
app.post('/student-form', (req, res) => {
    const {
        id_number,
        lastname,
        first_name,
        middle_name,
        year_level,
        section,
        email_address,
        contact_number,
        address,
        hours
    } = req.body;

    const sql = `
        INSERT INTO student_table
        (IDNumber, Lastname, Firstname, MiddleName, YearLevel, Section, EmailAddress, ContactNumber, Address, Hours, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    database.query(sql,
        [id_number, lastname, first_name, middle_name, year_level, section, email_address, contact_number, address, hours, "student123"],
        (err, result) => {
            if (err) {
                console.error('Error saving student:', err);
                return res.status(500).send("Error saving student to database");
            }
            res.send("<script>alert('Student Registered Successfully!'); window.location.href='/StudentSection.html';</script>");
        }
    );
});


/*===== ADMINISTRATOR REGISTRATION =====*/
app.post('/admin-form', (req, res) => {
    const {
        id_number,
        lastname,
        first_name,
        middle_name,
        email_address,
        contact_number,
        address
    } = req.body;

    const sql = `
        INSERT INTO administrator_table
        (IDNumber, Lastname, Firstname, MiddleName, EmailAddress, ContactNumber, Address, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    database.query(sql,
        [id_number, lastname, first_name, middle_name, email_address, contact_number, address, "admin123"],
        (err, result) => {
            if (err) {
                console.error('Error saving admin:', err);
                return res.status(500).send("Error saving admin to database");
            }
            res.send("<script>alert('Administrator Registered Successfully!'); window.location.href='/AdministratorSection.html';</script>");
        }
    );
});




/*===== SIGN IN ACCOUNT =====*/
app.post('/sign-in-form', (req, res) => {
    const { id_number, password } = req.body;

    // Check Student Table
    const studentSQL = `SELECT * FROM student_table WHERE IDNumber = ? AND password = ?`;

    database.query(studentSQL, [id_number, password], (err, studentResult) => {
        if (err) return res.status(500).send("Database error");

        if (studentResult.length > 0) {
            const user = studentResult[0];
            user.role = "student"; // Explicitly add role to the user object
            return res.json({ success: true, role: "student", user: user });
        }

        // Check Administrator Table
        const adminSQL = `SELECT * FROM administrator_table WHERE IDNumber = ? AND password = ?`;

        database.query(adminSQL, [id_number, password], (err, adminResult) => {
            if (err) return res.status(500).send("Database error");

            if (adminResult.length > 0) {
                const user = adminResult[0];
                user.role = "admin"; // Explicitly add role to the user object
                return res.json({ success: true, role: "admin", user: user });
            } else {
                return res.status(401).json({ success: false, message: "Account Not Found" });
            }
        });
    });
});



/*===== API ENDPOINT TO GET STUDENTS =====*/
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM student_table';
    database.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});


/*===== API ENDPOINT TO GET ADMINISTRATORS =====*/
app.get('/api/administrators', (req, res) => {
    const sql = 'SELECT * FROM administrator_table';
    database.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching administrators:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});



/*===== CHANGE PASSWORD =====*/
app.post('/api/change-password', (req, res) => {
    const { id_number, current_password, new_password, role } = req.body;

    if (!id_number || !current_password || !new_password || !role) {
        return res.status(400).json({ success: false, message: "Missing required information." });
    }
    
    const tableName = (role === 'admin') ? 'administrator_table' : 'student_table';
    const checkSQL = `SELECT password FROM ${tableName} WHERE IDNumber = ?`;

    database.query(checkSQL, [id_number], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error." });
        
        if (result.length === 0) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        // Verify current password
        if (result[0].password !== current_password) {
            return res.status(401).json({ success: false, message: "Incorrect current password." });
        }

        // Update to new password
        const updateSQL = `UPDATE ${tableName} SET password = ? WHERE IDNumber = ?`;
        database.query(updateSQL, [new_password, id_number], (updateErr) => {
            if (updateErr) return res.status(500).json({ success: false, message: "Update failed." });
            res.json({ success: true, message: "Password updated successfully!" });
        });
    });
});



// Update Community Service Hours of Students
app.post('/api/update-hours', (req, res) => {

    const { id_number, hours } = req.body;

    const sql = `
        UPDATE student_table
        SET Hours = ?
        WHERE IDNumber = ?
    `;

    database.query(sql, [hours, id_number], (err, result) => {

        if(err){
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});


/*===== API ENDPOINT TO GET INDIVIDUAL STUDENT DATA =====*/
app.get('/api/student/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM student_table WHERE IDNumber = ?';
    
    database.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, error: err });
        }
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(404).json({ success: false, message: "Student not found" });
        }
    });
});


// Delete Student Account
app.delete("/api/delete-student/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM student_table WHERE IDNumber = ?";

    database.query(sql, [id], (err,result)=>{

        if(err){
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});


// Delete Administrator Account
app.delete("/api/delete-administrator/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM administrator_table WHERE IDNumber = ?";

    database.query(sql, [id], (err,result)=>{

        if(err){
            console.error(err);
            return res.json({ success:false });
        }
        res.json({ success:true });
    });
});


// Start serveripconfig
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});