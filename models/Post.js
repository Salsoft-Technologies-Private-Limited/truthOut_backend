const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const postSchema = mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  originalCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  originalPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
  },
  emotion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Emotion",
  },
  numberOfShares: {
    type: Number,
    default: 0,
  },
  text: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  likedBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: []
  },
  heartBy: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: []
  },
  images: [
    {
      type: String,
    },
  ],
  videos: [
    {
      type: String,
    },
  ],
  comments: [
    {
      body: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
  ],

  hidePostFrom:{
    type: [mongoose.Schema.Types.ObjectId],
    ref: "user",
    default: []
  }
});

postSchema.set("timestamps", true);
postSchema.plugin(mongoosePaginate);
module.exports = Post = mongoose.model("post", postSchema);
