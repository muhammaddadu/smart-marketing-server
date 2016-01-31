/**
 * Eat Homely
 */
/**
 * Templating Code
 */
var $doc = $(document);

/**
 * Models
 */
app.factory('Partner', function ($http) {
    return {
        create: function create(data) {
            return $http({
                method: 'POST',
                url: '/api/register/partner',
                data: data
            });
        },
        login: function login(data) {
            return $http({
                method: 'POST',
                url: '/api/login/partner',
                data: data
            });
        },
        whoami: function whoami() {
            return $http({
                method: 'GET',
                url: '/api/whoami'
            });
        }
    }
});

/**
 * Partner Register
 */
app.controller('partnerRegister', function ($scope, Partner) {
    $scope.view = 1;
    Partner.whoami().then(function (res) {
        var partner = res.data.data;
        if (!partner || !partner.user || !partner.partner) {
            return;
        }
        $scope.activated = partner.user.activated;
        $scope.view = 2;
    });
    function handleError(res) {
        var err = res.data && res.data.data || res.data;
        $scope.errorMessage = err;
    }
    $scope.register = function (partner) {
        $scope.errorMessage = null;
        if (!partner || !partner.firstName || !partner.lastName || !partner.email || !partner.companyName || !partner.password || !partner.repeatPassword) {return $scope.errorMessage = 'Please fill in all the details';}
        Partner.create(partner).then(function (res) {
            Partner.login({
                email: partner.email,
                password: partner.password
            }).then(function () {
                $scope.view = 2;
            }, handleError);
        }, handleError);
    }
});