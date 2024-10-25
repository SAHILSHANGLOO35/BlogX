const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");


const blogRouter = Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function(req, file, cb) {
       const fileName = `${Date.now()}-${file.originalname}`;
       console.log('Generated file name:', fileName);
       cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

blogRouter.get("/add-new", function(req, res) {
    return res.render("addBlog", {
        user: req.user,
    });
});

blogRouter.get("/:id", async function(req, res) {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    return res.render("blog", {
        user: req.user,
        blog,
        comments,
    });
});

blogRouter.post("/comment/:blogId", async function(req, res) {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

blogRouter.post("/", upload.single("coverImage"), async function(req, res) {
    const { title, body } = req.body;
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageUrl: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});

module.exports = blogRouter;