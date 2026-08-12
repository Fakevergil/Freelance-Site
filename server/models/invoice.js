const mongoose = require("mongoose");

const invoiceSchema = mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  lineItems: [
    {
      description: { type: String },
      quantity: { type: Number },
      rate: { type: Number },
    },
  ],
  total: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["draft", "sent", "paid", "overdue"],
    default: "draft",
  },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
