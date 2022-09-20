const AdminController=require("../UserControlller/AdminController");
const express=require("express")
const Router=express.Router();
Router.post("/signup",AdminController.Signup);
Router.post("/login",AdminController.Login);
Router.get("/getdashboard",AdminController.GetDashboard);
Router.get("/getdashboard",AdminController.GetDashboard);
Router.get("/",AdminController.GetUserList);
Router.get("/getproduct",AdminController.GetGoods);
Router.get("/getproduct/:id",AdminController.GetGoodOne);
Router.post("/sendmessage",AdminController.SendMessage);
Router.post("/deliver",AdminController.Deliver);
module.exports=Router
