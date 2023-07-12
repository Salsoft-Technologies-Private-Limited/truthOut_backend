const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const checkObjectId = require("../middleware/checkobjectid");
const moment = require("moment");

//middleware
const auth = require("../middleware/Auth");
const isActive = require("../middleware/inActiveUser")
const admin = require("../middleware/Admin");

//models
const Session = require("../models/Session");
const Controller = require("../controllers/PostController");

router.post(
  "/create",
  [check("text", "please enter text of Post").not().isEmpty(), auth,isActive],
  Controller.CreatePost
);
router.get("/hidepost/:id", [auth,isActive], Controller.HidePost);
router.get("/viewpost/:id", [auth,isActive], Controller.viewPost);
router.post("/reportpost/:id", [auth,isActive], Controller.reportPost);
router.post("/savepost",[auth,isActive],Controller.savePost)
router.get("/listpost", [auth,isActive], Controller.listAllSavedPost);
router.post("/delete/:id",[auth,isActive], Controller.deletePost)
router.post("/editpost/:id",[auth,isActive],Controller.editPost)
router.get("/newsfeed",[auth,isActive],Controller.getNewsFeed)
router.post("/like/post",[auth,isActive],Controller.likePost)
router.post("/comment",[auth,isActive],Controller.commentOnPost) 
router.post("/heart",[auth,isActive],Controller.heartPost) 
router.post("/sharepost",[auth,isActive],Controller.sharePost) 
router.post("/likecomment",[auth,isActive],Controller.likeCommentOnPost)


module.exports = router;
