const router = require("express").Router()
const { check } = require("express-validator")

//middleware
const auth = require("../middleware/Auth")
const admin = require('../middleware/Admin')

const AdsPackageController = require("../controllers/AdsPackage")

router.post("/create-package", [auth, admin, [
    check("title", "Title is required").isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
    check("amount", "Amount is required").isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("days", "Number of days is required").isInt().withMessage("days must be a Integer value").not().isString().withMessage("must not be a string"),
    check("description").optional().isString().withMessage("must be a String")
]], AdsPackageController.createAdsPackage)

router.get("/view", [auth, admin, [
    check("id").isMongoId().withMessage("Not Valid MongoID")
]], AdsPackageController.ViewPost)

router.get("/list-package", auth, AdsPackageController.listPackageForUser)

router.patch("/edit", [auth, admin, [
    check("id").isMongoId().withMessage("Not a valid ID"),
    check("title").optional().isString().withMessage("must be a String").not().isEmpty().withMessage("must not be empty"),
    check("amount").optional().isInt().withMessage("amount must be a Integer value").not().isString().withMessage("must not be a string"),
    check("days").optional().isInt().withMessage("days must be a Integer value").not().isString().withMessage("must not be a string"),
    check("description").optional().isString().withMessage("must be a String")
]], AdsPackageController.editPackage)

router.patch("/activate-package", [auth, admin, [
    check("id").isMongoId().withMessage("Not a valid ID")
]], AdsPackageController.inActivate_Activate_Package)

router.get("/list-package-admin", [auth, admin], AdsPackageController.listPackageForAdmin)

module.exports = router