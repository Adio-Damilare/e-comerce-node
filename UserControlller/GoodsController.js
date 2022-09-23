const { Product } = require("../Usermodel/UserModel")
let cloudinary = require("cloudinary")
require("dotenv").config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const GetGoods = (req, res, next) => {
    try {
        Product.find({}, (err, result) => {
            if (err) { res.send({ message: "error", status: false }); }
            else {
                res.send({ goods: result, status: true })
            }
        })
    } catch (ex) {
        next(ex)
    }
}
const PostGoods = async (req, res, next) => {
    try {
        const { image, ProductAmount: Amount, ProductDescription: description, ProductQuantity: quantity, ProductName: name, uploadAdmin } = req.body;
        cloudinary.v2.uploader.upload(image, { folder: "E-commerceProject" },
            function (error, result) {
                if (error) {
                    res.send({ message: "Error failed", status: false })
                }
                else {
                    let Form = new Product({ name, description, quantity, image: result.secure_url, Amount, uploadAdmin })
                    Form.save(err => {
                        if (err) {
                            console.log(err.message)
                        } else {
                            res.send({ message: "Goods successfuly upload", status: true })
                        }
                    })

                }
            });
    } catch (err) {
        next(err)
    }
}
const Edit = async (req, response, next) => {
    try {
        const id = req.params.id;
        let { image } = (req.body);
            if (image.length > 130) {
                 await cloudinary.v2.uploader.upload(image, { folder: "E-commerceProject" },
                    function (error, result) {
                        if (error) {
                            response.send({ message: "Error failed", status: false })
                        }
                       else{
                        Product.findOneAndUpdate({ _id: id, }, { ...req.body, image }, (error, result) => {
                            if (error) {
                                response.send({ message: "Error failed", status: false })
                            } else {
                                console.log("success")
                                response.send({ message: "Error failed", status: true })
                            }
                        })
                       }
                       
                    })
            }else{
                Product.findOneAndUpdate({ _id: id, }, { ...req.body, image }, (error, result) => {
                    if (error) {
                        response.send({ message: "Error failed", status: false })
                    } else {
                        console.log("success")
                        response.send({ message: "Error failed", status: true })
                    }
                })
            }
    } catch (err) {
        next(err)
    }
}

const Delete = (req, response, next) => {
    try {
        const id = req.params.id;
        Product.deleteOne({ _id: id }, (err, result) => {
            if (err) {
                response.send({ message: "Error failed", status: false })
            } else {
                response.send({ message: "successfuly delete", status: true })
            }
        })
    } catch (err) {
        next(err)
    }
}
module.exports = { GetGoods, PostGoods, Edit, Delete }