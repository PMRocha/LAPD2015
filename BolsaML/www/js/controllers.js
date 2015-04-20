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

.controller('WatchlistCtrl', function($scope, $http) {
  $scope.watchlist = [
    { name: "Microsoft", symbol: 'MSFT', id: 1, change: 3.89, badgeStyle: "badge-positive"},
    { name: "Google", symbol: 'GOOGL', id: 2, change: 5.83, badgeStyle: "badge-positive"},
    { name: "Apple", symbol: 'AAPL', id: 3, change: 0.01, badgeStyle: "badge-assertive"},
    { name: "Ebay", symbol: 'EBAY', id: 4, change: 0.53, badgeStyle: "badge-assertive"},
    { name: "Amazon", symbol: 'AMZN', id: 5, change: 1.12, badgeStyle: "badge-positive"}
  ];
})

.controller('StockCtrl', function($scope, $stateParams, $http, $timeout) {
  $url = "http://query.yahooapis.com/v1/public/yql";
  $symbol = $stateParams.symbol;
  $data = encodeURIComponent("select * from yahoo.finance.quotes where symbol in ('" + $symbol + "')");

  $http.get($url + '?q=' + $data + "&format=json&diagnostics=true&env=http://datatables.org/alltables.env")
    .success(function (data, status, header, config) {
      $timeout(function() {
        $scope.$apply(function() {
          $scope.stock = data.query.results.quote;
        });
      }, 0);
    })
    .error(function (data, status, header, config) {
      console.error(data);
    });
});
