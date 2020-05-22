const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');



const app = express();

var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user");


// APP CONFIG

// Line:11 Parse incoming request bodies in a middleware before the handlers, available under the req.body property.
app.use(bodyParser.urlencoded({
    extended: true
}));

//To serve static files such as images, CSS files, and JavaScript files in the directory public
app.use(express.static("public"));

// Setting the view engine we are using as ejs 
app.set("view engine", "ejs");

// Enabels us to serve PUT and POST requests
app.use(methodOverride("_method"));


// DB CONFIG
// uri to connect to mlab 
const uri = "mongodb+srv://abhijeet:dirtyclown@cluster0-lyzlv.mongodb.net/test?retryWrites=true&w=majority";



// to run in local environment 
// mongoose.connect("mongodb://localhost/todoList",{ useNewUrlParser: true ,useUnifiedTopology: true });
// to run in mlab db server
mongoose.connect( uri,{ useNewUrlParser: true ,useUnifiedTopology: true });

// KAPIL'S LOCALHOST
// mongoose.connect('mongodb://localhost:27017/TODO', {
//     useUnifiedTopology: true,
//     useNewUrlParser: true
// }, (err) => {
//     if (!err) {
//         console.log('MongoDB connection successful')
//     } else {
//         console.log('Error in DB connection' + err)
//     }


// });

mongoose.set('useFindAndModify', false);
// app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function (req, res, next) {
    res.locals.currentUser = req.user;

    global.currentwala = req.user;

    next();
});

User.find({}, (err, docs) => {
    if (!err) {

        global.globalUsers = docs;
    }
});


// making schema 
var taskSchema = new mongoose.Schema({
    title: String,
    body: String,
    taskType: String,
    status: String,
    created: {
        type: Date,
        default: Date.now
    }
});
mongoose.set('useFindAndModify', false);
var Task = mongoose.model("Task", taskSchema);

// RESTFUL ROUTES

app.get('/', (req, res) => {
    res.redirect("home");
});

app.get("/home", (req, res) => {
    // task will contain value from all the entity in the database
    Task.find({}, (err, task) => {
        if (err) {
            console.log("error while recieving entries from the database");
        } else {
            res.render("home.ejs", {
                task: task
            });
        }
    })
});

app.get('/new', (req, res) => {
    res.render('todo/new');
});

app.post('/home', (req, res) => {
    console.log(req.body);
    Task.create(req.body, (err, task) => {
        if (err) {
            console.log("err has occured while inserting an entry into the database");
        } else {
            console.log(`a new task has been created : ${task}`);
            res.redirect("/home");
        }
    });
});

app.get('/home/:id/edit', (req, res) => {
    Task.findById(req.params.id, (err, task) => {
        if (err) {
            console.log("trouble finding the entry with id : " + req.params.id);
        } else {
            res.render('todo/edit', {
                task: task
            });
        }
    });
})

app.put("/home/:id/", (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body.task, (err, editedTask) => {
        if (err) {
            console.log("trouble updating the entry with id : " + req.param.id);
        } else {
            console.log("task is edited");
            res.redirect("/home");
        }
    })
});

app.delete("/home/:id/delete", (req, res) => {
    Task.findByIdAndDelete(req.params.id, (err, deletedTask) => {
        if (err) {
            console.log("problem encountered while deleting");
        } else {
            console.log(`task with id ${deletedTask._id} is deleted`);
            res.redirect("/home");
        }
    })
});

/*
app.get('/home',(req,res)=>{
    Entry.find({},(err,entry)=>{
        if(err){
            console.log("error while recieving entries from the database");
        }else{
            res.render("home.ejs",{entry:entry});   
        }
    })
});

app.post('/home',(req,res)=>{
    Entry.create(req.body,(err,entry)=>{
        if(err){
            console.log("err has occured while inserting an entrt into the database");
        }else{
            res.redirect("/home");
        }
    });
});

app.get('/new',(req,res)=>{
    res.render('new');
});

app.get('/home/:id',(req,res)=>{
     Entry.findById(req.params.id,(err,entry)=>{
         if(err){
            console.log("trouble finding the entry with id : "+req.params.id);
         }else{
            res.render('entry',{entry:entry});
         }
     }) 
})

app.get('/home/:id/edit',(req,res)=>{
    Entry.findById(req.params.id,(err,entry)=>{
        if(err){
           console.log("trouble finding the entry with id : "+req.params.id);
        }else{
           res.render('edit',{entry:entry});
        }
    });
})
app.put("/home/:id/",(req,res)=>{
    Entry.findByIdAndUpdate(req.params.id,req.body.entry,(err,ent)=>{
        if(err){
            console.log("trouble updating the entry with id : "+req.param.id);
        }else{
            res.redirect("/home");
        }
    })
})
app.delete("/home/:id/delete",(req,res)=>{
    Entry.findByIdAndDelete(req.params.id,(err,ent)=>{
        if(err){
            console.log("problem encountered while deleting");
        }else{
            res.redirect("/home");
        }
    })
})
*/
app.listen(2023, () => {
    console.log('server is running...')
});

// ....................................................
//AUTHENTICATION ROUTES
// ....................................................

app.get("/register", function (req, res) {
    res.render("user/register");
});
//handle sign up logic
app.post("/register", function (req, res) {
    var newUser = new User({
        username: req.body.username,
        mobile: req.body.mobile,
        state: req.body.state,
        city: req.body.city,
        highscore: '0',
        profileImage: req.body.profileImage,
        description: req.body.description

    });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        });
    });
});

// show login form
app.get("/login", function (req, res) {
    res.render("user/login");
});
// handling login logic
app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login"
}), function (req, res) {});

// logic route
app.get("/logout", function (req, res) {
    req.logout();
    console.log("succesfuly logged out");
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}