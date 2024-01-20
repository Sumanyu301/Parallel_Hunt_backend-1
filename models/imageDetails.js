const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  email: String,
});

const Images = mongoose.model("Images1", imageSchema);

module.exports = Images;
