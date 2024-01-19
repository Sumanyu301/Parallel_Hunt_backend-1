const mongoose = require("mongoose");

const ImageDetailsScehma = new mongoose.Schema({
  email:{
    type: String,
    required:true
  },
  image:
  {
    data:Buffer,
    contentType:String
  }
});

const imageModel =mongoose.model("ImageModel", ImageDetailsScehma);
module.exports = imageModel;