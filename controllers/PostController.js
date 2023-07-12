const { post } = require("request");
const Post = require("../models/Post");
const savePostModel = require("../models/SavedPost")
const reportPost = require("../models/report")
const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const {DeleteFile} = require("../helpers/helper")
exports.CreatePost = async (req, res) => {
  try {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors);
        throw errors.array()[0].msg;
      }

      let _postPics = [];
      const postPic = [];
      _postPics = req.files.post_pics;
      // if (!Array.isArray(_licensePlate)) throw new Error("License Required");
      _postPics && _postPics.forEach((lic) => postPic.push(lic.path));

      let _videoFiles = [];
      const videoFiles = [];
      _videoFiles = req.files.video_files;
      // if (!Array.isArray(_licensePlate)) throw new Error("License Required");
      _videoFiles && _videoFiles.forEach((lic) => videoFiles.push(lic.path));

      let {
        emotion,
        text,
        tags,
      } = req.body;


      tags = tags && JSON.parse(tags)
      let post = await Post.findOne({
        text: text,
        userid: req.user._id
      });
      // if (post) {
      //   return res.status(400).json({ msg: "Post with this Title Already Exists" });
      // }
      post = new Post({
        userid: req.user._id,
        text,
        images: postPic,
        videos: videoFiles,
        emotion,
        tags: tags

      });
      await post.save();
      const getpost = await Post.findById(post._id).populate('emotion')
      return res.status(200).json({
        message: "New Post Created SuccessFully",
        postDetails: getpost
      });
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.HidePost = async (req, res) => {
  let postid = req.params.id;
  try {
    const post = await Post.findOne({
      _id: postid,
    });

    if (!post)
      return res.status(400).json({ message: "Post not found" });
    post.hidePostFrom.push(req.user._id)
    await post.save()

    return res.status(200).json({
      message: "Post Hidden SuccessFully",
    });
    
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};


exports.reportPost = async (req, res) => {
  const postId = req.params.id;
  const reason = req.body.reason;
  const reportedBy = req.user._id;

  if (!postId || !reason) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    reportPost.findOne({
      postId: postId,
    }, async (err, post_doc) => {
      const post = await Post.findOne({
        _id: postId,
      });
      if (post_doc) {
        console.log("post reported")
        res.status(500).json({
          message: "post already reported",
          postDetails: post
        });
      }
      else {
        let report_post = new reportPost({
          postId,
          reason,
          reportedBy,
        });
        await report_post.save();

        return res.status(200).json({
          message: "Post Reported SuccessFully",
          postDetails: post
        });
      }
    });

  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
}

exports.editPost = async (req, res) => {
  const postId = req.params.id;

  let {
    emotion,
    text,
    tags,
  } = req.body;

  tags = tags && JSON.parse(tags)

  try {
    const post = await Post.findById(postId );

    if(!post){
      return res.status(404).json({ message: 'Post not found' });
    }

    if(post.originalPost){
      return res.status(403).json({ message: 'Forbidden to access the resource' })
    }

    post.text = text ?? post.text
    post.emotion = emotion ?? post.emotion
    post.tags = tags ?? post.tags

    let _postPics = [];
    const postPic = [];
    _postPics = req.files.post_pics;
    // if (!Array.isArray(_licensePlate)) throw new Error("License Required");
    _postPics && _postPics.forEach((lic) => postPic.push(lic.path));

    let _videoFiles = [];
    const videoFiles = [];
    _videoFiles = req.files.video_files;
    // if (!Array.isArray(_licensePlate)) throw new Error("License Required");
    _videoFiles && _videoFiles.forEach((lic) => videoFiles.push(lic.path));

    const images = post.images;
    const videos = post.videos;

    post.images = postPic ??post.images
    post.videos = videoFiles ??post.videos

    if( req.files.post_pics){

      images.map((element)=>{
        const filePath = path.join(__dirname, `../${element}`);

        // Use the fs.unlink() method to delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      })
    }

    if(req.files.video_files){
      videos.map((element)=>{
        const filePath = path.join(__dirname, `../${element}`);

        // Use the fs.unlink() method to delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      })
    }

    await post.save()
    
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.savePost = async (req, res) => {
  try {
    let post = await savePostModel.findOne({
      userid: req.user._id
    })
    if (post) {
      post.posts.includes(req.body.id) ? null : post.posts.push(req.body.id)
    } else {
      post = savePostModel({
        userid: req.user._id,
        post: req.body.id
      })
    }
    await post.save()
    res.status(200).send({ msg: "post saved succesfully" })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }

}

exports.listAllSavedPost = async (req, res) => {
  const posts = await savePostModel.find({ userid: req.user._id }).populate("userid")
    .populate({
      path: 'posts',
      populate: { path: 'userid' }
    })
  res.send({ all_saved_posts: posts })
}

exports.deletePost = async (req, res) => {
  const id = req.params.id
  const user = req.user._id

  try {
    const post = await Post.findOneAndDelete({
      _id: id,
      userid: user
    });

    // Check if the post was found and deleted
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    const images = post.images && DeleteFile(post.images);
    const videos = post.videos && DeleteFile(post.videos);

    res.send({ message: "Post deleted successfully" });
  }
  catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.toString(),
    });
  }
}


exports.viewPost = async (req,res) =>{
  const id = req.params.id

  try {
    const post = await Post.findOne({
      _id: id,
    });

    // Check if the post was found and deleted
    if (!post) {
      return res.status(404).send({ message: "Post not found" });
    }

    post.views = post.views ? post.views + 1 : 1;

    await post.save()

    res.send({ message: "Post updated successfully" });
  }
  catch (error) {
    console.log(error)
    res.status(500).json({
      message: error.toString(),
    });
  }

}

exports.getNewsFeed = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;

    const options = {
      page: page,
      limit: limit,
      populate: [
        { path: 'userid emotion comments.user tags' },
        { path: 'heartBy', select: 'fullName image _id' },
        { path: 'likedBy', select: 'fullName image _id' },
      ],
      sort: { createdAt: -1 },
    };

    const posts = await Post.paginate({
      hidePostFrom: {
        $nin: [req.user._id]
      }
    }, options);    

    let allPosts = posts.docs.map((post) => {
      const comments = post.comments.map((comment) => {
        const userDetails = comment.user;
        const number_of_likes = comment.likes.length;
        return {
          id: comment._id,
          comment: comment.body,
          userDetails,
          number_of_likes,
          likedBy: comment.likes,
        };
      });

      const userDetails = post.userid;
      const number_of_likes = post.likedBy.length;
      const number_of_hearts = post.heartBy.length;
      const number_of_comments = comments.length;
      const created_at = post.createdAt;
      const description = post.text;
      const images = post.images;
      const videos = post.videos;
      const tags = post.tags;
      const emotions = post.emotion;

      return {
        id: post._id,
        userDetails,
        description,
        images,
        number_of_likes,
        number_of_hearts,
        liked_by: post.likedBy || [],
        hearted_by: post.heartBy || [],
        number_of_comments,
        number_of_shares: post.numberOfShares,
        comments,
        created_at,
        videos,
        tags,
        emotions,
      };
    });

    res.json({  allPosts,
                totalDocs: posts.totalDocs,
                limit: posts.limit,
                totalPages: posts.totalPages,
                page: posts.page,
                pagingCounter: posts.pagingCounter,
                hasPrevPage: posts.hasPrevPage,
                hasNextPage: posts.hasNextPage,
                prevPage: posts.prevPage,
                nextPage: posts.nextPage 
              });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.likePost = async (req, res) => {
  try {
    const userId = req.user._id
    const postid = req.body.id

    const post = await Post.findById(postid)

    if (post.heartBy.includes(userId)) {
      post.heartBy.pull(userId)
    }

    // Check if userId already exists in the likedBy array
    if (post.likedBy.includes(userId)) {
      post.likedBy.pull(userId)
      await post.save()
      return res.json({ message: "Post unliked" })
    }

    // If userId doesn't exist, push it into the likedBy array
    post.likedBy.push(userId)
    await post.save()

    res.json({ message: "post liked" })
  } catch (error) {
    res.status(500).send(error);
  }
}

exports.commentOnPost = async (req, res) => {
  try {
    const { id, comment } = req.body
    const post = await Post.findById(id)

    post.comments.push({
      body: comment,
      user: req.user._id
    })
    const doc =  await post.save()
    res.status(200).send({ message: "comment added to post", id:doc._id })
  } catch (error) {
    res.status(500).send(error);
  }
}

exports.sharePost = async (req, res) => {
  try {
    const post =await Post.findById(req.body.id)

    post.numberOfShares+=1
    if (post.originalPost&&post.originalPost !== post._id){
      console.log("not same", post.originalPost)
      let originalPost = await Post.findById(post.originalPost)
      originalPost.numberOfShares+=1
      await originalPost.save()
    }
    post.save()
    const newpost=  new Post({
      text:post.text,
      images: post.images,
      videos: post.videos,
      emotion:post.emotion,
      tags: post.tags,
      userid:req.user._id,
      comments:[],
      heartBy:[],
      likedBy:[],
      originalCreator:post.originalCreator||post.userid,
      originalPost:post.originalPost||post._id
    })
    await newpost.save()
    res.status(200).json({message:"post shared", post:newpost})
  } catch (error) {
    res.status(500).json({error})
  }
}

exports.heartPost = async (req, res) => {
  try {
    const userId = req.user._id
    const postid = req.body.id

    const post = await Post.findById(postid)

    if (post.likedBy.includes(userId)) {
      post.likedBy.pull(userId)
    }
    // Check if userId already exists in the likedBy array
    if (post.heartBy.includes(userId)) {
      post.heartBy.pull(userId)
      await post.save()
      return res.json({ message: "Post removed from heart" })
    }

    // If userId doesn't exist, push it into the likedBy array
    post.heartBy.push(userId)
    await post.save()

    res.json({ message: "post hearted" })
  } catch (error) {
    res.status(500).send(error);
  }
}

exports.likeCommentOnPost = async(req,res)=>{
  const { postId, commentId } = req.body;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user has already liked the comment
    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId)
      await post.save()
      return res.status(200).json({ message: 'Comment unliked' });
    }

    comment.likes.push(userId);
    await post.save();

    res.status(200).json({ message: 'Comment liked' });
  }catch (error) {
    res.status(500).send(error);
  }
}