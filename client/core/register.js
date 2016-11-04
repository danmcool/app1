app1.controller('RegisterCtrl', ['$scope', '$location', '$mdDialog', 'Register',
  function($scope, $location, $mdDialog, Register) {
    $scope.register = function(user, code, firstname, lastname, email, company_name) {
      var registerObject = new Register({
        user: user,
        code: code,
        firstname: firstname,
        lastname: lastname,
        email: email,
        company_name: company_name
      });
      registerObject.$save(function(object) {}).then(function(res) {
        $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title('Success')
          .textContent(res.msg)
          .ariaLabel('Error')
          .ok('Got it!')
        ).then(function() {
          $location.url('/');
        });
      }).catch(function(res) {
        $mdDialog.show(
          $mdDialog.alert()
          .parent(angular.element(document.body))
          .clickOutsideToClose(true)
          .title('Error')
          .textContent(res.data.msg)
          .ariaLabel('Error')
          .ok('Got it!')
        );
      });
    };
  }
]);
