const router = require("express").Router()
const AdvertismentController = require("../controllers/AdvertismentController")
const auth = require("../middleware/Auth")
const {check} = require("express-validator")


router.post("/create-ad",[auth,[
    check("title").isString(),
    check("preference").isMongoId(),
    check("package").isMongoId(),
    check("cardNumber").isCreditCard().withMessage("enter valid credit card Number"),
    check("cvv").isLength({ min: 3, max: 4 }).isNumeric(),
    check('cardExpiry').matches(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/).isLength({ min: 5, max: 7 }),
    check('cardHolderName').isLength({ min: 2, max: 50 }).isString(),
]],AdvertismentController.createAds)

router.post("/edit-ad",[auth,[
    check("title").isString().withMessage("title should be a string"),
    check("preference").isMongoId().withMessage("not a valid mongoID"),
    check("status").isBoolean().withMessage("status should be Boolean"),
    check("id").isMongoId().withMessage("not a valid mongoID"),
]],AdvertismentController.editAds)

router.get("/getallpayment",auth,AdvertismentController.getAllPayments)
router.get("/getallads",auth,AdvertismentController.getAllMyAds)
router.get("/get-ad-by-id/:id",[auth,check("id").isMongoId().withMessage("not a valid mongoID")],AdvertismentController.getAdByID)
router.get("/get-ad-by-id-user/:id",[auth,check("id").isMongoId().withMessage("not a valid mongoID")],AdvertismentController.getAdByIDForUser)
router.get("/get-ad-newsfeed",[auth],AdvertismentController.getAdsForNewsfeed)

module.exports = router