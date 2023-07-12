const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const reportUserSchema = mongoose.Schema({
    userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  reason: {
    type: String,
    required: true,
  },
  reportedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  }

});

reportUserSchema.set("timestamps", true);
reportUserSchema.plugin(mongoosePaginate);
module.exports = reportUser = mongoose.model("report_user", reportUserSchema);
