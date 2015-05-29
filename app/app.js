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
