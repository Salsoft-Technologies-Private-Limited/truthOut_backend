const subscription = require("../models/Subscription");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { validationResult } = require("express-validator");
const Report_Post = require("../models/report");
const Report_User = require("../models/reportUser");
const Post = require('../models/Post')
const _ =  require("lodash")
const {DeleteFile} = require('../helpers/helper') 

exports.dashboard =async(req,res)=>{
    try {
        let totalEarning = 0;
        let totalEarningsincelastweek = 0;
        let monthlySubscriptionCount =0;
        let yearlySubscriptionCount =0 ;

        totalUser = await User.countDocuments({role:"USER"})
        totalSubscription = await Payment.countDocuments()

        // Find total number of users created since last week
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // get date 7 days ago
        const totalUserLastWeek = await User.countDocuments({
          role: "USER",
          createdAt: { $gte: lastWeek },
        });

        // Find total number of subscriptions created since last week
        const totalSubscriptionLastWeek = await Payment.countDocuments({
          createdAt: { $gte: lastWeek },
        });

        // Find percentage increase in total users and subscriptions since last week
        const percentIncreaseUser = Math.round((totalUserLastWeek / (totalUser-totalUserLastWeek)) * 100);
        const percentIncreaseSubscription = Math.round(
          (totalSubscriptionLastWeek / (totalSubscription-totalSubscriptionLastWeek)) * 100
        );

        let tempArr = (await Payment.find()).map((element)=>{
            totalEarning+=parseInt(element.amount)
        })

        tempArr = (await Payment.find({createdAt: { $gte: lastWeek },})).map((element)=>{
          totalEarningsincelastweek+=parseInt(element.amount)
        })

        tempArr = (await Payment.find().populate("subscription","subscriptiontype")).map((element)=>{
            element.subscription.subscriptiontype === "YEARLY" ? yearlySubscriptionCount++:monthlySubscriptionCount++
        })

        const userData = await User.aggregate([
            {
              $match: { role: { $ne: "ADMIN" } }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
                },
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                year: "$_id.year",
                month: "$_id.month",
                count: 1,
                _id: 0
              }
            },
            {
              $group: {
                _id: "$year",
                counts: { $push: { month: "$month", count: "$count" } }
              }
            },
            {
              $project: {
                year: "$_id",
                counts: 1,
                _id: 0
              }
            },
            { $sort: { year: -1 } }
          ]);

        tempArr={}
        const paymentData = await Payment.find();
        const result = _(paymentData)
                        .groupBy(payment => {
                            const createdAt = new Date(payment.createdAt);
                            return `${createdAt.getFullYear()}-${createdAt.getMonth()+1}`;
                        })
                        .map((payments, month) => {
                            const sum = _.sumBy(payments, 'amount');
                            return { year:month.split("-")[0],month:month.split("-")[1], sum };
                        });
          
        res.status(200).send({totalUser,
            totalSubscription,
            percentIncreaseUser,
            percentIncreaseSubscription,
            percentIncreaseEarning:Math.round((totalEarningsincelastweek/(totalEarning-totalEarningsincelastweek)*100)),
            totalEarning,
            yearlySubscriptionCount,
            monthlySubscriptionCount,
            userData,
            paymentData:result,
        })
    } catch (error) {
        res.status(500).json({
            message:error
        })
    }
}
exports.reports = async(req,res)=>{
   // Check validation errors
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
     return res.status(400).json({ errors: errors.array() });
   }

   // Parse query parameters
   const page = req.query.page || 1;
   const limit = req.query.limit || 4;
   const startDate = req.query.startDate
     ? moment(req.query.startDate).startOf("day").toDate()
     : null;
   const endDate = req.query.endDate
     ? moment(req.query.endDate).endOf("day").toDate()
     : null;
   const search = req.query.search || "";

   try {
     // Query for reports based on search criteria
     const postQuery = {
      // $or: [
      //   { "reportedBy.email": { $regex: `${search}`, $options: "i" } },
      //   { "reportedBy.fullName": { $regex: `${search}`, $options: "i" } },
      // ],
    };
     const userQuery = {
       $or: [
         { "reportedBy.email": { $regex: `${search}`, $options: "i" } },
         { "reportedBy.fullName": { $regex: `${search}`, $options: "i" } },
         { "userid.email": { $regex: `${search}`, $options: "i" } },
         { "userid.fullName": { $regex: `${search}`, $options: "i" } },
       ],
     };
     const query = {
       $or: [postQuery, userQuery],
     };

     // Apply date filtering if necessary
     if (startDate && endDate) {
       query.createdAt = { $gte: startDate, $lte: endDate };
     } else if (startDate) {
       query.createdAt = { $gte: startDate };
     } else if (endDate) {
       query.createdAt = { $lte: endDate };
     }

     // Sort by date in descending order
     const sort = { createdAt: -1 };

     // Perform the query with pagination
     const options = {
       page,
       limit,
       sort,
       populate: [
       { path: "postId", model: "post" }, 
       { path: "postId.userid", model:"user",select:"fullName email"},
       { path: "reportedBy", model: "user",select: "fullName email"  },
       { path: "userid", model: "user",select: "fullName email"   }],
     };

    const { docs: postReports, ...postPagination } = await Report_Post.paginate(query, options);
    const { docs: userReports, ...userPagination } = await Report_User.paginate(query, options);

    // Combine the pagination data from both queries
    const pagination = {
      totalDocs: postPagination.totalDocs + userPagination.totalDocs,
      limit: postPagination.limit+postPagination.limit,
      totalPages: Math.ceil((postPagination.totalDocs + userPagination.totalDocs)/( postPagination.limit+postPagination.limit)),
      page: postPagination.page,
      // pagingCounter: postPagination.pagingCounter || userPagination.pagingCounter,
      nextPage:userPagination.hasNextPage ||postPagination.hasNextPage,
      docsCount: postReports.length + userReports.length
    };

    // Combine the results into a single array
    const reports = [...postReports, ...userReports];

    // Sort the combined results by date in descending order
    reports.sort((a, b) => b.createdAt - a.createdAt);

    // Return the merged and sorted reports and pagination data
    res.json({ reports, pagination });
   } catch (err) {
     console.error(err.message);
     res.status(500).send(err);
   }
 }
exports.getPost = async(req,res)=>{
  const report_post = await Report_Post.findById(req.params.id).populate("reportedBy", "fullName email");
  const post = await Post.findById(report_post.postId).populate("userid")
  console.log(report_post,post)
  res.send({report_post,post})
}

exports.deletePost =  async(req,res)=>{
  try {
    const post = await Post.findByIdAndDelete(req.params.id)
    await Report_Post.findOneAndDelete({postId:req.params.id})
    
    const images = post.images && DeleteFile(post.images);
    const videos = post.videos && DeleteFile(post.videos);

    res.status(200).send("post deleted")
  } catch (error) {
    res.status(500).send(error)
  }
  
}

exports.getUser = async(req,res)=>{
  const report_user = await Report_User.findById(req.params.id).populate("reportedBy", "fullName email").populate("userid", "fullName email");

  console.log(report_user)
  res.send(report_user)
}