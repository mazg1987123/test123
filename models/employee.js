const mongoose = require("mongoose");

var employeeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //员工编号
    name: String, //名称
    sex: Number, //性别
    age: Number, //年龄
    dep:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department' //当前员工表的dep字段引用部门表
    }
});

var Employee = new mongoose.model("employee", employeeSchema);

module.exports = Employee;