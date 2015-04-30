angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal 
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.loginModal = modal;
  });

  // Create the logout modal
  $ionicModal.fromTemplateUrl('templates/logout.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.logoutModal = modal;
  });

  // Open the logout modal
  $scope.logout = function() {
    $scope.logoutModal.show();
  };

  // Triggered in the logout modal to close it
  $scope.closeLogout = function() {
    $scope.logoutModal.hide();
  };
  
  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.loginModal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.loginModal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('WatchlistCtrl', function($ionicLoading, $http) {
  var watchlistCtrl = this;

  watchlistCtrl.loading = true;

  var stocks = [
    { symbol: 'MSFT' },
    { symbol: 'GOOGL' },
    { symbol: 'AAPL' },
    { symbol: 'EBAY' },
    { symbol: 'AMZN' },
    { symbol: 'SHAK' },
    { symbol: 'AMOT' },
    { symbol: 'XRM' },
    { symbol: 'HILL' },
    { symbol: 'CLFD' },
    { symbol: 'ANAC' },
    { symbol: 'SPWH' },
    { symbol: 'HOT' }
  ];

  fetchData(stocks)
    .success(fetchSuccess)
    .error(fetchError);

  watchlistCtrl.switchBadge = function (stock) {
    var showed = stock.Showed;

    if (showed == stock.Change) {
      stock.Showed = stock.ChangeinPercent;
    } else if (showed == stock.ChangeinPercent) {
      stock.Showed = stock.MarketCapitalization;
    } else if (showed == stock.MarketCapitalization) {
      stock.Showed = stock.Change;
    } else {
      stock.Showed = "N/A";
    }
  };

  function fetchData(stocks) {
    var url = "http://query.yahooapis.com/v1/public/yql";

    var dataPrepare = "select symbol, Name, ChangeinPercent, Change, MarketCapitalization from yahoo.finance.quotes where symbol in (";
    stocks.forEach(function(stock) {
      dataPrepare = dataPrepare + "'" + stock.symbol + "',";
    });
    dataPrepare = dataPrepare.substring(0, dataPrepare.length - 1);
    dataPrepare += ")";
    var data = encodeURIComponent(dataPrepare);

    url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

    return $http.get(url);
  }

  function fetchSuccess(data) {
    var stocks = data.query.results.quote;

    stocks.forEach(function(stock) {
      stock["Showed"] = stock.Change;
    });

    watchlistCtrl.stocks = stocks;
    watchlistCtrl.loading = false;
  }

  function fetchError(error) {
    console.error(error);
  }
})

.controller('StockCtrl', function($stateParams, $http) {
  var stockCtrl = this;

  stockCtrl.loading = true;
  stockCtrl.timespan = "1d";

  fecthData($stateParams.symbol)
    .success(fecthSuccess)
    .error(fecthError);

  stockCtrl.switchTimespan = function() {

    var timespan = stockCtrl.timespan;

    if (timespan == "1d") {
      timespan = "5d";
    } else if (timespan == "5d") {
      timespan = "1m";
    } else if (timespan == "1m") {
      timespan = "6m";
    } else if (timespan == "6m") {
      timespan = "1y";
    } else if (timespan == "1y") {
      timespan = "1d";
    } else {
      timespan = "1d";
    }

    stockCtrl.timespan = timespan;
  }

  function fecthData(symbol) {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

    url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

    return $http.get(url);
  }

  function fecthSuccess(data) {
    stockCtrl.stock = data.query.results.quote;
    stockCtrl.loading = false;
  }

  function fecthError(error) {
    console.error(error);
  }});
