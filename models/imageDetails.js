const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

const Images = mongoose.model("Images", imageSchema);

module.exports = Images;
