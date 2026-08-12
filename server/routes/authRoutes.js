const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const validator = require("validator");

router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!validator.isEmail(email)) {
    res.status(400).send("Enter a valid email");
    return;
  }
  if (await User.findOne({ email: email })) {
    res.status(409).send("Email Already Exists");
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const hashedUser = {
    email: email,
    password: hashedPassword,
    name: name,
  };

  const user = await User.create(hashedUser);

  hashedUser.password = undefined;
  res.status(201).json(hashedUser);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const storedPass = await User.findOne({ email: email }).select("+password");
  if (!storedPass) {
    res.status(401).send("Invalid Credentials");
    return;
  }

  if (await bcrypt.compare(password, storedPass.password)) {
    const token = jwt.sign({ userId: storedPass._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send(token);
  } else {
    res.status(401).send("Invalid Credentials");
    return;
  }
});

module.exports = router;
