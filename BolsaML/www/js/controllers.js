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

.controller('WatchlistCtrl', function($scope) {
  $scope.watchlist = [
    { name: "Microsoft", title: 'MSFT', id: 1, change: 3.89, badgeStyle: "badge-positive"},
    { name: "Google", title: 'GOOGL', id: 2, change: 5.83, badgeStyle: "badge-positive"},
    { name: "Apple", title: 'AAPL', id: 3, change: 0.01, badgeStyle: "badge-assertive"},
    { name: "Ebay", title: 'EBAY', id: 4, change: 0.53, badgeStyle: "badge-assertive"},
    { name: "Amazon", title: 'AMZN', id: 5, change: 1.12, badgeStyle: "badge-positive"},
    { name: "Dow Jones Index", title: 'DOW J', id: 6, change: 10.4, badgeStyle: "badge-assertive"}
  ];
})

.controller('StockCtrl', function($scope, $stateParams) {
  $scope.stock = $stateParams;
});
