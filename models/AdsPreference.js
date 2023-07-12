const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const adsPreferenceSchema = new mongoose.Schema({
    PreferenceName:{
        type:String,
        required:true,
        unique: [true,"Name already Exits in the database"]
    },
    Active:{
        type: Boolean,
        required:true,
        default: true
    }
})

adsPreferenceSchema.set("timestamps",true)
adsPreferenceSchema.plugin(mongoosePaginate)

module.exports = adsPreference = mongoose.model("Ads-Preference", adsPreferenceSchema)
