var app = angular.module('manage', ['ngRoute', 'datatables']);

app.controller('profileDropdown', function ($scope, $http) {
	$scope.logout = function __logout(type, user) {
		logout(type, user, function (err, user) {
			if (err) {
				return alert(err);
			}
			window.location.reload();
		});
	}

	function logout(type, user, cb) {
		$http({
			method: 'GET',
			url: '/api/logout/'
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
});

app.directive('showTab', function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function(e) {
                e.preventDefault();
                $(element).tab('show');
            });
        }
    };
});

$(document).ready(function(){
	(function () {
		var target = $('.sub-navbar .nav li a'),
			offset = 10;
		target.data('size', 'big'); // initialize
		$(window).scroll(function () {
			if ($(document).scrollTop() > offset && target.data('size') !== 'small') {
				target.stop().animate({
					padding: '10px 15px'
				}, 600);
				target.data('size', 'small');
			} else if ($(document).scrollTop() <= offset && target.data('size') !== 'big') {
				target.stop().animate({
					padding: '15px'
				}, 600);
				target.data('size', 'big');
			}
		});
	})();
    new WOW().init({
        mobile: false
    });
});

function Spinner() {
    this.spinner = $('#page-spinner');
}
Spinner.prototype.start = function start() {
    this.spinner.modal();
}
Spinner.prototype.stop = function stop() {
    this.spinner.modal('hide');
}
var spinner = new Spinner();
