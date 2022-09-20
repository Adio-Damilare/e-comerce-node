const {AdminModel,UserModel,Product}=require("../Usermodel/UserModel");
const bcrypt=require("bcrypt")
const cloudinary =require("cloudinary")
const jwt=require("jsonwebtoken");
require("dotenv").config();
let twilio =require("twilio");
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY, 
    api_secret:process.env.API_SECRET 
});
const sid=process.env.SID;
const AUTH_TOKEN=process.env.AUTH_TOKEN
const SendSmsMessage= async (phonenumber,message,name)=>{
    twilio=twilio(sid,AUTH_TOKEN);
    console.log("i don land",phonenumber,message,name);
   let res = await twilio.messages.create({
        from:process.env.SENDMESSAGENUMBER,
        to:`+234${phonenumber}`,
        body:`
        sender-name: ${name} 
        from:${phonenumber}
        message:${message}`,
    }).then(res=>{
        console.log(res)
        return true
    }
    ).catch((err)=>{
        console.log(err.message)
        return false
    })
    return  res
}

const Signup=  (req,res,next)=>{
    try{
        const body=req.body;
        let {email,fullname,phonenumber}=req.body
        AdminModel.find({email},(err,result)=>{
            if(err){
                console.log("rrr") 
                res.send({message:"request failed",status:false})
            }else{
                if(result.length>0){
                    res.send({message:"Email have been used",status:false})
                }else{
                    AdminModel.find({phonenumber:Number(phonenumber)},(err,result)=>{
                        if(err){
                                res.send({message:"request failed",status:false})
                        }else{
                            if(result.length>0){
                                res.send({message:"Phone number have been used",status:false})
                            }else{
                                bcrypt.hash(req.body.password,10,(err,result)=>{
                                    if(err){
                                        res.send({message:"request failed",status:false})
                                    }else{
                                    phonenumber=Number(phonenumber);
                                        AdminModel.create({
                                            email,phonenumber,password:result,
                                            fullname,verified:true
                                        },(err,result)=>{
                                            if(err){
                                                console.log(err.message)
                                                res.send({message:"Fail due to error", status:false})
                                            }else{
                                                res.send({message:"sucessful", status:true})
                                            }
                                        })
                                   }
                                })
                            }
                        }
                    })
                }

            }
        })
    }
    catch(ex){
        next(ex)
    }
}

const Jsonwebtoken=(email)=>{
   const token= jwt.sign(email,`${process.env.SECRETJWT}`, {expiresIn:"2h"});
 return token
}
const Login=(req,res,next)=>{
    try{
        let {email,password}=req.body;
        AdminModel.find({email},(err,result)=>{
            if(err){
                res.send({message:"Requst failed",status:false})
            }
            else{
                if(result.length>0){
                    let user=result[0];
                    bcrypt.compare(password,user.password,(err,result)=>{
                        if(err){
                            
                            res.send({message:"Wrong password or email",status:false})
                        }else{
                          let token= Jsonwebtoken(req.body)
                            res.send({message:"Successul login", token,status:true})
                        }
                    })
                }else{
                    phonenumber=Number(email);
                    AdminModel.find({phonenumber},(err,result)=>{
                    if(err){
                        res.send({message:"Requst failed",status:false})
                    }else{
                        if(result.length>0){
                            let user=result[0];
                            bcrypt.compare(password,user.password,(err,result)=>{
                                if(err){
                                    res.send({message:"Wrong password or email",status:false})
                                    
                                }else{
                                    let token= Jsonwebtoken(req.body)
                                    res.send({message:"Successul login", token, status:true})
                                }
                            })
                        }else{
                            res.send({message:"Wrong email or password",status:false})
                          

                        }
                    }
                   })
                }
            }
        })
    }catch(ex){
        next(ex)
    }
}


const GetUserList=(req,res,next)=>{
    try{
        UserModel.find({},(err,result)=>{
            if(err){
                res.send({message:"error failed", status:false})
            }
            else{
                res.send({users:result,status:true})
            }
        })
    }catch(ex){
        next(ex)

    }
}

const GetDashboard=(req,res,next)=>{
    try{
    const token =(req.headers?.authorization?.split(" ")[1]);
    jwt.verify(token,`${process.env.SECRETJWT}`, (err,result)=>{
        if(err){
            console.log(err.message);
            res.send({message:"Login failed",status:false})
        }else{
           const {email,password}=result;
           AdminModel.findOne({email},(err,salt)=>{
            if(err){
                res.send({status:false,message:"failed"})
            }else{
               res.send({status:true,user:salt})
            }
           })
        }
    })
    }catch(err){
        next(err)
    }
}
const GetGoods=(req,res,next)=>{
       try{
        Product.find({},(error,result)=>{
            if(error){
                res.send({message:"Error failedw",status:false})
            }
            else{
              res.send({goods:result,status:true})
            }
        })
    }catch(ex){
        next(ex)
    }
}
const GetGoodOne=(req,res,next)=>{
    try{
        const {id}= req.params;
        console.log(id)
        Product.findOne({_id:id},(error,result)=>{
            if(error){
                res.send({message:"Error failed",status:false})
            }
            else{
                console.log(result)
              res.send({good:result,status:true})
            }
        })
    }catch(ex){
        next(ex)
    }
}



const SendMessage= async (req,res,next)=>{
    try{
        const {Toggle,fullname,email,message}=req.body
        if(Toggle){

        }else{
            let result = await SendSmsMessage(email,message,fullname)
          if(result){
            res.send({message:"message sent", status:true})
          }else{
            res.send({message:"failed", status:false})
          }
        }
    }catch(ex){
        next(ex)
    }
}
const Deliver=(req,res,next)=>{
    try{
       const {userId,orderId}=req.body;
       console.log(req.body)
       UserModel.findOne({_id:userId},(err,result)=>{
        if(err){
            res.send({message:"failed", status:false})
        }else{
            const { totalOrders,}=result.orders;
            for(let order of totalOrders){
                if(order.orderid==orderId){
                  order.deliveryStatus=true;
                  for(let good of order.productdetail){
                   Product.findOneAndUpdate({_id:good.id},{$inc:{quantity:-good.quantity}},(err,salt)=>{
                    if(err){
                        res.send({message:"failed", status:false})
                    }    
                
                   })
                  }
                  break
                }
            }
            UserModel.findOneAndUpdate({_id:userId},{$set:{"orders.totalOrders":totalOrders}},(err,result)=>{
                if(err){
                    res.send({message:"failed", status:false})
                }else{
                    res.send({message:"successfuly", status:true
                    ,user:result})
                }
            })

        }
       })

    }catch(ex){
        next(ex)
    }
}
module.exports={Signup,Login,GetDashboard,GetUserList,GetGoods,GetGoodOne,SendMessage,Deliver}