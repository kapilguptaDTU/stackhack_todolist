
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var taskSchema = new mongoose.Schema({
    title: String,
    body: String,
    taskType: String,
    status: String,
    created: {
        type: Date,
        default: Date.now
    },
    dueDate:{
        type: Date
    },
    creator:{
        type: mongoose.Schema.Types.ObjectId,
           ref: "User"
    }
});

module.exports = mongoose.model("Task", taskSchema);