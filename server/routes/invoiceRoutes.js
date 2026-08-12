const express = require("express");
const router = express.Router();
const Project = require("../models/project");
const User = require("../models/user");
const Invoice = require("../models/invoice");
const authMiddleWare = require("../middleware/auth");

router.post("/invoice", authMiddleWare, async (req, res) => {
  const { invoiceNumber, project, status, user, lineItems, total } = req.body;
  try {
    const projectFound = await Project.findById(project);

    if (!projectFound) {
      res.status(404).send("Project not found");
      return;
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).send("lineItems is required");
    }

    const invoiceTotal = lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.rate;
    }, 0);

    if (projectFound.user.toString() === req.userId) {
      const nowDate = new Date();
      const invoiceString = `INV-${nowDate.getFullYear()}${nowDate.getMonth() + 1}${nowDate.getDate()}-${nowDate.getHours()}${nowDate.getMinutes()}${nowDate.getSeconds()}`;

      const invoice = {
        invoiceNumber: invoiceString,
        project: project,
        user: req.userId,
        lineItems: lineItems,
        status: status,
        total: invoiceTotal,
      };

      const createInvoice = await Invoice.create(invoice);
      res.status(201).send(createInvoice);
    } else {
      res.status(403).send("Forbidden request");
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
    return;
  }
});

router.get("/invoice", authMiddleWare, async (req, res) => {
  const allInvoices = await Invoice.find({ user: req.userId });
  res.status(200).send(allInvoices);
});

router.get("/invoice/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;

  try {
    const invoiceFound = await Invoice.findById(id);

    if (!invoiceFound) {
      res.status(404).send("Invoice not found");
      return;
    }
    if (invoiceFound.user.toString() === req.userId) {
      res.status(200).send(invoiceFound);
    } else {
      res.status(403).send("Forbidden request");
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

router.put("/invoice/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;

  try {
    const invoiceFound = await Invoice.findById(id);
    const { invoiceNumber, lineItems, project, status } = req.body;

    if (!invoiceFound) {
      res.status(404).send("Invoice not found");
      return;
    }

    if (invoiceFound.user.toString() !== req.userId) {
      res.status(403).send("Forbidden request");
      return;
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).send("lineItems is required");
    }

    const lineItemsTotal = lineItems.reduce((sum, item) => {
      return sum + item.quantity * item.rate;
    }, 0);

    const updateData = {
      invoiceNumber: invoiceNumber,
      lineItems: lineItems,
      status: status,
      total: lineItemsTotal,
    };

    if (project) {
      const projectFound = await Project.findById(project);

      if (!projectFound) {
        res.status(404).send("Project not found");
        return;
      }

      if (projectFound.user.toString() !== req.userId) {
        res.status(403).send("Forbidden request");
        return;
      }

      updateData.project = project;
    }

    const updatedInvoice = await Invoice.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).send(updatedInvoice);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
    return;
  }
});

router.delete("/invoice/:id", authMiddleWare, async (req, res) => {
  const id = req.params.id;

  try {
    const invoiceFound = await Invoice.findById(id);

    if (!invoiceFound) {
      res.status(404).send("Invoice not found");
      return;
    }
    if (invoiceFound.user.toString() === req.userId) {
      await Invoice.findByIdAndDelete(id);
      res.status(200).send("Invoice Deleted");
    } else {
      res.status(403).send("Forbidden request");
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
    return;
  }
});

module.exports = router;
