const admin = require("../middleware/Admin")
const auth = require("../middleware/Auth")
const router = require("express").Router()
const controller = require("../controllers/AdminController")
const { body, query } = require("express-validator");

router.get("/dashboard",[auth,admin],controller.dashboard)
router.get("/report",[auth,admin],[
    query("page").optional().isInt(),
    query("limit").optional().isInt(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("search").optional(),
  ],controller.reports)
router.get("/post/:id",[auth,admin],controller.getPost)
router.delete("/post/:id",[auth,admin],controller.deletePost)
router.get("/user/:id",[auth,admin],controller.getUser)
module.exports = router;