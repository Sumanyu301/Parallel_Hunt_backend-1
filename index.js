const express = require("express");
const app = express();
const bcrypt = require("bcryptjs"); // password hashing ke liye
const mongoose = require("mongoose");
const dotenv = require("dotenv"); //environment var ke liye
const cors = require("cors"); // cors library
const multer = require("multer"); //image upload karne ke liye more like files ke liye but yeah
const port = process.env.PORT || 5000; //env mein port storage
const fs = require("fs");
app.use(cors()); // enable CORS
//mongoose connection
const User = require("./models/user.js"); //importing the db schema for user
const Event = require("./models/event.js"); //event ka schema
const Admin = require("./models/admin.js"); //admin ka schema
const Images = require("./models/imageDetails.js"); //image details
const path = require("path"); //path module
const z = require("zod"); //zod input validation.

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //form se data jab aata hai
//app.use("/uploads" , express.static( path.join(__dirname ,"/uploads")));

const userZodSchema = z.object({
  personal: z.object({
    name: z.string(),
    DOB: z.string(),
    Email: z.string().email(),
    password: z.string(),
    address: z.string(),
  }),
  professional: z.object({
    organisation: z.string().optional(),
    skills: z.string().optional(),
    tech_stack: z.string().optional(),
    availability: z.boolean().optional(),
    resume: z.string().optional(),
    achievements: z.string().optional(),
    education: z.string(),
  }),
});

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then((result) => {
    console.log("Db connected successfully");
  })
  .catch((err) => {
    console.log(" DB error :-" + err);
  });

app.post("/signup", async (req, res) => {
  const data = req.body;
  const password = data.personal.password;

  const existingUser = await User.findOne({
    "personal.Email": data.personal.Email,
  });
  if (existingUser) {
    return res.status(200).json({ msg: false });
  }

  //creating a salt
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  data.personal.password = hashedPassword;

  try {
    // Parse the data through the Zod schema
    const parsedData = userZodSchema.parse(data);

    const newUser = new User(parsedData);
    await newUser.save();
    res.status(200).json({ msg: true });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/login", async (req, res) => {
  const Email = req.body.Email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ "personal.Email": Email });
    if (!user) {
      return res.status(200).json({ msg: false });
    }
    const dbPassword = user.personal.password;
    const result = await bcrypt.compare(password, dbPassword);
    if (result) {
      return res.status(200).json({ msg: true, user: user });
    } else {
      return res.status(200).json({ msg: false });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.get("/person", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/admin/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const user = await Admin.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ msg: "wrong credentials" });
    }
    const dbPassword = user.password;
    const result = await bcrypt.compare(password, dbPassword);
    if (result) {
      return res.status(200).json({ msg: "Admin logged in" });
    } else {
      return res.status(400).json({ msg: "wrong credentials" });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
});

//STORAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + Date.now());
  },
});

const upload = multer({ storage: storage });

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dlybiw4of",
  api_key: "496169192835494",
  api_secret: "vXLWAfYUrjLV1stNHS0qYzuWFiU",
});

app.post("/upload-image", upload.single("image"), async (req, res) => {
  const email = req.body.email;
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const profileImage = result.secure_url;
    fs.unlinkSync(req.file.path);
    const image = new Images({
      url: profileImage,
      email: email,
    });
    await image.save();
    res.send({ status: "ok" });
  }
  catch (error) {
    res.json({ status: error });
  }
});

app.get("/get-image", async (req, res) => {
  try {
    Images.find({}).then((data) => {
      res.send({ status: "ok", data: data });
    });
  } catch (error) {
    res.json({ status: error });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running ");
});

const errorHandlers = require("./handlers/errorHandlers.js");
const imageModel = require("./models/imageDetails.js");
app.use(errorHandlers.notFound);
app.use(errorHandlers.mongoseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

app.listen(port, () => {
  console.log(`Server Starting on on http://localhost:${port}`);
});
