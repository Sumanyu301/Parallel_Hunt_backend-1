const express = require("express");
const app = express();
const bcrypt = require("bcryptjs"); // password hashing ke liye
const mongoose = require("mongoose");
const dotenv = require("dotenv"); //environment var ke liye
const port = process.env.PORT || 5000; //env mein port storage
//mongoose connection


const User = require("./models/user.js"); //importing the db schema for user
const Event = require("./models/event.js"); //event ka schema
const Admin = require("./models/admin.js"); //admin ka schema

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

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }
    const dbPassword = user.password;
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

app.post("/person", async (req, res) => {
  const organisation = req.body.organisation;
  const profession = req.body.profession;
  const experience = req.body.experience;
  const skills = req.body.skills;
  const certification = req.body.certification;
  const tech_stack = req.body.tech_stack;
  const availability = req.body.availability;
  const achievements = req.body.achievements;

  try {
    const users = await User.find({
      $and: [
        {
          "professional.availability": true,
        },
        {
          $or: [
            { "professional.organisation": { $exists: true } },
            { "professional.profession": { $exists: true } },
            { "professional.experience": { $exists: true } },
            { "professional.skills": { $exists: true } },
            { "professional.certification": { $exists: true } },
            { "professional.tech_stack": { $exists: true } },
            { "professional.achievements": { $exists: true } },
          ],
        },
      ],
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(400).send(err);
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

app.get("/", (req, res) => {
  res.send("Server is running");
});


const errorHandlers = require("./handlers/errorHandlers.js");
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
