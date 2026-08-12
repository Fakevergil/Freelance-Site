const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "completed", "rejected"],
    default: "active",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
