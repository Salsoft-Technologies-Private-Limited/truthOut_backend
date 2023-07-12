const adsPreference = require("./AdsPreference");
const User = require("./User");

exports.getAllAdvertismentPreference = async()=>{
    const preference = await adsPreference.find({Active:true}).select("_id")
    return preference
}