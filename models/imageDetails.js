const mongoose = require("mongoose");

const ImageDetailsScehma = new mongoose.Schema(
  {
    image: String,
  },
  {
    collection: "ImageDetails",
  }
);

const Image =mongoose.model("ImageDetails", ImageDetailsScehma);
module.exports = Image;