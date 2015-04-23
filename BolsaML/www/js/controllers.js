angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {
  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
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

.controller('WatchlistCtrl', function($http) {
  var watchlistCtrl = this;

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

  function fetchData(stocks) {
    var url = "http://query.yahooapis.com/v1/public/yql";

    var dataPrepare = "select * from yahoo.finance.quotes where symbol in (";
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
      if(parseFloat(stock.Change) > 0.0) {
        stock["badgeStyle"] = "badge-positive";
      } else {
        stock["badgeStyle"] = "badge-assertive";
      }
    });

    watchlistCtrl.stocks = stocks;
  }

  function fetchError(error) {
    console.error(error);
  }
})

.controller('StockCtrl', function($stateParams, $http) {
  var stockCtrl = this;

  fecthData($stateParams.symbol)
    .success(fecthSuccess)
    .error(fecthError);

  function fecthData(symbol) {
    var url = "http://query.yahooapis.com/v1/public/yql";
    var data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + symbol + "')");

    url = url + "?q=" + data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env";

    return $http.get(url);
  }

  function fecthSuccess(data) {
    stockCtrl.stock = data.query.results.quote;
  }

  function fecthError(error) {
    console.error(error);
  }});
