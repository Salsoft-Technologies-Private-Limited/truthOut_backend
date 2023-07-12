const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const checkObjectId = require("../middleware/checkobjectid");
const moment = require("moment");
//middleware
const auth = require("../middleware/Auth");
const admin = require("../middleware/Admin");
const User = require("../models/User");
//models
const Session = require("../models/Session");
const Controller = require("../controllers/ContactController");
router.get(
  "/:contact_id",
  [auth, admin, checkObjectId("contact_id")],
  Controller.getFeedbackById
);
router.post(
  "/create",
  [
    check("fullname", "please enter fullname").not().isEmpty(),
    check("email", "please enter email").not().isEmpty(),
    check("subject", "please enter Subject").not().isEmpty(),
    check("message", "please enter messages").not().isEmpty(),
  ],
  Controller.createFeedback
);
router.get("/", [auth, admin], Controller.getAllFeedbacks);

module.exports = router;
