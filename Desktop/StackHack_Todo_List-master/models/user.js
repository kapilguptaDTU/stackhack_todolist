var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


    
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    tasks: [
        {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Task"
        }
     ]      
});

UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model("User", UserSchema);