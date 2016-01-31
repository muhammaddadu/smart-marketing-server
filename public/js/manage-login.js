var app = angular.module('manage', []);

app.controller('login', function ($scope, $http) {
	$scope.user = {
		email: null,
		password: null,
		remember: false
	};
	$scope.signin = function __signin(type, user) {
		$scope.errorMessage = null;
		if (!user || !user.email || !user.password) {
			return;
		}
		signin(type, user, function (err, user) {
			if (err) {
				return $scope.errorMessage = err;
			}
			window.location.reload();
		});
	}

	function signin(type, user, cb) {
		$http({
			method: 'POST',
			url: '/api/login/' + type,
			data: user
		}).then(function successCallback(response) {
			var data = response.data;
			if (!data.success) {
				console.error('subscribe error:', data);
				return cb(data.data);
			}
			cb(null, data.data);
		}, function errorCallback(response) {
			console.error('subscribe error:', response);
			cb(response.data && response.data.data);
		});
	}

	$scope.resetPasswordRequest = function resetPasswordRequest(email) {
		$scope.successMessage = null;
		$scope.errorMessage = null;
		$http({
			method: 'GET',
			url: '/api/reset/' + email
		}).then(function () {
			$scope.successMessage = "Please check you email to reset your password";
		}, function (res) {
			var error = res.data && res.data.data || res.data || res;
			typeof error === 'object' && error.code == 404 && (error = 'Account Not Found')
			$scope.errorMessage = error;
		});
	}
	
	$scope.openForgotPasswordPage = function () {
		$scope.successMessage = null;
		$scope.errorMessage = null;
		$scope.forgotPasswordPage = true;
	}
	
	$scope.closeForgotPasswordPage = function () {
		$scope.successMessage = null;
		$scope.errorMessage = null;
		$scope.forgotPasswordPage = false;
	}
});		