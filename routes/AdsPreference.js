const router = require("express").Router()
const {check} = require("express-validator")

//middleware
const auth = require("../middleware/Auth")
const admin = require('../middleware/Admin')

const AdsPreferenceController = require("../controllers/AdsPreferenceController")

router.post("/create-preference",[auth,admin,[
        check("PreferenceName", "Preference Name is required").isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
        check("active", "Active status is required").isBoolean().withMessage("isActive must be a boolean value").not().isString().withMessage("must not be a String or a NUmber")
    ]], AdsPreferenceController.createPreference)
 
router.get("/list-preference",auth,AdsPreferenceController.listPreferenceForUser)

router.patch("/activate-preference",[auth,admin,[
        check("id").isMongoId().withMessage("Not a valid ID")
    ]], AdsPreferenceController.inActivate_Activate_Preference)

router.get("/list-preference-admin",[auth,admin],AdsPreferenceController.listPreferenceForAdmin)

router.get("/list-my-preference",auth,AdsPreferenceController.listMyPreference)
router.post("/update-preference",auth,AdsPreferenceController.updateMyPrefrences)

module.exports =  router