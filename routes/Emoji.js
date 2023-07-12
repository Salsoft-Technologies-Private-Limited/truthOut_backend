const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const checkObjectId = require("../middleware/checkobjectid");
const moment = require("moment");

//middleware
const auth = require("../middleware/Auth");
const admin = require("../middleware/Admin");

//models
const Session = require("../models/Session");
const Controller = require("../controllers/EmojiController");

router.get("/logs", [auth], Controller.getAllEmotions);
router.get("/getAllEmojis", [auth], Controller.get_all_emotions);
router.post(
  "/create",
  [check("name", "please enter name of emoji").not().isEmpty(), auth, admin],
  Controller.CreateEmotion
);

module.exports = router;
