const User = require("../models/User")
module.exports = async(req,res,next)=>{
    const user = await User.findOne({ _id: req.user._id })
    if (user.status ===2){
        res.status(400).send({"message":"User is inactive"})
    }else{
        next()
    }
}