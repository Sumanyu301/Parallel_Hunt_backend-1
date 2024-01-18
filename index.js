const express = require("express");
const app = express();
const bcrypt = require("bcryptjs"); // password hashing ke liye
const mongoose = require("mongoose");
const dotenv = require("dotenv"); //environment var ke liye
const port = process.env.PORT || 5000; //env mein port storage
//mongoose connection

const User = require("./models/user.js"); //importing the db schema for user

const z = require("zod"); //zod input validation.
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //form se data jab aata hai

const userZodSchema = z.object({
  personal: z.object({
    name: z.string(),
    age: z.number(),
    pincode: z.number(),
    DOB: z.string(),
    Email: z.string().email(),
    password: z.string(),
    username: z.string(),
  }),
  professional: z.object({
    organisation: z.string().optional(),
    profession: z.string().optional(),
    experience: z.number().optional(),
    skills: z.string().optional(),
    certification: z.string().optional(),
    tech_stack: z.string().optional(),
    availability: z.boolean().optional(),
    resume: z.string().optional(),
    achievements: z.string().optional(),
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

  // Check if user with the provided email already exists
  const existingUser = await User.findOne({
    "personal.Email": data.personal.Email,
  });
  if (existingUser) {
    return res.status(400).json({ error: "Email is already in use" });
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
    res.status(200).json({ msg: "user created successfully" });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/signin", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    const dbPassword = user.personal.password;
    const result = await bcrypt.compare(password, dbPassword);
    if (result) {
      return res.status(200).json({ msg: "user logged in" });
    } else {
      return res.status(400).json({ msg: "wrong credentials" });
    }
  } catch (err) {
    return res.status(400).send(err);
  }
});

app.get('/',(req,res)=>{
    res.send("Server is running");
})

app.listen(port, () => {
  console.log(`Server Starting on on http://localhost:${port}`);
});
