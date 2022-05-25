const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


const filterObj = (obj, ...allowedFields)=>{
  const newObj = {}
  Object.keys(obj).forEach((el)=>{
    if(allowedFields.includes(el)){
     newObj[el] = obj[el]
    }
  })

  return newObj

}

exports.updateMe = catchAsync (async (req, res, next)=>{
 // create error if user try to updata password 
 if(req.body.password || req.body.confirmPassword){
   return next(new AppError('This route is not for password update, please use /updateMypassword', 400))
 }
 
 // filtered unwanted field name that are not allowed to be updated
 const filterBody = filterObj(req.body, "name","email")
 // update user doc 
 const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
   new:true,
   runValidators:true
 })
 res.status(200).json({
   status: 'success',
   data:{
     user:updateUser
   }
 })
})