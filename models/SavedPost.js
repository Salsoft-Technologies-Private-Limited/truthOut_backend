const mongoose = require("mongoose");
const savePostSchema = mongoose.Schema({
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
      },
    ]
  });
  
  savePostSchema.set("timestamps", true);
  module.exports = savePost = mongoose.model("Save_post", savePostSchema);