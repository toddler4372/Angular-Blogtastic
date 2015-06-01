var feeds = [];
    
angular.module('myApp.feedModule', ['ngResource'])
    .factory('FeedLoader', function ($resource) {
        return $resource('https://ajax.googleapis.com/ajax/services/feed/load', {}, {
            fetch: { method: 'JSONP', params: {v: '1.0', callback: 'JSON_CALLBACK'} }
        });
    })
    .service('FeedList', function ($rootScope, FeedLoader) {
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
    })
    .controller('FeedCtrl', function ($scope, FeedList) {
        $scope.feeds = FeedList.get();
        $scope.$on('FeedList', function (event, data) {
            $scope.feeds = data;
        });
    });