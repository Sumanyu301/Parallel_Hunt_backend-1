const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  personal: {
    name: { type: String, required: true },
    DOB: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
  },
  professional: {
    organisation: String,
    skills: String,
    education: String,
    tech_stack: String,
    availability: Boolean,
    resume: String,
    achievements: String,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
