const express = require("express");
const { adminLogin, adminSignup } = require("../controllers/AdminAuth");

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.post("/signup", adminSignup);

module.exports = adminRouter;
