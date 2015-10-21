
var vdiApp = angular.module("smartApp", [
	"ngRoute",
	"ngResource",
	// 'ngAnimate', // this is buggy, jarviswidget will not work with ngAnimate :(
	"ui.bootstrap",
	"app.controllers",
	//"app.demoControllers",
	"app.main",
	"app.navigation",
	"app.localize",
	"app.activity",
	"app.smartui",
	"vdi.resource",
	"vdi.dialogs",
	"vdi.controllers",
	"vdi.directives",
    "vdi.filter"
])

.config(["$routeProvider", "$provide", "$httpProvider", function($routeProvider, $provide, $httpProvider){
	$httpProvider.interceptors.push(function($q){
		return {
			"request": function(config){
				if(/^https?\:\/\//.test(config.url)){
					config.withCredentials = true;
				}
				return config;
			},
			"requestError": function(reject){
				console.log("REQ_ERROR");
				return $q.reject({
					info: reject
				});
			},
			"responseError": function(reject){
				console.log("RES_ERROR", arguments);
				return $q.reject({
					code: 100,
					message: $$$MSG.get("返回信息格式错误"),
					info: reject
				});
			},
			"response": function(res){
				if(/^https?\:\/\//.test(res.config.url)){
					if(/\/thor\/toolkit\//.test(res.config.url)){
						return res;
					}
					else{
						switch(res.data.code){
							case 17001:
								localStorage.returnUrl = location.href;
								location.replace("login.html");
							break;
	                        case 11011:
	                            localStorage.returnUrl = location.href;
	                            location.replace("init.html");
	                        break;
							case 0:
								return res;
							    break;
							default:
								$.bigBox({
									title : $$$MSG.get("PAI_CODE") + res.data.code,
									content : $$$MSG.get(res.data.code),
									color : "#C46A69",
									icon : "fa fa-warning shake animated",
									timeout : 6000
								});
							break;
						}
						return $q.reject(res);
					}
				}
				return res;
			}
		};
	});
	
	$routeProvider
		.when('/', { redirectTo: '/summary' })
		.when("/summary", { templateUrl: "views/vdi/summary.html", controller: "vdiSummaryController"})
		.when("/resource/host", { templateUrl: "views/vdi/resource/host.html", controller: "vdiResourceHostListController"})
		.when("/resource/network", { templateUrl: "views/vdi/resource/network.html", controller: "vdiResourceNetworkListController"})
		.when("/resource/network/:id", { templateUrl: "views/vdi/resource/IPpool.html", controller: "vdiResourceNetworkIPListController"})
		.when("/resource/storage", { templateUrl: "views/vdi/resource/storage.html", controller: "vdiResourceStorageListController"})
		.when("/desktop/scene", { templateUrl: "views/vdi/desktop/scene.html", controller: "vdiDesktopSceneListController"})
		.when("/desktop/teach/:id", { templateUrl: "views/vdi/desktop/teach.html", controller: "vdiDesktopTeachListController"})
		.when("/desktop/personal", { templateUrl: "views/vdi/desktop/personal.html", controller: "vdiDesktopPersonalListController"})
		.when("/template/teach", { templateUrl: "views/vdi/template/teach.html", controller: "vdiTemplateTeachDesktopListController"})
		.when("/template/personal", { templateUrl: "views/vdi/template/personal.html", controller: "vdiTemplatePresonalDesktopListController"})
		.when("/template/hardware", { templateUrl: "views/vdi/template/hardware.html", controller: "vdiTemplateHardwareListController"})
		.when("/terminal/schoolroom", { templateUrl: "views/vdi/terminal/schoolroom.html", controller: "vdiTerminalSchoolroomManageController"})
		.when("/terminal/client", { templateUrl: "views/vdi/terminal/client.html", controller: "vdiTerminalClientManageController"})
		.when("/terminal/session", { templateUrl: "views/vdi/terminal/session.html", controller: "vdiTerminalSessionManageController"})
		.when("/user/role", { templateUrl: "views/vdi/user/role.html", controller: "vdiUserRoleManageController"})
		.when("/user/admin", { templateUrl: "views/vdi/user/admin.html", controller: "vdiUserAdminManageController"})
		.when("/user/common", { templateUrl: "views/vdi/user/common.html", controller: "vdiUserCommonManageController"})
		.when("/user/domain", { templateUrl: "views/vdi/user/domain.html", controller: "vdiUserDomainController"})
		.when("/user/domain/:id", { templateUrl: "views/vdi/user/domainList.html", controller: "vdiUserDomainListController"})
		.when("/monitor/host", { templateUrl: "views/vdi/monitor/host.html", controller: "vdiMonitorController"})
		.when("/monitor/desktop", {templateUrl:"views/vdi/monitor/desktop.html", controller:"vdiMonitorController"})
		.when("/monitor/alarm", { templateUrl: "views/vdi/monitor/alarm.html", controller: "vdiMonitorAlarmController"})
		.when("/scheduler/view", { templateUrl: "views/vdi/scheduler/view.html", controller: "vdiSchedulerViewController"})
		.when("/system/backup", { templateUrl: "views/vdi/system/backup.html", controller: "vdiSystemBackupListController"})
		.when("/system/iso", { templateUrl: "views/vdi/system/iso.html", controller: "vdiSystemISOListController"})
		.when("/system/usb", { templateUrl: "views/vdi/system/usb.html", controller: "vdiSystemUSBListController"})
		.when("/system/upgrade", { templateUrl: "views/vdi/system/upgrade.html", controller: "vdiSystemUpgradeListController"})
		.when("/system/logs", { templateUrl: "views/vdi/system/logs.html", controller: "vdiSystemLogListController"})
		.when("/about", { templateUrl: "views/vdi/about.html", controller: "vdiPermissionController"})

		/* We are loading our views dynamically by passing arguments to the location url */

		// A bug in smartwidget with angular (routes not reloading). 
		// We need to reload these pages everytime so widget would work
		// The trick is to add "/" at the end of the view.
		// http://stackoverflow.com/a/17588833
		// .when('/:page', { // we can enable ngAnimate and implement the fix here, but it's a bit laggy
		// 	templateUrl: function($routeParams) {
		// 		return 'views/'+ $routeParams.page +'.html';
		// 	},
		// 	controller: 'PageViewController'
		// })
		.otherwise({
			redirectTo: '/summary'
		});
	// with this, you can use $log('Message') same as $log.info('Message');
	$provide.decorator('$log', ['$delegate',
	function($delegate) {
		// create a new function to be returned below as the $log service (instead of the $delegate)
		function logger() {
			// if $log fn is called directly, default to "info" message
			logger.info.apply(logger, arguments);
		}

		// add all the $log props into our new logger fn
		angular.extend(logger, $delegate);
		return logger;
	}]); 

}])

