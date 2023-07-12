const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const moment = require("moment");
//middleware
const auth = require("../middleware/Auth");
const admin = require("../middleware/Admin");
const User = require("../models/User");
//models
const Session = require("../models/Session");
const Controller = require("../controllers/AuthController");
router.post(
  "/admin/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "password is required").exists(),
  ],

  Controller.AdminLogin
);
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "password is required").exists(),
  ],

  Controller.login
);

router.post(
  "/changepassword",
  [
    auth,
    [
      check("currentpassword", "current Password is required").not().isEmpty(),
      check("newpassword", "New Password is required").not().isEmpty(),
      check("confirmpassword", "Confirm password is required").not().isEmpty(),
    ],
  ],
  Controller.ChangePassword
);

router.post(
  "/forgot",
  check("email", "Email is required").isEmail(),
  Controller.recoverPassword
);

router.post(
  "/verifycode",
  check("resetCode", "Code is Required"),
  Controller.verifyRecoverCode
);

router.post(
  "/reset",
  [
    check("newpassword", "newpassword is required").not().isEmpty(),
    check("confirmpassword", "confirmpassword is required").not().isEmpty(),
  ],
  Controller.resetPassword
);

router.get("/logout", auth, Controller.Logout);

router.get("/", auth, Controller.LoadUser);

module.exports = router;
