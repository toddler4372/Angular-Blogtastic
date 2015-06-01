'use strict';
 
angular.module('myApp', [
    'ngRoute',
    'myApp.home',       // Home module
    'myApp.register',	// Register route
    'myApp.welcome',	// Welcome page
    'myApp.addPost',	// Blog post page
    'myApp.feedModule'
]).
config(['$routeProvider', function($routeProvider) {
     
    $routeProvider.otherwise({
        redirectTo: '/home'
    });
}]);

'use strict';
 
angular.module('myApp.home', ['ngRoute', 'firebase'])
 
// Declared route 
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/home', {
        templateUrl: 'home/home.html',
        controller: 'HomeCtrl'
    });
}])
 
// Home controller
.controller('HomeCtrl', ['$scope', '$location', 'CommonProp', '$firebaseAuth', function($scope, $location, CommonProp, $firebaseAuth) {
	var firebaseObj = new Firebase("https://blogtastic.firebaseio.com/");
 	var loginObj = $firebaseAuth(firebaseObj);

 	$scope.user = {};
 	$scope.SignIn = function(e) {
	    e.preventDefault();
	    var username = $scope.user.email;
	    var password = $scope.user.password;
	    loginObj.$authWithPassword({
	            email: username,
	            password: password
	        })
	        .then(function(user) {
	            //Success callback
	            console.log('Authentication successful');
	            CommonProp.setUser(user.password.email);
	            $location.path('/welcome');
	        }, function(error) {
	            //Failure callback
	            console.log('Authentication failure');
	        });
		}
}])

// Username service
.service('CommonProp', function() {
    var user = '';
 
    return {
        getUser: function() {
            return user;
        },
        setUser: function(value) {
            user = value;
        }
    };
});
'use strict';
 
angular.module('myApp.register', ['ngRoute', 'firebase'])
 
// Declared route 
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/register', {
        templateUrl: 'register/register.html',
        controller: 'RegisterCtrl'
    });
}])
 
// Register controller
.controller('RegisterCtrl', ['$scope', '$location', '$firebaseAuth', function($scope, $location, $firebaseAuth) {
	var firebaseObj = new Firebase("https://blogtastic.firebaseio.com/");
	var auth = $firebaseAuth(firebaseObj);

 	$scope.signUp = function() {
        if (!$scope.regForm.$invalid) {
            var email = $scope.user.email;
            var password = $scope.user.password;
            if (email && password) {
                auth.$createUser(email, password)
                    .then(function() {
                    	console.log('User creation success');
                        $location.path('/home');
                    }, function(error) {
                    	console.log(error);
                        $scope.regError = true;
						$scope.regErrorMessage = error.message;
                    });
            }
        }
    };
}]);
'use strict';

angular.module('myApp.welcome', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/welcome', {
        templateUrl: 'welcome/welcome.html',
        controller: 'WelcomeCtrl'
    });
}])

.controller('WelcomeCtrl', ['$scope', '$firebase', 'CommonProp', function($scope, $firebase, CommonProp) {
    $scope.username = CommonProp.getUser();
    var firebaseObj = new Firebase("https://blogtastic.firebaseio.com/Articles");


    var sync = $firebase(firebaseObj);

    $scope.articles = sync.$asArray();
    $scope.editPost = function(id) {
        console.log(id);
        var firebaseObj = new Firebase("https://blogtastic.firebaseio.com/Articles/" + id);


        var syn = $firebase(firebaseObj);
        $scope.postToUpdate = syn.$asObject();

        $('#editModal').modal();
    }

    $scope.update = function() {
        console.log($scope.postToUpdate.$id);
        var fb = new Firebase("https://blogtastic.firebaseio.com/Articles/" + $scope.postToUpdate.$id);
        var article = $firebase(fb);
        article.$update({
            title: $scope.postToUpdate.title,
            post: $scope.postToUpdate.post,
            emailId: $scope.postToUpdate.emailId
        }).then(function(ref) {
            console.log(ref.key()); // bar
            $('#editModal').modal('hide')
        }, function(error) {
            console.log("Error:", error);
        });

    }


    $scope.confirmDelete = function(id) {
        var fb = new Firebase("https://blogtastic.firebaseio.com/Articles/" + id);
        var article = $firebase(fb);
        $scope.postToDelete = article.$asObject();
        $('#deleteModal').modal();
    }

    $scope.deletePost = function() {
        var fb = new Firebase("https://blogtastic.firebaseio.com/Articles/" + $scope.postToDelete.$id);
        var article = $firebase(fb);
        article.$remove().then(function(ref) {
            $('#deleteModal').modal('hide');
        }, function(error) {
            console.log("Error:", error);
        });
    }




}]);
'use strict';
 
angular.module('myApp.addPost', ['ngRoute'])
 
.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/addPost', {
        templateUrl: 'addPost/addPost.html',
        controller: 'AddPostCtrl'
    });
}])
 
.controller('AddPostCtrl', ['$scope', '$firebase', 'CommonProp', '$location', function($scope, $firebase, CommonProp, $location) {
 	$scope.AddPost = function() {
 		var firebaseObj = new Firebase("https://blogtastic.firebaseio.com/Articles");
		var fb = $firebase(firebaseObj);
		var title = $scope.article.title;
		var post = $scope.article.post;

		fb.$push({ title: title,
				   post: post,
				   emailId: CommonProp.getUser()
				}).then(function(ref) {
	  				console.log(ref);
	  				$location.path('/welcome'); 
				}, function(error) {
			  		console.log("Error:", error);
				});
 		}
}]);




var feeds = [];
    
angular.module('myApp.feedModule', ['ngResource'])
    .factory('FeedLoader', ["$resource", function ($resource) {
        return $resource('https://ajax.googleapis.com/ajax/services/feed/load', {}, {
            fetch: { method: 'JSONP', params: {v: '1.0', callback: 'JSON_CALLBACK'} }
        });
    }])
    .service('FeedList', ["$rootScope", "FeedLoader", function ($rootScope, FeedLoader) {
        this.get = function() {
            var feedSources = [
                {title: 'Top Movies', url: 'https://feeds.feedburner.com/SmashingMagazine'}
            ];
            if (feeds.length === 0) {
                for (var i=0; i<feedSources.length; i++) {
                    FeedLoader.fetch({q: feedSources[i].url, num: 10}, {}, function (data) {
                        var feed = data.responseData.feed;
                        feeds.push(feed);
                    });
                }
            }
            return feeds;
        };
    }])
    .controller('FeedCtrl', ["$scope", "FeedList", function ($scope, FeedList) {
        $scope.feeds = FeedList.get();
        $scope.$on('FeedList', function (event, data) {
            $scope.feeds = data;
        });
    }]);
'use strict';

angular.module('myApp.version', [
  'myApp.version.interpolate-filter',
  'myApp.version.version-directive'
])

.value('version', '0.1');

'use strict';

angular.module('myApp.version.version-directive', [])

.directive('appVersion', ['version', function(version) {
  return function(scope, elm, attrs) {
    elm.text(version);
  };
}]);

'use strict';

angular.module('myApp.version.interpolate-filter', [])

.filter('interpolate', ['version', function(version) {
  return function(text) {
    return String(text).replace(/\%VERSION\%/mg, version);
  };
}]);
