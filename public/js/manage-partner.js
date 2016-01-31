/**
 * Manage Staff
 */

if (typeof app == 'undefined') {
	var app = angular.module('manage', ['ngRoute', 'ngAnimate', 'datatables']);
}

const 
    weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    weekdaysF = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad2(number) {
    return (number < 10 ? '0' : '') + number  
}


function getStartOfDay(timestamp) {
    var date = new Date(timestamp),
        startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return startOfDate.getTime();
}

/**
 * Navigation Structure
 */

var menuItems = {
	dashboard: { icon: 'fa fa-tachometer', title: 'Dashboard', path: '/dashboard', templateUrl: '/partials/partner/dashboard.html', controller: 'dashboard' },
	campaigns: { icon: 'fa fa-bar-chart', title: 'Campaigns', path: '/campaigns', templateUrl: '/partials/partner/campaigns.html', controller: 'campaigns' },
	account: { icon: 'fa fa-user', title: 'My Account', path: '/account', templateUrl: '/partials/partner/account.html', controller: 'account' },
};

var additionlPaths = [
	// { path: '/profile', templateUrl: '', controller: '' },
];

// Initally load menu items
app.controller('sub-navbar', function ($scope, $location) {
	$scope.isActive = function isActive(path) {
		var RegEx = new RegExp('^' + path + '/', 'g');
		return path === $location.path() || RegEx.test($location.path());
	};

	$scope.menuItems = menuItems;
});

app.config(['$routeProvider', function ($routeProvider) {
	var menuItemsKeys = Object.keys(menuItems),
		rp = $routeProvider;
	for (var i = 0, l = menuItemsKeys.length; i < l; ++i) {
		var key = menuItemsKeys[i],
			item = menuItems[key];
		rp = rp.when(item.path, {
			templateUrl: item.templateUrl,
			controller: item.controller
		});
	}
	rp = rp.when('/profile', {
		templateUrl: '/partials/staff/profile.html',
		controller: 'profile'
	});
	// append addional paths
	additionlPaths.forEach(function (item) {
		rp = rp.when(item.path, {
			templateUrl: item.templateUrl,
			controller: item.controller
		});
	});
	rp = rp.otherwise({ redirectTo: menuItems.dashboard.path });
}]);

/**
 * Models
 */

app.factory('Campaign', function ($http) {
	return {
		get: function get() {
			return $http({
				method: 'GET',
				url: '/api/manage/campaign'
			});
		},
		findById: function findById(id) {
			return $http({
				method: 'GET',
				url: '/api/manage/campaign/' + id
			});
		},
		add: function add(product) {
			return $http({
				method: 'PUT',
				url: '/api/manage/campaign',
				data: product
			});
		},
		uploadImages: function uploadImages(id, images) {
			return $http({
				method: 'PUT',
				url: '/api/manage/campaign/' + id + '/image',
				transformRequest: function (data) {
					var formData = new FormData();
					//now add all of the assigned files
					for (var i = 0; i < data.file.length; i++) {
					    //add each file to the form data and iteratively name them
					    formData.append('file', data.file[i]);
					}
					return formData;
				},
				data: {
					file: images
				},
				headers: {'Content-Type': undefined}
			});
		},
		update: function update(productId, data) {
			return $http({
				method: 'POST',
				url: '/api/manage/campaign/' + productId,
				data: data
			});
		}
	}
});

app.factory('View', function ($http) {
	return {
		countAll: function get() {
			return $http({
				method: 'GET',
				url: '/api/manage/view/count/all'
			});
		},
		countByMonth: function findById(id) {
			return $http({
				method: 'GET',
				url: '/api/manage/view/count/month'
			});
		},
		findByCampaignId: function findById(id) {
			return $http({
				method: 'GET',
				url: '/api/manage/view/:campaignId'
			});
		}
	}
});


/**s
 * Controllers
 */

