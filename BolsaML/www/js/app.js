// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])
    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.findQuotes', {
                url: "/findQuotes",
                views: {
                    'menuContent': {
                        templateUrl: "templates/findQuotes.html",
                        controller: "FindQuotesCtrl as findQuotesCtrl"
                    }
                }
            })

            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html"
                    }
                }
            })

            .state('app.wallet', {
                url: "/wallet",
                views: {
                    'menuContent': {
                        templateUrl: "templates/wallet.html",
                        controller: 'WalletCtrl as walletCtrl'
                    }
                }
            })

            .state('app.browse', {
                url: "/browse",
                views: {
                    'menuContent': {
                        templateUrl: "templates/browse.html"
                    }
                }
            })
            .state('app.watchlist', {
                url: "/watchlist",
                views: {
                    'menuContent': {
                        templateUrl: "templates/watchlist.html",
                        controller: 'WatchlistCtrl as watchlistCtrl'
                    }
                }
            })

            .state('app.single', {
                url: "/watchlist/:symbol",
                views: {
                    'menuContent': {
                        templateUrl: "templates/stock.html",
                        controller: 'StockCtrl as stockCtrl'
                    }
                }
            })
            .state('app.addStock',
            {
                url: "/addStock/:symbol",
                views: {
                    'menuContent': {
                        templateUrl: "templates/addStock.html",
                        controller: 'AddStockCtrl as addStockCtrl'
                    }
                }
            });
        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');
    });
