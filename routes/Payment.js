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
const Controller = require("../controllers/PaymentController");
router.post(
  "/pay",
  [
    auth,
    [
      check("subscription", "subscription is required").not().isEmpty(),
      check("payment_method", "payment_method is required").not().isEmpty(),
      check("card_number", "card_number is required").not().isEmpty(),
      check("card_expiry", "card_expiry is required").not().isEmpty(),
      check("card_cvv", "card_cvv is required").not().isEmpty(),
    ],
  ],
  Controller.SubscriptionPayment
);
router.get("/", [auth], Controller.GET_ALL_PAYMENT_LOGS);
router.get("/me", [auth], Controller.GET_MY_PAYMENTS);
router.get("/:payment_id", [auth], Controller.GET_PAYMENT_DETAIL_BY_ID);
module.exports = router;
