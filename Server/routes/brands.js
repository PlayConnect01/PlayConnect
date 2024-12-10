const {getbrands,deletebrand,updateverified } = require("../controllers/brands")

const express = require("express")

const brandsroute = express.Router()
brandsroute.get("/allbrands" , getbrands)
brandsroute.delete("/delete/:id" , deletebrand)
brandsroute.put("/update/:id" , updateverified)




module.exports = brandsroute