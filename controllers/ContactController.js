const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const Contact = require("../models/Contact");
const admin = require("../middleware/Admin");
const auth = require("../middleware/Auth");
const moment = require("moment");
exports.createFeedback = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw errors.array()[0].msg;
    }
    //create new user
    let contact = new Contact({
      fullname: req.body.fullname,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });

    await contact.save();

    res.status(200).json({
      message: "We will get back to you soon, Thank you for reaching out",
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getFeedbackById = async (req, res) => {
  let contact_id = req.params.contact_id;
  console.log("Ayayyayya");
  try {
    let contact = await Contact.findOne({ _id: contact_id })
      .populate("user")
      .lean();
    if (!contact)
      return res.status(400).json({ message: "contact Detail not found" });

    return res.status(200).json(contact);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getAllFeedbacks = async (req, res) => {
  const { page, limit, fieldname, order, from, to, keyword, selection } =
    req.query;
  const currentpage = page ? parseInt(page, 10) : 1;
  const per_page = limit ? parseInt(limit, 10) : 5;
  const CurrentField = fieldname ? fieldname : "createdAt";
  const currentOrder = order ? parseInt(order, 10) : -1;
  let offset = (currentpage - 1) * per_page;
  const sort = {};
  sort[CurrentField] = currentOrder;
  // return res.json(sort)
  let Datefilter = "";
  if (from && to) {
    Datefilter =
      from && to
        ? {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lte: moment(to).endOf("day").toDate(),
            },
          }
        : {};
    console.log("fromto", Datefilter);
  } else if (from) {
    console.log("from");
    Datefilter = from
      ? {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        }
      : {};
    console.log("from", Datefilter);
  } else if (to) {
    console.log.apply("to");
    Datefilter = to
      ? { createdAt: { $lte: moment(to).endOf("day").toDate() } }
      : {};
    console.log("to", Datefilter);
  }

  const search = keyword
    ? {
        $or: [
          { fullname: { $regex: `${keyword}`, $options: "i" } },
          { phone_no: { $regex: `${keyword}`, $options: "i" } },

          { email: { $regex: `${keyword}`, $options: "i" } },
          { subject: { $regex: `${keyword}`, $options: "i" } },
          { message: { $regex: `${keyword}`, $options: "i" } },
        ],
      }
    : {};

  try {
    const contacts = await Contact.paginate(
      {
        ...search,
        ...Datefilter,
      },
      {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort: "-_id",
      }
    );
    res.status(200).json(contacts);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
