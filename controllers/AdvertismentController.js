const Advertisment = require("../models/Advertisment");
const AdsPackage = require("../models/AdsPackage")
const Advertisment_payments = require("../models/AdvertismentPayment")
const moment = require("moment")

const {DeductPayment,DeleteFile} = require("../helpers/helper")
const {validationResult} = require("express-validator");
const User = require("../models/User");

exports.createAds = async(req,res)=>{
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty())
            return res.status(400).json({errors:errors.array()})

        const {title,preference,package,cardNumber,cvv,cardExpiry,cardHolderName} = req.body
        const ad = await Advertisment.find({title,userid:req.user._id})

        if(ad.length === 0){
            const adsPackage = await AdsPackage.findById(package)

            const charge = await DeductPayment(cardExpiry,cardNumber,cvv,adsPackage.amount, res)

            if(charge){
                const advertismentPaymentlog = Advertisment_payments({
                    Advertisment_package_ID:package,
                    user: req.user._id,
                    charge_id: charge.id,
                    amount:charge.amount/100
                })
                advertismentPaymentlog.save()

                const ad_image =  req.files &&
                    req.files.ad_image &&
                    req.files.ad_image[0] &&
                    req.files.ad_image[0].path;
                const advertisment = Advertisment({
                userid:req.user._id,
                title: title,
                preference: preference,
                package : package,
                expiration : new Date(new Date().getTime()+adsPackage.days* 24 * 60 * 60 * 1000),
                images:ad_image
                })
                await advertisment.save()
                return res.status(200).json({message:"Advertisment Successfully Created"})
            }else{
                return
            }

        }else{
            const ad_image =  req.files &&
            req.files.ad_image &&
            req.files.ad_image[0] &&
            req.files.ad_image[0].path;

            ad_image? DeleteFile([ad_image]):null
            res.status(403).json({message:"Advertisment with this title already exists in you name"})
        }
        
    } catch (error) {
        res.status(500).json({error:error})
    }
}

exports.editAds = async(req,res)=>{
    try {
        const errors = validationResult(req)

        if (!errors.isEmpty())
            return res.status(400).json({errors:errors.array()})

        const advertisment = await Advertisment.findOne({ _id: req.body.id, userid: req.user._id })

        if(!advertisment){
          const ad_image =  req.files &&
            req.files.ad_image &&
            req.files.ad_image[0] &&
            req.files.ad_image[0].path;

          ad_image? DeleteFile([ad_image]):null

          return res.status(400).send({error:"no post found"}) 
        }

        advertisment.title =  req.body.title ?? advertisment.title
        advertisment.preference =  req.body.preference ?? advertisment.preference
        advertisment.Active =  req.body.status ?? advertisment.Active

        const ad_image =  req.files &&
            req.files.ad_image &&
            req.files.ad_image[0] &&
            req.files.ad_image[0].path;

        ad_image? DeleteFile([advertisment.images]):null

        advertisment.images =  ad_image ?? advertisment.images

        await advertisment.save()

        res.status(200).json({message:"Advertisment successfully updated"})
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error})
    }
}

exports.getAllPayments = async (req, res) => {
    try {
      const { page, limit, fieldname, order, keyword, from, to } = req.query;
      const currentpage = page ? parseInt(page, 10) : 1;
      const per_page = limit ? parseInt(limit, 10) : 10;
      const CurrentField = fieldname ? fieldname : "createdAt";
      const currentOrder = order ? parseInt(order, 10) : -1;
      const offset = (currentpage - 1) * per_page;
      const sort = {};
      sort[CurrentField] = currentOrder;
  
      const searchParam = keyword
        ? {
            name: { $regex: `${keyword}`, $options: "i" },
          }
        : {};
  
      let dateFilter = {};
      if (from && to) {
        dateFilter = {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(to).endOf("day").toDate(),
          },
        };
      } else if (from) {
        dateFilter = {
          createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
        };
      } else if (to) {
        dateFilter = {
          createdAt: {
            $lte: moment(to).endOf("day").toDate(),
          },
        };
      }
  
      const query = {
        user: req.user._id,
        ...searchParam,
        ...dateFilter,
      };
  
      const options = {
        page: currentpage,
        limit: per_page,
        lean: true,
        sort,
      };
  
      const payments = await Advertisment_payments.paginate(query, options);
  
      res.status(200).json(payments);
    } catch (err) {
      res.status(500).json({
        message: err.toString(),
      });
    }
  };

exports.getAllMyAds = async(req,res)=>{
    try {
        const { page, limit, fieldname, order, keyword, from, to } = req.query;
        const currentpage = page ? parseInt(page, 10) : 1;
        const per_page = limit ? parseInt(limit, 10) : 10;
        const CurrentField = fieldname ? fieldname : "createdAt";
        const currentOrder = order ? parseInt(order, 10) : -1;
        const offset = (currentpage - 1) * per_page;
        const sort = {};
        sort[CurrentField] = currentOrder;
    
        const searchParam = keyword
          ? {
            title: { $regex: `${keyword}`, $options: "i" },
            }
          : {};
    
        let dateFilter = {};
        if (from && to) {
          dateFilter = {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lte: moment(to).endOf("day").toDate(),
            },
          };
        } else if (from) {
          dateFilter = {
            createdAt: {
              $gte: moment(from).startOf("day").toDate(),
              $lte: moment().endOf("day").toDate(),
            },
          };
        } else if (to) {
          dateFilter = {
            createdAt: {
              $lte: moment(to).endOf("day").toDate(),
            },
          };
        }
    
        const query = {
          userid: req.user._id,
          ...searchParam,
          ...dateFilter,
        };
    
        const options = {
          page: currentpage,
          limit: per_page,
          lean: true,
          sort,
        };
    
        const payments = await Advertisment.paginate(query, options);
        res.status(200).json(payments);
      } catch (err) {
        res.status(500).json({
          message: err.toString(),
        });
      }
}

exports.getAdByID = async(req,res)=>{
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty())
      return res.status(400).json({errors:errors.array()})

      const advertisment = await Advertisment.findOne({ _id: req.params.id, userid: req.user._id });

    if(!advertisment){
      return res.status(400).send({error:"no post found"}) 
    }
    res.status(200).send(advertisment)
  } catch (error) {
    res.status(500).json({
      message: error.toString(),
    });
  }
}

exports.getAdByIDForUser = async(req,res)=>{
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty())
      return res.status(400).json({errors:errors.array()})

      const advertisment = await Advertisment.findOne({ _id: req.params.id, Active:true }).select("preference title images userid");

    if(!advertisment){
      return res.status(400).send({error:"no post found"}) 
    }
    res.status(200).send(advertisment)
  } catch (error) {
    res.status(500).json({
      message: error.toString(),
    });
  }
}
exports.getAdsForNewsfeed = async(req,res)=>{
  try {
    const { page, limit } = req.query;
    const currentpage = page ? parseInt(page, 10) : 1;
    const per_page = limit ? parseInt(limit, 10) : 10;
    const CurrentField = "createdAt";
    const currentOrder = -1;
    const sort = {};
    sort[CurrentField] = currentOrder;

    const adPreference = await User.findById(req.user._id).select("advertismentPreference")
    const query = {
      preference: {$in:adPreference.advertismentPreference},
      Active:true
    };

    const options = {
      page: currentpage,
      limit: per_page,
      lean: true,
      sort,
      select: "title images" 
    };

    const advertisment = await Advertisment.paginate(query, options);
    res.status(200).json(advertisment);
  } catch (error) {
    console.log(error)
    res.status(500).json({error})
  }
}