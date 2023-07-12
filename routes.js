const Users = require("./routes/User");
const Auth = require("./routes/Auth");
const Subscription = require("./routes/Subscription");
const Contact = require("./routes/Contact");
const Emoji = require("./routes/Emoji");
const Payment = require("./routes/Payment");
const Post = require("./routes/Post");
const notification = require('./routes/notification')
const admin = require("./routes/Admin")
const AdsPreference = require("./routes/AdsPreference")
const AdsPackage = require("./routes/AdsPackage")
const VerificationPackage = require("./routes/VerificationPackage")
const Advertisment = require("./routes/Advertisment")
const Verification = require("./routes/Verification")


module.exports = function (app) {
  app.use("/api/users", Users);
  app.use("/api/Auth", Auth);
  app.use("/api/subscription", Subscription);
  app.use("/api/contact", Contact);
  app.use("/api/emoji", Emoji);
  app.use("/api/payment", Payment);
  app.use("/api/post", Post);
  app.use("/api/notification", notification)
  app.use("/api/admin", admin)
  app.use("/api/ads-preference", AdsPreference)
  app.use("/api/ads-package", AdsPackage)
  app.use("/api/Advertisment", Advertisment)
  app.use("/api/verification-package", VerificationPackage)
  app.use("/api/verification", Verification)
};
