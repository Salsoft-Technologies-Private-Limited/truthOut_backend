const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
//models
const User = require("../models/User");
const Post = require('../models/Post')
const reportUsermodel = require("../models/reportUser")
const Session = require("../models/Session");
const { CreateNotification } = require("../utils/Notification");
const moment = require("moment")
const Payment = require("../models/Payment")
const Subscription = require("../models/Subscription")
const stripe = require("stripe")(process.env.STRIPE_KEY)
const {DeleteFile} = require("../helpers/helper")
//services
//const { sendEmail } = require("../service/mail");
const UserModel = require("../models/User");
const {
  createResetToken,
  validateEmail,
  generateCode,
  validateCode,
  comparePassword,
  verifyPassword,
  generateHash,
  createVerifyToken,
} = require("../queries/index");
const { generateEmail } = require("../service/mail");
const _ = require("lodash")

exports.RegisterAdmin = async (req, res) => {
  const { firstname, lastname, email, password, confirmpassword } = req.body;
  try {
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw errors.array()[0].msg;
    }
    // if user duplicated
    let user = await User.findOne({
      email: email?.toLowerCase(),
      role: "ADMIN",
    });
    if (user) {
      throw "Admin already registered";
    }
    //if password doesnot match
    if (password !== confirmpassword) {
      throw "confirm password doesnot match";
    }
    const salt = await bcrypt.genSalt(10);
    // }
    //create new user
    user = new User({
      firstname: firstname ? firstname : "",
      lastname: lastname ? lastname : "",
      fullName: firstname + " " + lastname,
      email: email,
      role: "ADMIN",
    });
    user.password = bcrypt.hashSync(req.body.password, salt);
    const token = await user.generateAuthToken();
    await user.save();
    await user.save();
    res.status(200).json({
      message: "Admin Registered SuccessFully, please login to proceed",
      token: token,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.Register = async (req, res) => {
  const {
    fullName,
    // lastname,
    email,
    phone_no,
    password,
    date_of_birth,
    subscriptionid,
    confirmpassword,
    cardholdername,
    cardnumber,
    cvv,
    expirydate,
  } = req.body;
  try {
    let user_image =
      req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;

    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw errors.array()[0].msg;
    }
    // if user duplicated
    let user = await User.findOne({ email, role: "USER" });
    if (user) {
      throw "User already registered";
    }
    //if password doesnot match
    if (password !== confirmpassword) {
      throw "confirm password doesnot match";
    }
    const salt = await bcrypt.genSalt(10);
    // }
    //create new user
    user = new User({
      fullName: fullName,
      email: email?.toLowerCase(),
      phone_no:phone_no||"",
      subscriptionid,
      cardholdername,
      cardnumber,
      image: user_image,
      cvv,
      expirydate,
      date_of_birth:date_of_birth||"",
      role: "USER",
    });
    user.password = bcrypt.hashSync(req.body.password, salt);
    const token = await user.generateAuthToken();

    let subscriptionData = await Subscription.findOne({ _id: subscriptionid });
      console.log("subscriptionData", subscriptionData);
      if (!subscriptionData) {
        throw new Error("Subscription doesnot Exist");
      }

      let charge = "";
      let m = expirydate.split("/");
      let cardNumber = cardnumber;
      let stripeToken = await stripe.tokens.create({
        card: {
          number: cardNumber,
          exp_month: m[0],
          exp_year: m[1],
          cvc: cvv,
        },
      });
      if (stripeToken.error) {
        return res.status(400).json({ message: stripeToken.error });
      }
      charge = await stripe.charges.create({
        amount: subscriptionData.subscriptionprice * 100,
        description: "Truth Out  ",
        currency: "usd",
        source: stripeToken.id,
      });
      console.log("Charges", charge);
      
      // subscriptionData.is_paid = true;
      // await subscriptionData.save();
    const futureDate = new Date(); // Create a new date object

    user.subscriptionExpiryDate = subscriptionData.subscriptiontype === "MONTHLY"?futureDate.setMonth(new Date().getMonth() + subscriptionData.subscriptionduration):futureDate.setMonth(new Date().getFullYear() + subscriptionData.subscriptionduration)


    const doc = await user.save();

    let paymentLog = new Payment({
      subscription: subscriptionid,
      charge_id: charge.id ? charge.id : null,
      amount: subscriptionData.subscriptionprice,
      user: doc._id,
      status: charge.id ? "paid" : "unpaid",
    });
    await paymentLog.save();

    // const friends = new FriendsModel({
    //   user: user._id,
    // });
    // await friends.save();
    // await AddUserSOA(user?._id, user?.firstname, user?.image);
    const notification = {
      user: null,
      notificationType: "Admin",
      notificationId: user._id,
      title: "New User Registered",
      body: `${user.fullName} Registerd on Platform`,
      payload: {
        type: "User",
        id: user._id,
      },
    };
    CreateNotification(notification);
    res.status(200).json({
      message: "Registration Success, please login to proceed",
      token: token,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.userVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
      console.log(errors);
      throw errors.array()[0].msg;
    }

    let user = await User.findOne({
      email: email?.toLowerCase(),
    });
    if (user) {
      throw "Email already registered";
    }
    return res.status(201).json({
      message:
        "Email not registered",
    });
  } catch (error) {
    res.status(500).json({
      message: error.toString(),
    });
  }

  // console.log("recoverPassword");
  // const { email } = req.body;
  // console.log("req.body", req.body);

  //   const status = generateCode();
  //   await createVerifyToken(email, status);

  //   const html = `<p>You are receiving this because you (or someone else) have requested to register on our platform as a user.
  //       \n\n Your verification status is ${status}:\n\n
  //       \n\n If you did not request this, please ignore this email and your password will remain unchanged.           
  //       </p>`;
  //   await generateEmail(email, "Jotheode- Verify Email", html);
  //   return res.status(201).json({
  //     message:
  //       "Recovery status Has Been Emailed To Your Registered Email Address",
  //   });

};

exports.EditAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
  }
  const { firstname, lastname, email } = req.body;
  let user_image =
    req.files &&
    req.files.user_image &&
    req.files.user_image[0] &&
    req.files.user_image[0].path;
  const admin = await User.findOne({ _id: req.user._id, role: "ADMIN" });
  if (!admin) {
    throw "no  admin Found";
  }

  req.files.user_image[0].path && DeleteFile([admin.image])

  admin.firstname = firstname ? firstname : admin.firstname;
  admin.lastname = lastname ? lastname : admin.lastname;
  admin.email = email ? email : admin.email;
  admin.image = user_image ? user_image : admin.image;
  const token = admin.generateAuthToken();
  await admin.save();
  await res.status(200).json({
    msg: "Profile Updated Successfully",
    token: token,
    user: admin,
  });
  try {
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .populate("following", "fullName image _id")
      .populate("followers", "fullName image _id")
      .populate("subscriptionid")
      .select("-password")
      .lean();
    if (!user) {
      return res.status(400).json({ msg: "User Doesnt Exists" });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.GetUserById = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
      .select("-password")
      .lean();
    if (!user) {
      return res.status(400).json({ msg: "User Doesnt Exists" });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};
exports.TagUsersList = async (req, res) => {
  const { fullName } = req.query

  try {
    const user = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        { "fullName": { $regex: fullName } },
        { status: { $nin: [2] } }
      ]
    })
      .select("-password")
      .lean();
    if (!user) {
      return res.status(400).json({ msg: "User Doesnt Exists" });
    }
    return res.status(200).json(user);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
};

exports.followUser = async (req, res) => {
  const userId = req.user._id;
  const { followerId } = req.body;
  if (followerId) {
    try {
      const currentUser = await User.findById(userId);
      const followerUser = await User.findById(followerId);

      if (!currentUser || !followerUser) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isAlreadyFollowing = currentUser.following.includes(followerId);

      if (isAlreadyFollowing) {
        await User.findByIdAndUpdate(userId, { $pull: { following: followerId } });
        await User.findByIdAndUpdate(followerId, { $pull: { followers: userId } });
        res.status(200).json({ message: `User ${userId} has unfollowed user ${followerId}.` });
      } else {
        await User.findByIdAndUpdate(userId, { $push: { following: followerId } });
        await User.findByIdAndUpdate(followerId, { $push: { followers: userId } });
        res.status(200).json({ message: `User ${userId} is now following user ${followerId}.` });
      }
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  }
  else {
    return res.status(400).send({ message: "no ID found" })
  }
};


exports.updateProfileDetails = async (req, res) => {
  try {
    const userId = req.body.id;
    const user = await User.findById(userId);
    let {
      // profile_picture = null,
      fullName = null,
      description = null,
      basic_information = {},
    } = req.body;

    // profile_picture = req.files &&
    //   req.files.user_image &&
    //   req.files.user_image[0] &&
    //   req.files.user_image[0].path;

    let {
      education = null,
      address = null,
      relationship_status = null,
      gender = null,
      phone_number = null,
    } = basic_information;

    if (gender?.toLowerCase() === "m" || gender?.toLowerCase() === "male") {
      gender = "M" // male
    } else if (gender?.toLowerCase() === "f" || gender?.toLowerCase() === "female") {
      gender = "F" //female
    } else {
      gender = "O" //  other
    }

    if (relationship_status?.toLowerCase() === "single") {
      relationship_status = "Single"
    } else if (relationship_status?.toLowerCase() === "married") {
      relationship_status = "Married"
    } else {
      relationship_status = "Complicated"
    }
    // description , gender , relationshipstatus , education 
    // Update user data in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        // image: profile_picture === null ? profile_picture : user.image,
        fullName: fullName !== null ? fullName : user.fullName,
        bio: description !== null ? description : user.bio,
        education: education !== null ? education : user.education,
        address: address !== null ? address : user.address,
        relationship_status: relationship_status !== null ? relationship_status : user.relationship_status,
        gender: gender !== null ? gender : user.gender,
        phone_no: phone_number !== null ? phone_number : user.phone_no,
      },
      { new: true }
    );


    // Send back the updated user data in the response
    res.status(200).json({
      msg: "Profile Updated Successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.getProfileDetails = async (req, res) => {
  const user = await User.findById(req.params.id)
  const post = await Post.find({ userid: req.params.id }).sort({ createdAt: -1 })
  if (user.status === 2) {
    res.status(400).send({ message: "user is inactive" })
    return
  }
  var postCopy = JSON.parse(JSON.stringify(post))

  const response = {
    userDetails: {
      image: user.image,
      fullName: user.fullName,
      description: user.bio,
      basic_information: {
        education: user.education,
        address: user.address,
        relationship_status: user.relationship_status,
        gender: user.gender,
        verification_expiration:user.verification_expiration
      },
      allPosts:   postCopy.map((element)=>{
        return {
          ...element,
          userDetails:{
            image:user.image,
            _id:user._id,
            fullName:user.fullName,
          },
          number_of_likes : element.likedBy.length,
          number_of_hearts : element.heartBy.length,
          number_of_comments : element.comments.length,
          number_of_shares : element.numberOfShares,
          description:element.text,
        }
      })
    }
  }

  res.status(200).send(response)
}
exports.suggestFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    user.blockedUserList = !user.blockedUserList ? [req.user._id] : user.blockedUserList.push(req.user._id)
    user.blockedUserList = _.union(user.blockedUserList, user.following)
    // Find users with the same school and degree level
    const matchingUsers = await User.find({
      city: user.city,
      _id: { $nin: user.blockedUserList },
      status: { $nin: [2] },
      role: { $nin: ["ADMIN"] },
    });

    const suggestedFriends = matchingUsers.map((u) => {
      return {
        id: u._id,
        fullName: u.fullName,
        image: u.image,
        followed: u.following.includes(req.user._id)
      }
    })
    res.status(200).json({
      success: true,
      data: suggestedFriends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

exports.getUserDetails = async (req, res) => {
  const user = await User.findById(req.params.id)
  const post = await Post.find({ userid: req.params.id })

  if (user.status === 2) {
    res.status(400).send({ message: "user is inactive" })
    return
  }
  const response = {
    userDetails: {
      profile_picture: user.image,
      fullName: user.fullName,
      description: user.bio,
      basic_information: {
        education: user.education,
        address: user.address,
        relationship_status: user.relationship_status,
        gender: user.gender,
      },
      followed: user.following.includes(req.user._id),
      followed_by: user.followers.includes(req.user._id),
      allPosts: post
    }
  }

  res.status(200).send(response)
}

exports.reportUser = async (req, res) => {
  const { userid, reason } = req.body;
  const reportedBy = req.user._id

  // Check if the user exists
  const user = await User.findById(userid);
  const report_user = await reportUsermodel.findOne({ userid })
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }

  // Check if the user is already reported
  if (report_user) {
    return res.status(400).send({ message: 'User already reported' });
  }

  // Create the report
  const report = await new reportUsermodel({ userid, reason,reportedBy });
  await report.save();

  // Update the user's report status

  await user.save();

  // Send the response
  res.send({ message: 'User reported successfully' });
}

exports.blockuser = async (req, res) => {
  const id = req.body.userid

  let user = await User.findById(id)
  if (user) {
    let user2 = await User.findById(req.user._id)
    user2.blockedUser.includes(id) ? null : user2.blockedUser.push(id)
    await user2.save()
    res.send({ msg: "user blocked" })
  } else {
    res.status(400).send({ msg: "user not found" })
  }
}

exports.adminInfoUpdate = async (req, res) => {
  try {
    userID = req.user._id
    const user = await User.findById(userID);
    user.fullName = req.body.fullName ? req.body.fullName : user.fullName;

    req.files.user_image[0].path && DeleteFile([user.image])

    user.image = (req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path) || user.image;
    await user.save()
    res.status(200).json({ message: "Admin profile Updated successfully" })
  } catch (error) {
    res.status(500).json({ message: error })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit, fieldname, order, keyword, selection, from, to } =
      req.query;
    const currentpage = page ? parseInt(page, 10) : 1;
    const per_page = limit ? parseInt(limit, 10) : 5;
    const CurrentField = fieldname ? fieldname : "createdAt";
    const currentOrder = order ? parseInt(order, 10) : -1;
    const sort = {};
    sort[CurrentField] = currentOrder;
    const searchParam = keyword
      ? {
        $or: [{ fullName: { $regex: `${keyword}`, $options: "i" } }, 
        { email: { $regex: `${keyword}`, $options: "i" } },
      ]
      }
      : {};
    let Datefilter = "";
    if (from && to) {
      Datefilter =
        from && to
          ? {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lte: moment(to).endOf("day").toDate(),
            },
          }
          : {};
      console.log("fromto", Datefilter);
    } else if (from) {
      console.log("from");
      Datefilter = from
        ? {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(new Date()).endOf("day").toDate(),
          },
        }
        : {};
      console.log("from", Datefilter);
    } else if (to) {
      console.log.apply("to");
      Datefilter = to
        ? { createdAt: { $lte: moment(to).endOf("day").toDate() } }
        : {};
    }
    const users = await User.paginate(
      {
        ...searchParam,
        role: { $nin: ["ADMIN"] },
        ...Datefilter,
      },
      {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort: "-_id",
        populate: [{ path: "subscriptionid", select: "subscriptiontype" },]
      }
    );

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({
      message: err.toString(),
    });
  }
}

exports.inactivateUser = async (req, res) => {
  try {
    const id = req.body.id
    const user = await User.findOne({ _id: id })
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    user.status === 2 ? user.status = 0 : user.status = 2;
    user.isActive =!user.isActive;
    await user.save()
    res.status(200).send({ message: `user ${id} inactivated` })

  } catch (error) {
    res.status(500).send({ message: error })
  }
}

exports.updateProfilePicture = async(req,res)=>{
  try {
    userID = req.user._id
    const profile_picture = req.files &&
      req.files.user_image &&
      req.files.user_image[0] &&
      req.files.user_image[0].path;

      const user = await User.findById(userID)
      req.files.user_image[0].path && DeleteFile([user.image])
      
      profile_picture?await User.findByIdAndUpdate(userID,{image:profile_picture}):null;
      res.status(200).send({message:"profile picture updated successfully"})
  } catch (error) {
    res.status(500).send({"message":error})
  }
}
exports.getFollower = async(req,res)=>{
  try {
    const userID = req.params.id
    const user = await User.findById(userID).select("followers").populate("followers", "fullName image _id status email createdAt")
    if(!user){
      return res.status(400).send({message:"no user found"})
    }
    res.status(200).send(user.followers)
  } catch (error) {
    res.status(500).send({message:error})
  }
}
exports.getFollowing = async (req, res) => {
    try {
      const userID = req.params.id;
      const page = parseInt(req.query.page) || 1; // set default page to 1
      const limit = parseInt(req.query.limit) || 5; // set default limit to 5
      const startIndex = (page - 1) * limit;
      const { name, email, fromDate, toDate } = req.query; // get search parameters from query string
  
      // define query object for searching by name or email
      const query = {};
      if (name) {
        query.fullName = { $regex: name, $options: "i" };
      }
      if (email) {
        query.email = { $regex: email, $options: "i" };
      }
  
      // define query object for filtering by date
      const filter = {};
      if (fromDate) {
        filter.createdAt = { $gte: new Date(fromDate) };
      }
      if (toDate) {
        filter.createdAt = { ...filter.createdAt, $lte: new Date(toDate) };
      }
  
      const user = await User.findById(userID)
        .select("following")
        .populate(
          {
            path: "following",
            select: "fullName image _id status email createdAt",
            match: query, // add query object to filter by name or email
            options: {
              skip: startIndex,
              limit: limit,
              sort: { createdAt: -1 }, // sort by creation date in descending order
            },
            populate: {
              path: "following",
              select: "fullName image _id status email createdAt",
              match: filter, // add filter object to filter by date
            },
          }
        );
  
      console.log(user);
      if (!user) {
        return res.status(400).send({ message: "no user found" });
      }
  
      const totalFollowing = user.following.length;
      const totalPages = Math.ceil(totalFollowing / limit);
  
      res.status(200).send({
        page: page,
        limit: limit,
        totalPages: totalPages,
        totalFollowing: totalFollowing,
        following: user.following
      });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  };
exports.getMyAdvertismentPreference = async (req,res)=>{
  try {
    const user = await User.findById(req.user._id).select("advertismentPreference")
    res.status(200).json({user})
  } catch (error) {
    res.status(500).json({error})
  }  

}
exports.setMyAdvertismentPreference = async (req,res)=>{
  try {
    const {preference} = req.body

    if(preference.length>=1){
      const updatedUser = await User.findByIdAndUpdate(req.user._id,{advertismentPreference:preference})
       return res.status(200).json({message:"prefernce updated successfully"})
    }
      res.status(400).send("make sure the array is not empty")
  } catch (error) {
    res.status(500).json({error})
  }  

}

exports.inactivateMe = async (req, res) => {
  try {
    const id = req.user._id
    const user = await User.findOne({ _id: id })
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    user.status = 2;
    user.isActive =false;
    await user.save()
    res.status(200).send({ message: `user ${id} inactivated` })

  } catch (error) {
    res.status(500).send({ message: error })
  }
}

exports.activateMe = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    user.status = 0;
    user.isActive =true;
    await user.save()
    res.status(200).send({ message: `user ${email} activated` })
  } catch (error) {
    res.status(500).send({ message: error })
  }
}