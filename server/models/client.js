const mongoose = require("mongoose");

const clientSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
