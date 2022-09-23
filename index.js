const express =require("express")
const App =express()
const bodyParser=require("body-parser")
const mongoose =require("mongoose")
App.use(bodyParser.urlencoded({extended:true,limit:"50mb"}))
App.use(bodyParser.json({limit:"50mb"}));
require("dotenv").config()
const cors=require("cors")
App.use(cors())
const useRouter=require("./UserRoute/UserRoute")
const adminRouter=require("./UserRoute/AdminRoute")
const GoodRouter=require("./UserRoute/GoodRoutes")
const Uri=process.env.MONGO_URL
mongoose.connect(Uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log("DB connection is successful")
}).catch((err)=>{
    console.log(err.message)
})
App.use("/user",useRouter)
App.use("/admin",adminRouter)
App.use("/goods",GoodRouter)
const PORT =process.env.PORT || 300
App.listen(PORT||300,()=>{
    console.log(`App is listen on port  ${PORT} `)
})