.run(["$rootScope", "settings","localize",function($rootScope, settings,localize){
	settings.currentLang = settings.languages.filter(function(l) {
		return l.langCode === localStorage.i18n_code;
	})[0]; 

	var ev_dialog_close = function(){
		try{
			window.___dialog && window.___dialog.dismiss && window.___dialog.dismiss();
			window.___dialog = null;
		}
		catch(e){}
	}
	$rootScope.$on("$viewContentLoaded", ev_dialog_close);
	$rootScope.$on("$$$forceCloseDailog", ev_dialog_close);
	var debug = true;
	if(window.console && !debug){
		window.console = {};
		"memory,debug,error,info,log,warn,dir,dirxml,table,trace,assert,count,markTimeline,profile,profileEnd,time,timeEnd,timeStamp,timeline,timelineEnd,group,groupCollapsed,groupEnd,clear".split(",").forEach(function(n){
			window.console[n] = Function.prototype;
		});
	}
	if(localStorage.loginInfo && JSON.parse(localStorage.loginInfo).keys){
		var keys = JSON.parse(localStorage.loginInfo).keys.split(","), URL = [];
		keys.forEach(function(key){
			$$$power_lists.forEach(function(item){
				if(key == item.key && item.url){
					URL.push(item.url)
				}
			})
		})
	}
	$rootScope.$on("$viewContentLoaded", function() {
		if(URL.length!=0){
			var is_hasid = false;
			if(location.hash.match(/#\/desktop\/teach\/\d+$/) || location.hash.match(/#\/resource\/network\/\d+$/) || location.hash.match(/#\/user\/domain\/\d+$/) ){
				is_hasid = true;
			}
			if(URL.filter(function(item){ return item == location.hash; }).length == 0 && !is_hasid){
				location.replace("#summary.html")
			}				
		}
	})	

	
}]);


vdiApp.constant('ip_pattern',/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/g);