const express = require("express");
const User = require("../models/user");
const Client = require("../models/client");
const Project = require("../models/project");
const authMiddleWare = require("../middleware/auth");

const router = express.Router();

router.post("/project", authMiddleWare, async (req, res) => {
  const { title, description, rate, status, client } = req.body;
  const foundClient = await Client.findById(client);

  if (!foundClient) {
    res.status(404).send("Client Not Found");
    return;
  }

  if (foundClient.user.toString() === req.userId) {
    const project = {
      title: title,
      description: description,
      rate: rate,
      status: status,
      user: req.userId,
      client: client,
    };
    const newProject = await Project.create(project);
    res.status(201).send(newProject);
  } else {
    res.status(403).send("Forbidden Request");
    return;
  }
});

router.get("/project", authMiddleWare, async (req, res) => {
  const allProjects = await Project.find({ user: req.userId });

  if (allProjects.length === 0) {
    res.send("No projects found");
    return;
  } else {
    res.status(200).send(allProjects);
  }
});

router.get("/project/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }

  if (project.user.toString() === req.userId) {
    res.status(200).send(project);
  } else {
    res.status(403).send("Forbidden Request");
    return;
  }
});

router.put("/project/:id", authMiddleWare, async (req, res) => {
  const { title, description, rate, status } = req.body;
  const id = req.params.id;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }

  if (project.user.toString() === req.userId) {
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title: title,
        description: description,
        rate: rate,
        status: status,
      },
      { new: true },
    );

    res.status(200).send(updatedProject);
  } else {
    res.status(403).send("Forbidden Request");
    return;
  }
});

router.delete("/project/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;
  const project = await Project.findById(id);

  if (!project) {
    res.status(404).send("Project not found");
    return;
  }

  if (project.user.toString() === req.userId) {
    await Project.findByIdAndDelete(id);
    res.status(200).send("Project Deleted");
  } else {
    res.status(403).send("Forbidden Request");
    return;
  }
});
module.exports = router;
