const mongoose = require("mongoose");

var departmentSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId, //部门编号
    name: String //名称
});

var Department = new mongoose.model("department", departmentSchema);

module.exports = Department;