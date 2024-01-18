const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  pincode: Number,
  types: String,
  location: String,
  likes: Number,
});

const User = mongoose.model("Event", eventSchema);
module.exports = Event;
