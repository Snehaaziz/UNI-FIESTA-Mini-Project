const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//create app
const app = express();
//use the app
app.use(bodyParser.json());
app.use(express.static('FRONTEND'));
app.use(bodyParser.urlencoded({
    extended: true
}));

//connect to mongodb
mongoose.connect('mongodb://localhost:27017/UNIFIESTA');
//create variable
var db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to mongodb database"));
db.once('open', () => console.log("Connected to database"));

// Define Student Model
const Student = mongoose.model('students', {
    studname: String,
    username: String,
    date: Date,
    email: String,
    password: String
});

// Student Signup Route
app.post("/stdsignform", (req, res) => {
    var studname = req.body.studname;
    var username = req.body.username;
    var date = req.body.date;
    var email = req.body.email;
    var password = req.body.password;

    console.log("studname:", studname);
    var data = {
        studname: studname,
        username: username,
        date: date,
        email: email,
        password: password
    };

    // Create a new student
    const newStudent = new Student(data);
    newStudent.save()
        .then(savedStudent => {
            console.log("Record Inserted Successfully to std cln", savedStudent._id);
            res.sendFile(__dirname + '/FRONTEND/event5.html');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});


// Student Login Route
app.post("/stdlogin", async (req, res) => {
    const { uname, upass } = req.body;

    try {
        // Check if the username exists in the students collection
        const student = await Student.findOne({ username: uname });

        if (student && student.password === upass) {
            // Authentication successful
            res.send("<script>alert('Login successful!'); window.location='/studentopt.html';</script>");
        } else {
            // Authentication failed
            res.send("<script>alert('Invalid username or password. Please try again.');</script>");
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Internal Server Error');</script>");
    }
});

// Other routes...

//define college schema
// Define College Model
const College = mongoose.model('colleges', {
    uniname: String,
    uni_id: String,
    loc: String,
    email: String,
    password: String
});

// College Signup Route
app.post("/unisignform", (req, res) => {
    var uniname = req.body.uniname;
    var uni_id = req.body.uni_id;
    var loc = req.body.loc;
    var email = req.body.email;
    var password = req.body.password;

    console.log("uniname:", uniname);
    var data = {
        uniname: uniname,
        uni_id: uni_id,
        loc: loc,
        email: email,
        password: password
    };

    // Create a new college
    const newCollege = new College(data);
    newCollege.save()
        .then(savedCollege => {
            console.log("Record Inserted Successfully to colleges cln", savedCollege._id);
            res.send("<script>alert('Signup successful!'); window.location='/college6.html';</script>");
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("<script>alert('Internal Server Error');</script>");
        });
});

// College Login Route
app.post("/unilogin", async (req, res) => {
    const { uni_id, unipass } = req.body;

    try {
        // Check if the university ID exists in the colleges collection
        const college = await College.findOne({ uni_id: uni_id });

        if (college && college.password === unipass) {
            // Authentication successful
            res.send("<script>alert('Login successful!'); window.location='/college6.html';</script>");
        } else {
            // Authentication failed
            res.send("<script>alert('Invalid university ID or password. Please try again.');</script>");
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Internal Server Error');</script>");
    }
});

//to post events in database
// Define Student Model
const Event = mongoose.model('events', {
    uni_name: String,
    uni_loc: String,
    eve_name: String,
    descr: String,
    date: Date,
    category: String,
    participation: String,
    regfee: Number,
    sponsorno: Number

});

// Student Signup Route
app.post("/submit_request", (req, res) => {
    var uni_name = req.body.uni_name;
    var uni_loc = req.body.uni_loc;
    var eve_name = req.body.eve_name;
    var descr = req.body.descr;
    var date = req.body.date;
    var category= req.body.category;
    var participation= req.body.participation; 
    var regfee= req.body.regfee;
    var sponsorno= req.body.sponsorno;

   
    var data = {
        uni_name : uni_name,
     uni_loc : uni_loc,
     eve_name : eve_name,
     descr : descr,
     date : date,
     category: category,
     participation: participation,
     regfee: regfee,
     sponsorno: sponsorno
    };

    // Create a new event
    const newEvent = new Event(data);
    newEvent.save()
        .then(savedEvent => {
            console.log("Record Inserted Successfully to events cln", savedEvent._id);
            res.sendFile(__dirname + '/FRONTEND/college6.html');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});

//fetching from event db to html
app.get("/events", async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//code to transfer from events to approved
// Define Approved schema
const ApprovedEvent = mongoose.model('approveds', {
    uni_name: String,
    uni_loc: String,
    eve_name: String,
    descr: String,
    date: Date,
    category: String,
    participation: String,
    regfee: Number,
    sponsorno: Number
});

// Handle approval request
app.post("/approve", async (req, res) => {
    
    const eventName= req.body.eventName;
    
    try {
        // Find the event in the "events" collection
        const event = await Event.findOne({ eve_name: eventName });

        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Insert the event into the "approved" collection
        const approvedEvent = new ApprovedEvent(event.toObject()); // Convert Mongoose document to plain JavaScript object
        await approvedEvent.save();
        console.log('event entered to approved');

        // Remove the event from the "events" collection
        await Event.deleteOne({ eve_name: eventName });
        console.log('event deleted from events');
        res.status(200).send(`Event "${eventName}" approved`);
    } catch (error) {
        console.error('Error approving event:', error);
        res.status(500).send("Internal Server Error");
    }
});

//handle delete
app.delete("/delete", async (req, res) => {
    try {
        const eventName = req.body.eventName;

        // Find the event in the "events" collection
        const event = await Event.findOne({ eve_name: eventName });

        if (!event) {
            return res.status(404).send("Event not found");
        }

        // Remove the event from the "events" collection
        await Event.deleteOne({ eve_name: eventName });
        console.log('Event deleted:', eventName);
        res.status(200).send(`Event "${eventName}" deleted`);
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).send("Internal Server Error");
    }
});

//display approved events
app.get("/approveds", async (req, res) => {
    try {
        const approvedEvents = await ApprovedEvent.find();
        res.json(approvedEvents);
    } catch (error) {
        console.error('Error fetching approved events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//search function
// Assuming you have already set up your express app and mongoose models

// Handle search request
// Search route
// Route to handle search request
app.get("/search", async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ error: 'Missing search query' });
        }

        const searchResults = await ApprovedEvent.find({
            $or: [
                { uni_name: { $regex: query, $options: 'i' } }, // Case-insensitive search by university name
                { uni_loc: { $regex: query, $options: 'i' } },
                { category: {$regex: query, $options: 'i'} },
                { participation: {$regex: query, $options: 'i'}}
                // Case-insensitive search by location
            ]
        });

        res.json(searchResults);
    } catch (error) {
        console.error('Error searching events:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//for writing review
const Attend = mongoose.model('attended', {
    uname: String,
    name: String,
    eve_name: String,
    uni_name: String,
    date: Date,
    category: String,
    revieww: String
    

});
// Student Signup Route
app.post("/attends", (req, res) => {
    var uname = req.body.uname;
    var studname = req.body.studname;
    var eve_name = req.body.eve_name;
    var date = req.body.date;
    var category= req.body.category;
    var revieww= req.body.revieww; 
   

   
    var data = {
        uname : uname,
     studname : studname,
     eve_name : eve_name,
     date : date,
     category: category,
     revieww: revieww
    
    };

    // Create a new event
    const newReview = new Attend(data);
    newReview.save()
        .then(savedAttend => {
            console.log("Record Inserted Successfully to attended cln", savedAttend._id);
            res.sendFile(__dirname + '/FRONTEND/studentopt.html');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});

//to mark attendance
const Mark = mongoose.model('attendee', {
   uni_id: String,
   eve_name: String,
   uname: String
});
// to post in atendee colection Route
app.post("/mark", (req, res) => {
    var uni_id = req.body.uni_id;
    var eve_name = req.body.eve_name;
    var uname = req.body.uname;

   

   
    var data = {
    uni_id : uni_id,
     eve_name : eve_name,
     uname: uname
    
    };

    // Create a new event
    const newMark= new Mark(data);
    newMark.save()
        .then(savedMark => {
            console.log("Record Inserted Successfully to attended cln", savedMark._id);
            res.sendFile(__dirname + '/FRONTEND/college6.html');
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Internal Server Error");
        });
});

// Add this endpoint to check if the username exists in the attendees collection
app.get('/check-attendee', async (req, res) => {
    const { uname } = req.query;

    try {
        // Check if the username exists in the attendees collection
        const attendee = await Mark.findOne({ uname });

        if (attendee) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking attendee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get("/", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": '*'
    });
    res.sendFile(__dirname + '/FRONTEND/homepage1.html');
}).listen(3000);

console.log("Listening on port 3000");
