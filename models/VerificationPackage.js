const mongoose = require("mongoose")
const mongoosePaginate = require("mongoose-paginate-v2")

const verifcationPackageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    amount_1: {
        type: Number,
        required: true,
    },
    amount_2: {
        type: Number,
        required: true,
    },
    followers: {
        type: Number,
        default: 10000,
    },
    Active: {
        type: Boolean,
        required: true,
        default: true
    }
})

verifcationPackageSchema.set("timestamps", true)
verifcationPackageSchema.plugin(mongoosePaginate)

module.exports = verifcationPackage = mongoose.model("Verification-Package", verifcationPackageSchema)
