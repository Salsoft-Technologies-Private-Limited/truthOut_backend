const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const contactSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  email: {
    type: String,
  },
  subject: {
    type: String,
    default: null,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});
contactSchema.set("timestamps", true);
contactSchema.plugin(mongoosePaginate);
module.exports = Contact = mongoose.model("Contact", contactSchema);
