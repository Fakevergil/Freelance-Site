const Client = require("../models/client");
const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middleware/auth");
const User = require("../models/user");
const validator = require("validator");

router.post("/clients", authMiddleWare, async (req, res) => {
  const { name, company, email, phone } = req.body;
  if (!validator.isEmail(email)) {
    res.status(400).send("Enter a valid email");
  }
  const client = {
    name: name,
    company: company,
    email: email,
    phone: phone,
    user: req.userId,
  };

  const newClient = await Client.create(client);
  res.status(201).json(newClient);
});

router.get("/clients", authMiddleWare, async (req, res) => {
  const allUserClients = await Client.find({ user: req.userId });

  res.status(200).send(allUserClients);
});

router.get("/clients/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;
  const client = await Client.findById(id);
  if (!client) {
    res.status(404).send("Page Not Found");
    return;
  }

  if (client.user.toString() === req.userId) {
    res.status(200).send(client);
  } else {
    res.status(404).send("Page Not Found");
    return;
  }
});

router.put("/clients/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;
  const client = await Client.findById(id);
  const { name, company, email, phone } = req.body;
  if (!validator.isEmail(email)) {
    res.status(400).send("Invalid Email");
    return;
  }

  if (!client) {
    res.status(404).send("Client not found");
    return;
  }

  if (client.user.toString() === req.userId) {
    const updateClient = await Client.findByIdAndUpdate(
      id,
      {
        name,
        company,
        email,
        phone,
      },
      { new: true },
    );
    res.status(200).send(updateClient);
  } else {
    res.status(403).send("Forbidden Request");
  }
});

router.delete("/clients/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;
  const client = await Client.findById(id);

  if (!client) {
    res.status(404).send("Client not found");
    return;
  }

  if (client.user.toString() == req.userId) {
    await Client.findByIdAndDelete(id);
    res.status(200).send("Client Deleted");
  } else {
    res.status(403).send("Forbidden Request");
  }
});

module.exports = router;
