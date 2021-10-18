const mongoose = require("mongoose");

var articleScheme = new mongoose.Schema({
  forum: {
    type: String,
    required: [true, "发布板块不能为空"],
  },
  title: {
    type: String,
    required: [true, "标题不能为空"],
  },
  content: {
    type: String,
    required: [true, "内容不能为空"],
  },
  user_id: {
    type: String,
  },
  icon: {
    type: String,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
});

//静态方法  直接通过类名可以调用的方法
articleScheme.statics.findByTitle = function(title,callback){
    //this就是model类
	this.find({"title" : title})
	.then(function(data){
		callback(data[0]);
	})
}

//实例方法  通过model对象调用的方法
articleScheme.methods.sayHello = function(){
	console.log("当当当当！我是" + this.name);
}

var Article = mongoose.model("Article", articleScheme);

module.exports = Article;
