const mongoose=require("mongoose")
const userSchema= new mongoose.Schema({
    fullname:{
        required:true,
        type:String,
        min:3,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    phonenumber:{
        type:Number,
        require:true
    },
    verified:{
        type:Boolean,
        default:false,
    },
    verifiedNumber:{
        type:Number,
        required:true
    },
    orders:{
        totalOrders:[],
        totalPurchase:0
    },
    order:{
        orderArray:[],
        totalAmount:0
    }
})
const AdminSchema=new mongoose.Schema({
    fullname:{
        required:true,
        type:String,
        min:3,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true
    },
    phonenumber:{
        type:Number,
        require:true
    },
    verified:{
        required:true,
        type:Boolean
    }
    
})
const Good=new mongoose.Schema({
    name:{
        required:true,
        type:String,
        min:3,
    },
    uploadAdmin:{
        type:String,
        required:true,
    },
   image:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        require:true
    },
    Amount:{
        required:true,
        type:Number
    },
    description:{
        required:true,
        type:String,
    },
    Reviews:{
        required:true,
        type:[]
    }
    
})
const UserModel= new mongoose.model("user",userSchema)
const AdminModel= new mongoose.model("admin",AdminSchema)
const Product= new mongoose.model("goods",Good)
module.exports={UserModel,AdminModel,Product}