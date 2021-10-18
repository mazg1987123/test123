const mongoose = require("mongoose");

var userScheme = new mongoose.Schema({
  email: {
    type: String,
    //表单验证
    validate: {
      validator: function (v) {
        return /^\w+@\w+\.\w+(\.\w+)?$/.test(v);
      },
      message: "邮箱格式不正确",
    },
    required: [true, "邮箱不能为空"],
  },
  nickname: {
    type: String,
    required: [true, "用户名不能为空"],
  },
  password: {
    type: String,
    required: [true, "密码不能为空"],
    //校验密码不能为空
    validate: {
      validator: function (v) {
        return v!=="2926f0a4b70195905b01ed4a1f4c0de2"
      },
      message: "密码不能为空222",
    },
  },
  created_time: { type: Date, default: Date.now },
  avatar: { type: String, default: "/public/img/avatar-default.png" },
  bio: String,
  gender: {
    type: Number,
    enum: [-1, 0, 1],
    //-1表示男   1表示女   0表示未知
    default: -1,
  },
  birthday: Date,
  status: {
    type: Number,
    // 0 没有权限限制
    // 1 不可以评论
    // 2 不可以登录
    enum: [0, 1, 2],
    default: 0,
  },
});

var User = mongoose.model("User", userScheme);

module.exports = User;
