const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const reportPostSchema = mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  reason: {
    type: String,
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
});

reportPostSchema.set("timestamps", true);
reportPostSchema.plugin(mongoosePaginate);
module.exports = Post = mongoose.model("report_post", reportPostSchema);