app.controller('dashboard', function ($scope, $filter, View, Campaign, $filter, DTOptionsBuilder, DTColumnBuilder) {
	window.document.title = 'Dashbaord | Smart Marketing';
	$scope.stats = [
		{ class: 'red', icon: 'fa fa-bar-chart', title: 'Total Impressions', value: 0 },
		{ class: 'blue', icon: 'fa fa-bar-chart', title: 'Monthly Impressions', value: 0 },
	];
	function loadCounters() {
		View.countAll().then(function (res) {
			res.data && res.data.data && ($scope.stats[0].value = res.data.data);
		});
		View.countByMonth().then(function (res) {
			res.data && res.data.data && ($scope.stats[1].value = res.data.data);
		});
	}
	loadCounters();
	setTimeout(loadCounters, 10 * 1000);

	$scope.campaignShowCase = {
		dtColumns: [
			DTColumnBuilder.newColumn('name').withTitle('Name'),
			DTColumnBuilder.newColumn('image').withTitle('Image').renderWith(function (data) {
				return '<a href="' + data + '">' + data + '</a>';
			}),
			DTColumnBuilder.newColumn('bid').withTitle('Bid').renderWith(function (data) {
				return $filter('currency')(data, '&pound;', 2);
			})
	    ],
	    dtOptions: DTOptionsBuilder
	    			.fromFnPromise(function () { return Campaign.get(); })
	    			.withDataProp('data.data')
	    			.withPaginationType('full_numbers')
	    			// .withOption('order', [0, 'desc'])
	    			.withOption('autoWidth', false)
	    			.withDisplayLength(50)
	    			.withDOM('frtip')
	    };
	$scope.eventsShowCase = {
		dtColumns: [
			DTColumnBuilder.newColumn('UUID').withTitle('UUID'),
			DTColumnBuilder.newColumn('count').withTitle('count')
	    ],
	    dtOptions: DTOptionsBuilder
	    			.fromFnPromise(function () { return View.get(); })
	    			.withDataProp('data.data')
	    			.withPaginationType('full_numbers')
	    			// .withOption('order', [0, 'desc'])
	    			.withOption('autoWidth', false)
	    			.withDisplayLength(50)
	    			.withDOM('frtip')
	    };

});


app.controller('campaigns', function ($scope, $filter, $compile, View, Campaign, $filter, DTOptionsBuilder, DTColumnBuilder) {
	window.document.title = 'campaigns | Smart Marketing';
	$scope.showCase = {
		dtColumns: [
			DTColumnBuilder.newColumn('name').withTitle('Name'),
			DTColumnBuilder.newColumn('image').withTitle('Image').renderWith(function (data) {
				return '<a href="' + data + '">' + data + '</a>';
			}),
			DTColumnBuilder.newColumn('bid').withTitle('Bid').renderWith(function (data) {
				return $filter('currency')(data, '&pound;', 2);
			}),
			DTColumnBuilder.newColumn(null).withTitle().renderWith(function (data) {
				return '<button ng-click="edit(' + data.id + ')" class="btn btn-sm btn-primary pull-right" style="margin-left: 10px"><i class="fa fa-plus"></i> Edit</button>';
			})
	    ],
	    dtOptions: DTOptionsBuilder
	    			.fromFnPromise(function () { return Campaign.get(); })
	    			.withDataProp('data.data')
	    			.withPaginationType('full_numbers')
	    			// .withOption('order', [0, 'desc'])
	    			.withOption('autoWidth', false)
	    			.withDisplayLength(50)
	    			.withDOM('frltip')
	    			.withOption('createdRow', function(row) {
			            $compile(angular.element(row).contents())($scope);
			        })
	    };
	$scope.dtInstance = {};

	// add button
	setTimeout(function () {
		var fcLeft = $('.dataTables_length');
		fcLeft.append($compile('<button ng-click="add()" class="btn btn-sm btn-success pull-right" style="margin-left: 10px"><i class="fa fa-plus"></i> Add</button>')($scope));
	}, 100);

	$scope.add = $scope.edit = function (id) {
		$('#addEditModel').modal();
		if (id) {
			Campaign.findById(id).then(function (res) {
				var data = res.data.data;
				$scope.campaign = data;
			});
		}
	}

	$scope.doAddEdit = function (campaign) {
		function nextStuff(res) {
			var data = res.data && res.data.data;
			// check for images productFileInput
			var ProductFileInput = $("#productFileInput");
			if (!ProductFileInput || ProductFileInput.length === 0 
				|| !ProductFileInput[0].files || ProductFileInput[0].files.length === 0) {
				location.reload();
				return $('#addEditModel').modal('hide');
			}
			var filesToUpload = ProductFileInput[0].files;
			Campaign.uploadImages(data.id, filesToUpload).then(function () {
				location.reload();
				return $('#addEditModel').modal('hide');
			}, error);
			
		}
		function error(res) {
			var data = res.data && res.data.data;
			$scope.addEditErrorMessage = data;
		}
		$scope.addEditErrorMessage = null;
		if (campaign.id) {
			// update
			Campaign.update(campaign.id, campaign).then(nextStuff, error);
		} else {
			Campaign.add(campaign).then(nextStuff, error);
		}
	}
});
