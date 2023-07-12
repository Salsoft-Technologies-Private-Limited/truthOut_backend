const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

//middleware
const auth = require("../middleware/Auth");
const admin = require("../middleware/Admin");
const isActive = require('../middleware/inActiveUser')

const mongoose = require("mongoose")
//servcies
const checkObjectId = require("../middleware/checkobjectid");

//Controller
const UserController = require("../controllers/UserController");
router.post(
  "/admin/register",
  [
    check("firstname", "name is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check(
      "password",
      "please enter a password of 6 or more characters"
    ).isLength({ min: 6 }),
    check(
      "confirmpassword",
      "please enter a password of 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  UserController.RegisterAdmin
);

router.post(
  "/register",
  [
    check("email", "Email is required").isEmail(),
    check(
      "password",
      "please enter a password of 6 or more characters"
    ).isLength({ min: 6 }),
    check(
      "confirmpassword",
      "please enter a password of 6 or more characters"
    ).isLength({ min: 6 }),
    check("cardnumber","card Number is required"),
    check("cardholdername","cardholder Name is required"),
    check("cvv","cvv Number is required"),
    check("expirydate","expiry date is required"),
  ],
  UserController.Register
);

router.post(
  "/admin/edit",
  [
    auth,isActive,
    [
      check("firstname", "firstname is required").not().isEmpty(),
      check("lastname", "lastname is required").not().isEmpty(),
    ],
  ],
  UserController.EditAdmin
);
router.post(
  "/verifyuseremail",
  [
  
    [
      check("email", "Email is required").isEmail(),

    ],
  ],
  UserController.userVerifyEmail
);

router.get("/me", [auth], UserController.getCurrentUser);

router.get(
  "/getById/:id",
  [auth, checkObjectId("id"),isActive],
  UserController.GetUserById
);
router.get("/TagUsersList", [auth,isActive], UserController.TagUsersList);
router.post("/updateProfileDetails", [auth,isActive], UserController.updateProfileDetails);
router.get("/profileDetailsbyID/:id",[auth,isActive],UserController.getProfileDetails);
router.get("/friends/suggest",[auth,isActive],UserController.suggestFriendsList);
router.get("/userDetails/:id",[auth,isActive],UserController.getUserDetails);
router.post("/report/user",[auth,isActive],UserController.reportUser);
router.post("/block/user",[auth,isActive],UserController.blockuser);
router.post("/followuser",[auth,isActive],UserController.followUser)
router.put("/adminprofileupdate",[auth,isActive],UserController.adminInfoUpdate)
router.post("/inactivateuser",[auth,admin],UserController.inactivateUser)
router.get("/getusers",[auth],UserController.getAllUsers)
router.post("/updateprofilepicture",[auth,isActive],UserController.updateProfilePicture)
router.get("/getfollowers/:id",[auth,isActive,admin],UserController.getFollower)
router.get("/getfollowing/:id",[auth,isActive,admin],UserController.getFollowing)
router.get("/getMyPreference",[auth,isActive],UserController.getMyAdvertismentPreference)
router.post("/setMyPreference",[auth,isActive,[
  check("preference").isArray({min:1}).custom((val)=>{
    val.every((id) => mongoose.Types.ObjectId.isValid(id))
  }).withMessage('Invalid array of ObjectIDs')
]],UserController.setMyAdvertismentPreference)
router.post("/inActivateMe", [auth],UserController.inactivateMe);
router.post("/ActivateMe",UserController.activateMe);

module.exports = router;
