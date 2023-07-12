const express = require("express");
const router = express.Router();
const auth = require("../middleware/Auth");
const notificationController = require('../controllers/NotificationController')

router.get("/listall",[auth],notificationController.getAllNotification)
router.post("/markNotification",[auth],notificationController.markNotification)



module.exports = router;