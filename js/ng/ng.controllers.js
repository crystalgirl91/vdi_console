angular.module("app.controllers", [])
.factory("settings", ["$rootScope", function($rootScope){
	var settings = {
		languages: [
			{
				language: "develop verson",
				translation: "开发版本",
				langCode: "develop",
				flagCode: "dev"
			},
			{
				language: "production version",
				translation: "产品版本",
				langCode: "production",
				flagCode: "pro"
			}
		],
	};
	return settings;
	
}])
.controller("PageViewController", ["$scope", "$route", "$animate", function($scope, $route, $animate) {
	// controler of the dynamically loaded views, for DEMO purposes only.
	// $scope.$on("$viewContentLoaded", function() {
	// 	console.log("ffffffff")
	// })
}])
.controller("LangController", ["$scope", "settings", "localize", function($scope, settings, localize) {
	$scope.languages = settings.languages;
	$scope.currentLang = settings.currentLang;
	$scope.setLang = function(lang) {
		settings.currentLang = lang;
		$scope.currentLang = lang;
		localize.setLang(lang);
		localStorage.i18n_code = lang.langCode;
	}
	// set the default language
	$scope.setLang($scope.currentLang);
}]);