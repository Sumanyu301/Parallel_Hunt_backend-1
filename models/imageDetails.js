const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  filename: String,
  uploadDate: Date,
});

const Images = mongoose.model("Images", imageSchema);

module.exports = Images;
module.exports = {
  url: "mongodb://localhost:27017/",
  database: "bezkoder_files_db",
  imgBucket: "photos",
};
