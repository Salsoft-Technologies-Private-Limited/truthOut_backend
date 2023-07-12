const jwt = require("jsonwebtoken");
const config = require("config");
const Session = require("../models/Session");
const User = require("../models/User")


module.exports = async function (req, res, next) {
  //verify token
  try {
    const header = req.header("Authorization");

    if (!header) {
      return res.status(401).json({ message: "No token authorization denied" });
    }
    const token = header.split(" ")[1];
    // console.log("token",token)

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    const user = await User.findOne({ _id: req.user._id })
    if (user.status ===2 && user.isActive){
        res.status(400).send({"message":"User is inactive"})
    }
    const sessions = await Session.findOne({
      user: req.user._id,
      token: token,
      status: true,
    });
    if (!sessions)
      return res.status(401).json({ message: "authorization denied" });
    next();
  } catch (error) {
    // console.log("error dedua")
    res.status(401).json({ error: error.message });
  }
};
