angular.module('starter.controllers', [])
    .service('userService', function () {

        this.userData = {};
        this.storeData = function (data) {
            this.userData = data;
            console.log("User data=" + JSON.stringify(this.userData));
        }
        this.getData = function () {
            console.log("User data get=" + JSON.stringify(this.userData));
            return this.userData;
        }
        this.destroyData = function () {
            this.userData = {};
        }
    })
    .controller('AppCtrl', function ($scope, $ionicModal, $timeout, $http, $state, userService) {
        // Form data for the login modal
        $scope.loginData = {};
        $scope.user = {};

        // Create the login modal
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.loginModal = modal;
        });

        // Create the logout modal
        $ionicModal.fromTemplateUrl('templates/logout.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.logoutModal = modal;
        });

        // Open the logout modal
        $scope.logout = function () {
            $scope.logoutModal.show();
            userService.destroyData();
            $scope.user = {};
            $state.go('app.home');
            $scope.logoutModal.hide();
        };

        // Triggered in the logout modal to close it
        $scope.closeLogout = function () {
            $scope.logoutModal.hide();
        };

        // Triggered in the login modal to close it
        $scope.closeLogin = function () {
            $scope.loginModal.hide();
        };

        // Open the login modal
        $scope.login = function () {
            $scope.loginModal.show();
        };

        // Perform the login action when the user submits the login form
        $scope.doLogin = function () {
            console.log('Doing login', $scope.loginData);
            $http.post('http://localhost:5000/login/', $scope.loginData).success(function (data, status, headers, config) {
                console.log(userService);
                userService.storeData($scope.loginData);
                $scope.user.username = $scope.loginData.username;
                $scope.user.password = $scope.loginData.password;
                console.log('Success');
                console.log($scope.user);
                $state.go('app.findQuotes');
            });
            $timeout(function () {
                $scope.closeLogin();
            }, 1000);
        };
    })
    .controller('AddStockCtrl', function($http,userService,$stateParams,$state)
    {
        var addStockCtrl=this;
        addStockCtrl.stockFormData={};
        var symbol=$stateParams.symbol;
        console.log('Teste' + symbol);
        addStockCtrl.addStock = function () {
            addStockCtrl.stockFormData.username = userService.getData().username;
            addStockCtrl.stockFormData.stock = symbol;
            $http.post('http://localhost:5000/stockAdd/', addStockCtrl.stockFormData).success(function (data, status, headers, config) {
                console.log('Success');
                $state.go('app.watchlist');
            })
                .error(function (err) {
                    console.log(err);
                });
        }
    })
    .controller('FindQuotesCtrl', function ($http,userService,$state) {
        var findQuotesCtrl = this;

        findQuotesCtrl.isIOS = ionic.Platform.isIOS();
        findQuotesCtrl.isAndroid = ionic.Platform.isAndroid();
        findQuotesCtrl.loading = false;
        findQuotesCtrl.quoteFound = false;

        findQuotesCtrl.timespan = "1d";

        findQuotesCtrl.searchQuote = function (quote) {
            findQuotesCtrl.loading = true;

            if (!quote) {
                findQuotesCtrl.loading = false;
                findQuotesCtrl.quoteFound = false;
            } else {
                fetchData(quote)
                    .success(fetchSuccess)
                    .error(fetchError);
            }
        };
        findQuotesCtrl.buyStock = function (price,symbol) {
            findQuotesCtrl.stockData={};
            findQuotesCtrl.stockData.username = userService.getData().username;
            findQuotesCtrl.stockData.stock = symbol;
            findQuotesCtrl.stockData.price=price;
                $http.post('http://localhost:5000/stockBuy/', findQuotesCtrl.stockData).success(function (data, status, headers, config) {
                    $state.go('app.watchlist');
                })
                    .error(function (err) {
                        console.log(err);
                    });
            }
        findQuotesCtrl.switchTimespan = function (value) {
            findQuotesCtrl.timespan = value;
        }

        function fetchData(symbol) {
            var url = "http://query.yahooapis.com/v1/public/yql";
            var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

            url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

            return $http.get(url);
        }

        function fetchSuccess(data) {
            findQuotesCtrl.quote = data.query.results.quote;

            findQuotesCtrl.loading = false;

            if (findQuotesCtrl.quote.Currency && findQuotesCtrl.quote.Name) {
                findQuotesCtrl.quoteFound = true;
            } else {
                findQuotesCtrl.quoteFound = false;
            }
        }

        function fetchError(error) {
            console.error(error);
        }

    })

    .controller('WatchlistCtrl', function ($http, $timeout, $scope, userService) {
        var watchlistCtrl = this;
        watchlistCtrl.stocksOwned={};
        watchlistCtrl.isIOS = ionic.Platform.isIOS();
        watchlistCtrl.isAndroid = ionic.Platform.isAndroid();
        watchlistCtrl.showing = 1;
        watchlistCtrl.loading = true;

        var stocks = [];

        var polingTimeInMilliseconds = 2000;
        $scope.getWatchList = function () {
            var data = userService.getData();
            $http.get('http://localhost:5000/watchlist/' + data.username).success(function (data, status, headers, config) {
                fetchData(data).success(fetchSuccess)
                    .error(fetchError);
            }).error(function (data, status, headers, config) {
                console.log(data);
                console.log('There was an error');
            });
        };
        (function tick() {

            $scope.getWatchList();
            $timeout(tick, polingTimeInMilliseconds);
        })();
        watchlistCtrl.switchBadge = function (stocks) {

            stocks.forEach(function (stock) {
                var showed = stock.Showed;

                if (showed == stock.Change) {
                    stock.Showed = stock.ChangeinPercent;
                    watchlistCtrl.showing = 2;
                } else if (showed == stock.ChangeinPercent) {
                    stock.Showed = stock.MarketCapitalization;
                    watchlistCtrl.showing = 3;
                } else if (showed == stock.MarketCapitalization) {
                    stock.Showed = stock.Change;
                    watchlistCtrl.showing = 1;
                } else {
                    stock.Showed = "N/A";
                    watchlistCtrl.showing = 0;
                }
            });

        };

        watchlistCtrl.getAllBySymbol = function (str) {
            console.log(str);
        }

        function fetchData(stocks) {
            var url = "http://query.yahooapis.com/v1/public/yql";
            var dataPrepare = "select symbol, LastTradePriceOnly, Name, ChangeinPercent, Change, MarketCapitalization from yahoo.finance.quotes where symbol in (";
            stocks.forEach(function (stock) {
                watchlistCtrl.stocksOwned[stock.Symbol.value]=stock.Stocks_owned;
                dataPrepare = dataPrepare + "'" + stock.Symbol.value + "',";
            });
            dataPrepare = dataPrepare.substring(0, dataPrepare.length - 1);
            dataPrepare += ")";
            var data = encodeURIComponent(dataPrepare);

            url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

            return $http.get(url);
        }

        function fetchSuccess(data) {
            var stocks = data.query.results.quote;
            if (!(stocks instanceof Array)) {
                var s = stocks;
                stocks = Array();
                stocks.push(s);
            }
            stocks.forEach(function (stock) {
                var showed;

                if (watchlistCtrl.showing == 1) {
                    showed = stock.Change;
                } else if (watchlistCtrl.showing == 2) {
                    showed = stock.ChangeinPercent;
                } else if (watchlistCtrl.showing == 3) {
                    showed = stock.MarketCapitalization;
                } else {
                    showed = "N/A";
                }

                stock["Showed"] = showed;
                stock["quantity"]=watchlistCtrl.stocksOwned[stock.symbol];
            });

            watchlistCtrl.stocks = stocks;
            watchlistCtrl.loading = false;
        }

        function fetchError(error) {
            console.error(error);
        }
    })

    .controller('StockCtrl', function ($scope, $state, $ionicModal, $stateParams, $http, $timeout, userService) {
        var stockCtrl = this;
        stockCtrl.isIOS = ionic.Platform.isIOS();
        stockCtrl.isAndroid = ionic.Platform.isAndroid();
        stockCtrl.loading = true;
        stockCtrl.timespan = "1d";
        (function tick() {

            fetchData($stateParams.symbol)
                .success(fetchSuccess)
                .error(fetchError);
            $timeout(tick, 2000);
        })();

        stockCtrl.switchTimespan = function (value) {
            stockCtrl.timespan = value;
        }

        $ionicModal.fromTemplateUrl('templates/addStock.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.addModal = modal;
        });
        stockCtrl.closeStock = function () {
            $scope.addModal.hide();
        }
        function fetchData(symbol) {
            var url = "http://query.yahooapis.com/v1/public/yql";
            var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");
            url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

            return $http.get(url);
        }

        function fetchSuccess(data) {
            stockCtrl.stock = data.query.results.quote;
            stockCtrl.loading = false;
        }

        function fetchError(error) {
            console.error(error);
        }
    });