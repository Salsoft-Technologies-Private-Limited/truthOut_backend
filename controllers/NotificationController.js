const Notification = require('../models/Notification')

exports.getAllNotification = async(req,res)=>{
    const id = req.user._id
    const notification = await Notification.find({notifiableId:id})
    console.log(notification)
    res.status(200).send({notifications:notification})
}

exports.markNotification = async(req,res)=>{
    try {
        let notification = await Notification.findById(req.body.id)

        notification.marked = !notification.marked
        await notification.save()
        res.status(200).json({msg:"notification marked"})
    } catch (error) {
        res.status(500).json({msg:"server error"})
    }


}