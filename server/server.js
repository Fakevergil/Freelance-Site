require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/authRoutes");
const authMiddleWare = require("./middleware/auth");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/api/test", authMiddleWare, (req, res) => {
  res.send({ msg: "Working" });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Connected to Port: ${PORT}`);
    });

    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
