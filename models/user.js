const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  personal: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    pincode: { type: Number, required: true },
    DOB: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    address: { type: String }, 
  },
  professional: {
    organisation: String,
    profession: String,
    experience: Number,
    skills: String,
    certification: String,
    tech_stack: String,
    availability: Boolean,
    resume: String,
    achievements: String,
  },
});

const User = mongoose.model("User_table", userSchema);
module.exports = User;
