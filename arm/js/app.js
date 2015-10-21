angular.module('armApp', [
	"arm.directives",
	"arm.controllers",
	"arm.resource",
	"ngRoute",
	"ngAnimate",
	// "ngMockE2E",
	"app.localize",
	"ui.bootstrap"
])
.config(["$routeProvider", "$httpProvider",function($routeProvider, $http){
	$$$log = []; 
	$http.interceptors.push(function($q){
		return {
			request: function(config){
				if(config.url.indexOf("http://api_server/") === 0){
					config.url = "http://" +
						(global.$CONFIG.business.api_address ? global.$CONFIG.business.api_address : "127.0.0.1") + ":" +
						global.$CONFIG.business.port_http + config.url.substr(17);
				}else if(config.url.indexOf("views/")===0 || config.url.indexOf("./views/")===0){
					config.url += "?" + $VERSION;
				}

				return config;
			},
			responseError: function(reject){
				console.log("RES_ERROR", arguments);
				return $q.reject({
					code: 100,
					message: $$$MSG.get("返回信息格式错误"),
					info: reject
				});
			},
			response: function(res){
				if(res.config.url.indexOf(global.$CONFIG.business.api_address ? "http://" + global.$CONFIG.business.api_address : "http://127.0.0.1:") === 0){
					var result = res.data.result;
					var code = res.data.code;
					if(code){
						return $q.reject($$$MSG.get(code));
					}else if(code === 0 && result && (result.error_code || result.error)){
						var err_mess = result.error_code ? $$$MSG.get(result.error_code) : result.error;
						return $q.reject(err_mess);
					}
					else{
						return res;
					}
				}
				return res;
			}
		};
	});

	$routeProvider.when("/home", {
		templateUrl: "views/home.html",
		controller: "homeController"
	}).when("/teaching", {
		templateUrl: "views/teaching_desktop.html",
		controller: "teachingController"
	}).when("/login", {
		templateUrl: "views/personal_desktop_login.html",
		controller: "personalloginController"
	}).when("/resetpassword", {
		templateUrl: "views/reset_password.html",
		controller: "resetpasswordController"
	}).when("/personal", {
		templateUrl: "views/personal_desktop.html",
		controller: "personalController"
	}).otherwise({ redirectTo: "/home" })

	//console.log($httpBackend);


}])

.run(["localize","API","$interval","$rootScope", "API", "$location", function(localize,API,$interval,$rootScope,API, $location){
	var lang={language: "production version", translation: "产品版本", langCode: "production", flagCode: "pro"};
	$rootScope.is_run = true;
	$rootScope.log_data = $$$log;
	window.localize = localize;
	window.root = $rootScope;
	localize.setLang(lang);

	API.desktop.mode(function(res){
		var mode = res.result['desktop-mode'];
		$rootScope.wait_time = res.result.waittime;
		window.$$$mode = mode;
		switch(mode){
			case 0 :
				$location.url("/home");
				break;
			case 1:
				$location.url("/teaching");
				break;
			case 2 :
				$location.url("/login");
				break;
			default : 
				$location.url("/home");
				break;
		}
	})
}]);

