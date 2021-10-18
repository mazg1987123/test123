const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Article = require("../models/article");
const Department = require("../models/department");
const Employee = require("../models/employee");
const { formatArrayToObj } = require("../utils");
const multer = require("multer");
const path = require("path");

//设定上传文件保存的路径和名字的信息
var storage = multer.diskStorage({
  //设定上文文件保存在哪里（若不存在则需要创建）
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/img"));
  },
  //设定保存的文件名 时间戳 + 文件原始名，比如 151342376785-123.jpg
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
var upload = multer({ storage: storage });

/*
在写路由接口的时候，一般遵循的原则是restful风格的url
    GET  /   --> 返回首页
    GET  /register --> 返回注册页面
    POST /register --> 处理注册请求
    GET  /login    --> 返回登录页面
    POST /login    --> 处理登录请求
*/

//来到首页
router.get("/", async (req, res) => {
  var user = req.session.user;
  let articles = await Article.find();
  res.render("index.html", { user, articles });
});

//来到注册页面
router.get("/register", (req, res) => {
  res.render("register.html");
});

//处理注册请求
router.post("/register", async (req, res) => {
  var body = formatArrayToObj(req.body);
  //最终任务：把用户的信息入库
  try {
    //1.要判断用户输入的邮箱和昵称在数据库是否存在
    var result = await User.find({
      $or: [{ email: body.email }, { nickname: body.nickname }],
    });
    //2.如果用户输入的邮箱和昵称不存在，才可以注册
    if (result.length === 0) {
      var user = new User(body);
      var result = await user.save();
      //注册成功给客户端返回成功信息
      res.json({
        code: 20000,
        msg: "注册成功",
        err: null,
      });
    }
    //3.如果用户输入的邮箱和昵称已经存在，注册不成功，重新来到注册页面，并且提示信息
    else {
      res.json({
        code: 19999,
        msg: "注册不成功",
        err: "邮箱或者昵称已经存在",
      });
    }
  } catch (err) {
    res.json({
      code: 19999,
      msg: "注册不成功",
      err: err.message,
    });
  }
});

//来到登录页面
router.get("/login", (req, res) => {
  res.render("login.html");
});

//处理登录请求
router.post("/login", async (req, res) => {
  var body = formatArrayToObj(req.body);
  try {
    //实现登录的步骤
    //1.根据邮箱和密码从数据库查询数据
    var result = await User.find({
      email: body.email,
      password: body.password,
    });

    //2.如果查询到了数据，说明用户输入的账号密码正确，此时可以登录
    if (result.length != 0) {
      req.session.user = result[0];
      res.json({
        code: 20000,
        msg: "登录成功",
      });
    }
    //3.如果查询不到数据，说明用户输入的账号密码错误，此时不可以登录
    else {
      res.json({
        code: 19999,
        msg: "登录失败",
        err: "账号或者密码错误",
      });
    }
  } catch (err) {
    res.json({
      code: 19999,
      msg: "登录失败",
      err: err.message,
    });
  }
});

//退出登录
router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.destroy();
  res.redirect("/login");
});

//来到密码修改页面
router.get("/settings/admin", (req, res) => {
  var user = req.session.user;
  res.render("settings/admin.html", { user });
});

//来到基本信息页面
router.get("/settings/profile", (req, res) => {
  var user = req.session.user;
  res.render("settings/profile.html", { user });
});

//处理修改密码请求
router.post("/settings/admin", async (req, res) => {
  const body = formatArrayToObj(req.body);
  //看用户输入的两次密码是否一致
  if (body.newpassword === body.renewpassword) {
    //用户输入的原密码正确
    if (body.oldpassword === req.session.user.password) {
      let result = await User.findByIdAndUpdate(
        req.session.user._id,
        { $set: { password: body.newpassword } },
        { new: true }
      );
      //更新session
      req.session.user = result;
      res.json({
        code: 20000,
        msg: "修改密码成功",
      });
    }
    //用户输入的原密码不正确
    else {
      res.json({
        code: 19999,
        msg: "修改密码失败",
        err: "原密码不正确",
      });
    }
  }
  //用户输入的两次密码不一致
  else {
    res.json({
      code: 19999,
      msg: "修改密码失败",
      err: "新密码和确认密码不一致",
    });
  }
});

//处理修改用户数据的请求
//upload.single('avatar') 单文件上传
router.post("/settings/profile", upload.single("avatar"), async (req, res) => {
  req.body.avatar = path.join("/public/img/", req.file.filename);
  //更新数据库
  let result = await User.findByIdAndUpdate(
    req.body._id,
    { $set: req.body },
    { new: true }
  );
  //更新内存中session
  req.session.user = result;
  res.redirect("/settings/profile");
});

//来到文章发起页面
router.get("/topic/new", (req, res) => {
  var user = req.session.user;
  res.render("topic/new.html", { user });
});

//处理新增文件请求
router.post("/topic/new", async (req, res) => {
  var user = req.session.user;
  var article = new Article(req.body);
  article.user_id = user._id;
  article.icon = user.avatar;
  var result = await article.save();
  res.redirect("/");
});

//来到新闻详情
router.get("/topic/:id", async (req, res) => {
  var id = req.params["id"];
  var result = await Article.findById(id);
  var user = req.session.user;
  res.render("topic/show.html", { article: result, user });
});

//测试mongoose的静态方法
router.get("/test", (req, res) => {
  Article.findByTitle("美媒：美国前总统比尔·克林顿住院", function (data) {
    console.log(data);
  });
});

//测试关联查询
router.get("/populate", (req, res) => {
  Employee.find()
    .populate({ path: "dep", select: { name: 1 } })
    .exec(function (err, obj) {
      console.log(err,obj);
    });
});

module.exports = router;
