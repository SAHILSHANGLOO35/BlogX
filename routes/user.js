const { Router } = require("express");
const User = require("../models/user");
const { createHmac } = require('crypto');
const { error } = require("console");
const { createTokenForUser } = require("../services/auth");

const userRouter = Router();

userRouter.get("/signin", function(req, res) {
    res.render("signin");
});

userRouter.get("/signup", function(req, res) {
    res.render("signup");
});

userRouter.post("/signup", async function(req, res) {
    const { fullName, email, password } = req.body;
    await User.create({
        fullName,
        email,
        password,
    });
    return res.redirect("/");
});

userRouter.post("/signin", async function(req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render("signin", { error: "User not found!" });
        }

        const salt = user.salt;
        const hashedPassword = user.password;

        const userProvidedHash = createHmac("sha256", salt)
            .update(password)
            .digest("hex");

        if(hashedPassword !== userProvidedHash) return res.render("signin", { error: "Incorrect Email or Password!" })

        const token = createTokenForUser(user);
        return res.cookie("token", token).redirect("/");

    } catch (error) {
        return res.render("signin", { error: "An error occurred. Please try again." });
    }
});

userRouter.get("/logout", function(req, res) {
    res.clearCookie("token").redirect("/");
})

module.exports = userRouter;