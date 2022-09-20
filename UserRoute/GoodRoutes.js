let GoodsController=require("../UserControlller/GoodsController")
const express=require("express");
const Router =express.Router();
Router.get("/",GoodsController.GetGoods);
Router.post("/addproduct",GoodsController.PostGoods);
Router.put("/edit/:id", GoodsController.Edit);
Router.delete("/delete/:id", GoodsController.Delete)
module.exports=Router