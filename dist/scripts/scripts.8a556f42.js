"use strict";angular.module("myApp",["ngRoute","myApp.home","myApp.register","myApp.welcome","myApp.addPost","myApp.feedModule"]).config(["$routeProvider",function(a){a.otherwise({redirectTo:"/home"})}]),angular.module("myApp.home",["ngRoute","firebase"]).config(["$routeProvider",function(a){a.when("/home",{templateUrl:"home/home.html",controller:"HomeCtrl"})}]).controller("HomeCtrl",["$scope","$location","CommonProp","$firebaseAuth",function(a,b,c,d){var e=new Firebase("https://blogtastic.firebaseio.com/"),f=d(e);a.user={},a.SignIn=function(d){d.preventDefault();var e=a.user.email,g=a.user.password;f.$authWithPassword({email:e,password:g}).then(function(a){console.log("Authentication successful"),c.setUser(a.password.email),b.path("/welcome")},function(a){console.log("Authentication failure")})}}]).service("CommonProp",function(){var a="";return{getUser:function(){return a},setUser:function(b){a=b}}}),angular.module("myApp.register",["ngRoute","firebase"]).config(["$routeProvider",function(a){a.when("/register",{templateUrl:"register/register.html",controller:"RegisterCtrl"})}]).controller("RegisterCtrl",["$scope","$location","$firebaseAuth",function(a,b,c){var d=new Firebase("https://blogtastic.firebaseio.com/"),e=c(d);a.signUp=function(){if(!a.regForm.$invalid){var c=a.user.email,d=a.user.password;c&&d&&e.$createUser(c,d).then(function(){console.log("User creation success"),b.path("/home")},function(b){console.log(b),a.regError=!0,a.regErrorMessage=b.message})}}}]),angular.module("myApp.welcome",["ngRoute"]).config(["$routeProvider",function(a){a.when("/welcome",{templateUrl:"welcome/welcome.html",controller:"WelcomeCtrl"})}]).controller("WelcomeCtrl",["$scope","$firebase","CommonProp",function(a,b,c){a.username=c.getUser();var d=new Firebase("https://blogtastic.firebaseio.com/Articles"),e=b(d);a.articles=e.$asArray(),a.editPost=function(c){console.log(c);var d=new Firebase("https://blogtastic.firebaseio.com/Articles/"+c),e=b(d);a.postToUpdate=e.$asObject(),$("#editModal").modal()},a.update=function(){console.log(a.postToUpdate.$id);var c=new Firebase("https://blogtastic.firebaseio.com/Articles/"+a.postToUpdate.$id),d=b(c);d.$update({title:a.postToUpdate.title,post:a.postToUpdate.post,emailId:a.postToUpdate.emailId}).then(function(a){console.log(a.key()),$("#editModal").modal("hide")},function(a){console.log("Error:",a)})},a.confirmDelete=function(c){var d=new Firebase("https://blogtastic.firebaseio.com/Articles/"+c),e=b(d);a.postToDelete=e.$asObject(),$("#deleteModal").modal()},a.deletePost=function(){var c=new Firebase("https://blogtastic.firebaseio.com/Articles/"+a.postToDelete.$id),d=b(c);d.$remove().then(function(a){$("#deleteModal").modal("hide")},function(a){console.log("Error:",a)})}}]),angular.module("myApp.addPost",["ngRoute"]).config(["$routeProvider",function(a){a.when("/addPost",{templateUrl:"addPost/addPost.html",controller:"AddPostCtrl"})}]).controller("AddPostCtrl",["$scope","$firebase","CommonProp","$location",function(a,b,c,d){a.AddPost=function(){var e=new Firebase("https://blogtastic.firebaseio.com/Articles"),f=b(e),g=a.article.title,h=a.article.post;f.$push({title:g,post:h,emailId:c.getUser()}).then(function(a){console.log(a),d.path("/welcome")},function(a){console.log("Error:",a)})}}]);var feeds=[];angular.module("myApp.feedModule",["ngResource"]).factory("FeedLoader",["$resource",function(a){return a("https://ajax.googleapis.com/ajax/services/feed/load",{},{fetch:{method:"JSONP",params:{v:"1.0",callback:"JSON_CALLBACK"}}})}]).service("FeedList",["$rootScope","FeedLoader",function(a,b){this.get=function(){var a=[{title:"Smashing Magazine",url:"https://itunes.apple.com/us/rss/topaudiobooks/limit=10/xml"}];if(0===feeds.length)for(var c=0;c<a.length;c++)b.fetch({q:a[c].url,num:10},{},function(a){var b=a.responseData.feed;feeds.push(b)});return feeds}}]).controller("FeedCtrl",["$scope","FeedList",function(a,b){a.feeds=b.get(),a.$on("FeedList",function(b,c){a.feeds=c})}]),angular.module("myApp.version",["myApp.version.interpolate-filter","myApp.version.version-directive"]).value("version","0.1"),angular.module("myApp.version.version-directive",[]).directive("appVersion",["version",function(a){return function(b,c,d){c.text(a)}}]),angular.module("myApp.version.interpolate-filter",[]).filter("interpolate",["version",function(a){return function(b){return String(b).replace(/\%VERSION\%/gm,a)}}]);