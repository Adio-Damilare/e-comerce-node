const { UserModel, Product } = require("../Usermodel/UserModel")
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer")
require("dotenv").config();
const jwt = require("jsonwebtoken")
// const hbs=require("nodemailer-express-handlebars")
let number = Math.ceil(Math.random() * 100000)
if (number.lenght <= 4) {
    number += "4"
}
if (number.lenght > 5) {
    number = "3000" + Math.ceil(Math.random() * 2)
}
const sendMail = async (email) => {
    console.log(email)
    let mailTranspoter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.NODEMAILER_USERNAME,
            pass: process.env.NODEMAILER_PASSWORD
        }
    })
    let detail = {
        from: "Daruz@gmail.com",
        to: email,
        subject: "confirm your email",
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div style="display:flex; flex-flow:row; justify-content: center; width:100%;background-color:yellow; border-radius:10px; height:500px;padding:40px 0 0 20px ;">
       <div>
        <div >
            <h1>Daruz </h1>
            <p>Thank you for choose Daruz for shopping</p>
            <b>Confirm your email  </b>
            <h4 style="color:blue, font-size:20px"> Your verified token is ${number}</h4>
            </div>
       </div>
    </div>
</body>
</html> `
    }
    mailTranspoter.sendMail(detail).then(res => {
        if (!res?.accepted) {
            return false
        } else {
            return true
        }
    })
}
const Jsonwebtoken = (email) => {
    const token = jwt.sign(email, `${process.env.SECRETJWTUSER}`, { expiresIn: "5h" });
    return token
}

const Signup = async (req, res, next) => {
    try {
        await UserModel.deleteMany({})
        let { email, password, phonenumber, fullname, } = req.body;
        phonenumber = Number(phonenumber)
        const checkEmail = await UserModel.findOne({ email })
        if (checkEmail) {
            return res.json({ message: "Email already used", status: false })
        } else {
            UserModel.find({ phonenumber }, (err, result) => {
                if (err) {
                    return res.json({ message: "Error", status: false })
                } else {
                    if (result.lenght > 0) {
                        return res.json({ message: "Phone number already used", status: false })
                    } else {
                        bcrypt.hash(password, 10, (err, hashedPassword) => {
                            if (err) {
                                return res.json({ message: "Error", status: false })
                            } else {
                                if (sendMail(email)) {
                                    let data = { email, password: hashedPassword, verified: false, fullname, phonenumber, verifiedNumber: number }
                                    let form = new UserModel(data);
                                    form.save((error) => {
                                        if (error) {
                                            res.send({ message: "Registration failed", status: false })
                                        }
                                        else {
                                            return res.json({ status: true, message: "success" });
                                        }
                                    })
                                } else {
                                    return res.json({ message: "Error", status: false })
                                }


                            }

                        })
                    }
                }
            })
        }
    } catch (ex) {

        next(ex);
    }

}
const VerifiedEmail = async (req, res, next) => {
    try {

        const token = req.body.value;
        const email = req.params.email;
        UserModel.findOne({ email }, (err, result) => {
            if (err) {
                res.send({ status: false, message: "Request Fail" })
            } {
                if (result.email) {
                    let verified = result.verifiedNumber;
                    if (verified == token) {
                        UserModel.findOneAndUpdate({ email }, { verified: true, verifiedNumber: "" }, (err, result) => {
                            if (err) {
                                console.log(err)
                            } else {
                                res.send({ status: true, message: "Email verified succefully", user: result });
                            }
                        });
                    }
                    else {
                        res.send({ status: false, message: "Wrong token" });
                    }
                } else {
                    res.send({ status: false, message: "Request Fail" });
                }
            }
        });


    } catch (ex) {
        next(ex);
    }

};

const ResendEmail = async (req, res, next) => {
    try {
        const email = req.params.email;
        UserModel.findOneAndUpdate({ email }, { verifiedNumber: number }, (err, result) => {
            if (err) {
                console.log(err.message)
                res.send({ message: "Fail to resend", status: false })
            } else {
                if (sendMail(email)) {
                    res.send({ message: "Email have been resend", status: true })
                }
            }
        })
    } catch (ex) {
        next(ex);
    }
};

const signIn = (req, res, next) => {
    try {
        const { email, password } = req.body;
        UserModel.find({ email }, (err, result) => {
            if (err) {
                res.send({ message: " Request failed due to error1", status: false })
            }
            else {
                if (result.length > 0) {
                    let currentUserPassword = result[0].password
                    bcrypt.compare(password, currentUserPassword, (err, isMacth) => {
                        if (err) {
                            res.send({ message: " Request fail due to to error", status: false })
                        } else {
                            if (isMacth) {
                                let token = Jsonwebtoken(req.body)
                                res.send({ message: "successful login", token, status: true })
                            } else {
                                res.send({ message: "wrong password", status: false })

                            }
                        }
                    })
                } else {
                    let phonenumber = Number(email)
                    UserModel.find({ phonenumber }, (err, result) => {
                        if (err) {
                            console.log(err.message)
                            res.send({ message: " Request failed due to error ", status: false })
                        } else {
                            if (result.length > 0) {
                                let currentUserPassword = result[0].password
                                bcrypt.compare(password, currentUserPassword, (err, isMacth) => {
                                    if (err) {
                                        res.send({ message: " Request fail due to to error", status: false })
                                    } else {
                                        if (isMacth) {
                                            let token = Jsonwebtoken(req.body)
                                            res.send({ message: "successful login", token, status: true })
                                        } else {
                                            res.send({ message: "wrong password", status: false })
                                        }
                                    }
                                })
                            } else {
                                res.send({ message: "wrong email or phone number", status: false })
                            }
                        }

                    })
                }
            }
        })
    } catch (ex) {
        next(ex)
    }
}
const GetDashboard = (req, res, next) => {
    try {
        const token = (req.headers?.authorization?.split(" ")[1]);
        jwt.verify(token, `${process.env.SECRETJWTUSER}`, (err, result) => {
            if (err) {
                console.log(err.message);
                res.send({ message: "Login failed", status: false })
            } else {
                const { email, password } = result;
                UserModel.findOne({ email }, (err, salt) => {
                    if (err) {
                        res.send({ status: false, message: "failed" })
                    } else {
                        res.send({ status: true, user: salt })
                    }
                })
            }
        })
    } catch (err) {
        next(err)
    }
}
const UpdateUser = async (req, response, next) => {
    try {
        const { email, oldpassword, newpassword, fullname, phonenumber, newEmail } = req.body;
        UserModel.findOne({ email }, (err, res) => {
            if (err) {
                response.send({ message: " Request failed due to error ", status: false })
            } else {
                if (res === null) {
                    response.send({ message: " Request failed due to error null ", status: false })
                } else {
                    let { password } = res;
                    bcrypt.compare(oldpassword, password, (err, isMatch) => {
                        if (err) {
                            response.send({ message: "Request failed due to error ", status: false })
                        } else {
                            if (isMatch) {
                                bcrypt.hash(newpassword, 10, (err, hashPassword) => {
                                    if (err) {
                                        response.send({ message: "Request failed due to error ", status: false })
                                    } else {
                                        UserModel.findOneAndUpdate({ email }, { password: hashPassword, fullname, phonenumber: Number(phonenumber), email: newEmail }, (err, res) => {
                                            if (err) {
                                                response.send({ message: "Request failed due to error ", status: false })
                                            } else {
                                                let token = Jsonwebtoken({ email: newEmail, password: hashPassword })
                                                response.send({ message: "successFuly update ", status: true, token })
                                            }
                                        })
                                    }
                                })
                            } else {
                                response.send({ message: "Old password is not correct ", status: false })
                            }
                        }
                    })
                }
            }
        })
    } catch (err) {
        next(err)
    }
}

const AddtoCart = (req, response, next) => {
    try {
        const id = req.params.id;
        const { cartId, amount } = req.body;
        UserModel.findOne({ _id: id }, (err, result) => {
            if (err) {
                response.send({ message: "Request failed due to error ", status: false })
            } else {
                let { totalAmount, orderArray } = result.order;
                if (orderArray.length > 0) {
                    let found = orderArray.find(e => e.id == cartId)
                    if (found) {
                        for (let i = 0; i < orderArray.length; i++) {
                            if (orderArray[i].id == found.id) {
                                orderArray[i].total += 1;
                                orderArray[i].amount += amount;
                                totalAmount += amount;

                                break
                            }
                        }
                    }
                    else {
                        orderArray.push({ id: cartId, total: 1, amount })
                        totalAmount += amount
                    }
                } else {
                    orderArray = [{ id: cartId, total: 1, amount }];
                    totalAmount = amount
                }
                UserModel.findOneAndUpdate({ _id: id }, { order: { orderArray, totalAmount } }, (err, salt) => {
                    if (err) {
                        response.send({ message: "Request failed due to error ", status: false })
                    } else {
                        console.log("success")
                        response.send({ message: "success ", status: true, order: { orderArray, totalAmount } })
                    }
                })
            }
        })

    } catch (err) {
        next(err)
    }
}


const RemoveCart = (req, response, next) => {
    try {
        const id = req.params.id;
        let user = id.split("+++");
        let userId = user[0];
        let cartId = user[1];
        let amount = Number(user[2])
        console.log(amount)
        UserModel.findOne({ _id: userId }, (err, result) => {
            if (err) {
                response.send({ message: "Request failed due to error ", status: false })
            } else {
                let { totalAmount, orderArray } = result.order;

                if (orderArray.length > 0) {
                    let theMan = orderArray.find(good => good.id == cartId);
                    let found = theMan.total * amount;
                    totalAmount -= found;
                    console.log(totalAmount)
                    orderArray = orderArray.filter(e => e.id !== cartId);
                }
                UserModel.findOneAndUpdate({ _id: userId }, { order: { orderArray, totalAmount } }, (err, salt) => {
                    if (err) {
                        response.send({ message: "Request failed due to error ", status: false })
                    } else {
                        response.send({ message: "success ", status: true, order: { orderArray, totalAmount } })
                    }
                })
            }
        })
    } catch (err) {
        next(err)
    }
}

const MinusCart = (req, response, next) => {
    try {
        const userId = req.params.id;
        const { cartId, amount } = req.body;
        UserModel.findOne({ _id: userId }, (err, result) => {
            if (err) {
                response.send({ message: "Request failed due to error ", status: false })
            } else {
                let { orderArray, totalAmount } = result.order;
                if (orderArray) {
                    for (let i = 0; i < orderArray.length; i++) {
                        if (orderArray[i].id == cartId) {
                            orderArray[i].total -= 1;
                            orderArray[i].amount -= amount;
                            totalAmount -= amount;
                            break
                        }
                    }
                }
                UserModel.findOneAndUpdate({ _id: userId }, { order: { orderArray, totalAmount } }, (err, res) => {
                    if (err) {
                        response.send({ message: "Request failed due to error ", status: false })
                    } else {
                        response.send({ message: "success ", status: true, order: { orderArray, totalAmount } })
                    }
                })
            }
        })
    } catch (err) {
        console.log(err.message)
    }
}

const CheckOut = (req, response, next) => {
    try {
        const id = req.params.id;
        const { orderid, orderAmount, productdetail,deliveryAddress,} = req.body
        let data = { userId:id,orderid, productdetail ,deliveryAddress,status:"paid",deliveryStatus:false}
        UserModel.findOneAndUpdate({ _id: id }, { $push: { "orders.totalOrders": data }, $inc: { "orders.totalPurchase": orderAmount }, $set:{"order.orderArray":[],"order.totalAmount":0} }, (err, result) => {
            if (err) {
                response.send({ message: "Request failed due to error ", status: false })
            } else {
                response.send({ message: "success ", status: true })
          }
        })
    } catch (ex) {
        next(ex)
    }
}
module.exports = { Signup, VerifiedEmail, ResendEmail, signIn, GetDashboard, UpdateUser, AddtoCart, RemoveCart, MinusCart, CheckOut }