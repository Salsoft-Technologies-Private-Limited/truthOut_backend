const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const adsPackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: [true, "title already Exits in the database"]
    },
    amount: {
        type: Number,
        required: true,
    },
    days: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    Active: {
        type: Boolean,
        required: true,
        default: true
    }
})

adsPackageSchema.set("timestamps", true)
adsPackageSchema.plugin(mongoosePaginate)

module.exports = adsPackage = mongoose.model("Ads-Package", adsPackageSchema)
