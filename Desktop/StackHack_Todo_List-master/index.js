const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');



const app = express();

var passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Task = require("./models/task"),
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
// mongoose.connect( uri,{ useNewUrlParser: true ,useUnifiedTopology: true });

// KAPIL'S LOCALHOST
mongoose.connect('mongodb://localhost:27017/TODO', {
    useUnifiedTopology: true,
    useNewUrlParser: true
}, (err) => {
    if (!err) {
        console.log('MongoDB connection successful')
    } else {
        console.log('Error in DB connection' + err)
    }

// https://github.com/kapilguptaDTU/stackhack_todolist.git
});

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




mongoose.set('useFindAndModify', false);
// RESTFUL ROUTES

app.get('/', (req, res) => {
    res.redirect("home");
});


app.get("/home", isLoggedIn, (req, res) => {
    User.findById(req.user).populate("tasks").exec(function (err, reciever) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(reciever.username)
            // console.log(reciever.tasks)
            
            res.render("home.ejs", {
                                task: reciever.tasks
            
                     });
        }
    });
});

app.get("/archives", isLoggedIn, (req, res) => {
    User.findById(req.user).populate("tasks").exec(function (err, reciever) {
        
        if (err) {
            console.log(err);
        } else {
            console.log(reciever.username)
            // console.log(reciever.tasks)
            
            res.render("archives.ejs", {
                                task: reciever.tasks
            
                     });
        }
    });
});





app.get('/new',isLoggedIn, (req, res) => {
    res.render('todo/new');
});

app.post('/home',isLoggedIn, (req, res) => {
    // console.log(req.body);
    Task.create(req.body, (err, task) => {
        if (err) {
            console.log("err has occured while inserting an entry into the database");
        } else {
            // console.log(`a new task has been created : ${task}`);
            var date=task.dueDate;
            var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
            console.log(newDate);
            task.dueDate=newDate;
            task.creator=req.user._id;
            req.user.tasks.push(task._id);
            req.user.save();
            task.save();
            console.log(task.creator);
            res.redirect("/home");
        }
    });
});

app.get('/home/:id/edit',isLoggedIn, (req, res) => {
    Task.findById(req.params.id, (err, task) => {
        if (err) {
            console.log("trouble finding the entry with id : " + req.params.id);
        } else {


            function formatDate(d) {
                date = new Date(d)
                var dd = date.getDate();
                var mm = date.getMonth() + 1;
                var yyyy = date.getFullYear();
                if (dd < 10) {
                    dd = '0' + dd
                }
                if (mm < 10) {
                    mm = '0' + mm
                };
                return d = yyyy + '-' + mm + '-' + dd 
            }

            var dat=task.dueDate;
            var datt=formatDate(dat);



            res.render('todo/edit', {
                task: task,
                datt:datt
            });
        }
    });
})

app.put("/home/:id/",isLoggedIn, (req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body.task, (err, editedTask) => {
        if (err) {
            console.log("trouble updating the entry with id : " + req.param.id);
        } else {
            console.log("task is edited");
            res.redirect("/home");
        }
    })
});




 app.delete("/home/:id/delete",isLoggedIn, (req, res) => {
    Task.findByIdAndDelete(req.params.id, (err, deletedTask) => {
        if (err) {
            console.log("problem encountered while deleting");
        } else {
            console.log(`task with id ${deletedTask._id} is deleted`);
            res.redirect("/home");
        }
    })
 });


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
        username: req.body.username
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