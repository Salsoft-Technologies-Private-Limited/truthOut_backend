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
const Controller = require("../controllers/SubscriptionController");

router.post(
  "/createSubscription",
  [
    auth,
    [
      check("subscriptionname", "subscription name is required")
        .not()
        .isEmpty(),
      check("subscriptiontype", "subscription type is required")
        .not()
        .isEmpty(),
      check("subscriptionprice", "subscription price is required")
        .not()
        .isEmpty(),
      check("subscriptionduration", "subscription duration is required")
        .not()
        .isEmpty(),
    ],
  ],
  Controller.createSubscription
);

router.get(
  "/subscriptionDetails/:id",
  [checkObjectId("id")],
  Controller.getSubscriptionById
);
router.get("/logs", Controller.getAllSubscriptions);

router.get(
  "/toggleStatus/:id",
  [auth, checkObjectId("id")],
  Controller.toggleStatus
);

router.delete(
  "/deleteSubscription/:id",
  [auth, checkObjectId("id")],
  Controller.deleteSubscription
);

router.post(
  "/editSubscription/:id",
  [
    auth,
    [
      check("subscriptionname", "subscription name is required")
        .not()
        .isEmpty(),
      check("subscriptiontype", "subscription type is required")
        .not()
        .isEmpty(),
      check("subscriptionprice", "subscription price is required")
        .not()
        .isEmpty(),
      check("subscriptionduration", "subscription duration is required")
        .not()
        .isEmpty(),
      checkObjectId("id"),
    ],
  ],
  Controller.editSubcription
);

router.post("/updateSubscriptionPlan",[auth, [check("id","subscription id is missing").not().isEmpty(),
check("cardHolderName","cardholder name is missing").not().isEmpty(),
check("cardNumber"," cardNumber is missing").not().isEmpty(),
check("cvv","CVV is missing").not().isEmpty(),
check("expiry_date","expiry_date is missing").not().isEmpty()
]], Controller.updateSubscriptionPlan)
module.exports = router;
