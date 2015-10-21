angular.module('arm.controllers', [])
.constant("shareData", {
	loginMess:{},
})
.factory("waitBackdrop", ["$modal",function($modal){
	return {
		open: function(opts){
			$modal.open({
				template : "<div class='text-center'><img src='img/loadingtext.gif'></img><div>",
				size: "sm",
				backdrop : "static",
				keyboard : false,
				controller: opts._ctrl
			});
		}

	};
}])
.controller("mainController", ["$scope","API","shareData","$timeout", function($scope,API,shareData,$timeout){
	$scope.domain = $Domain;
	function poling(){
		API.loop(function(data){
			var res = data.result;
			var _time = res.Interval;
			var _begin = res.Begin_order;
			var _end = res.End_order;
			var _id = res.Refresh_order_id;
			$scope.$root.is_get_dhcp = res._is_get_dhcp_ip;
			$scope.$root.$broadcast("loop_data", res);
			if(_begin && !_end){
				$scope.is_sort = true;
				$scope.$root.order_id = _id;
			}else if(!_begin && _end){
				$scope.is_sort = false;
			}
			$timeout(poling,_time);
		},function(){
			$timeout(poling,1000);
		});
	};
	poling();
}])
.controller("footerController", ["$scope","$modal", "API","$timeout","$rootScope", function($scope,$modal,API,$timeout,$rootScope){

	$scope.$on("loop_data",function(e,res){
		var is_register = Number(res.register_state.success);
		var is_network = Number(res.Net_card_connected);
		var is_mqconnect = Number(res.Mq_connected);
		$rootScope.lock_desk = !is_register || !is_network || !is_mqconnect;
		if(!is_register){
			$scope.loop_err = $$$I18N.get("连接服务器失败");
		}else if(!is_network){
			$scope.loop_err = $$$I18N.get("请检查网络配置");
		}else{
			$scope.loop_err = "";
		}
	});

	$scope.setting_confirm = function(){
		//设置密码输入弹框
		var modalInstance = $modal.open({
			templateUrl: 'views/setting_confirm.html',
			size:"sm",
			backdrop : "static",
			keyboard : false,
			controller: function($scope,$modalInstance){
				$scope.rootPwd = "";
				$scope.ok = function(){
					if(this.rootPwd == "oe1234"){
						$modalInstance.close();
					}else{
						$scope.pwd_err = $$$I18N.get("密码错误");
					}
				};
				$scope.close= function(){
					$modalInstance.dismiss();
					$rootScope.$broadcast("close_modal");
				};
			}
	    });
	    // 打开设置页弹框
	    modalInstance.result.then(function(){
	    	settingDialog();
	    });
	    $rootScope.$broadcast("open_modal");
	};
	function settingDialog(){
		var modalInstance = $modal.open({
			templateUrl : "./views/setting.html",
			size : "lg",
			backdrop : "static",
			keyboard : false,
			controller : "settingController"
		});

		// 打开系统升级对话框，关闭设置对话框
		$scope.$on("closeSettingDialog", function(e,res){
			if(res._bool){
				modalInstance.close();
			}
		});
	};
	$scope.reboot_confirm = function(){
		$scope.$root.$broadcast("open_modal");
		$modal.open({
			template:"<section id='widget-grid'><div class=''><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title  modal-title-sm' id='mySmallModalLabel' localize='重启'>"+
							"重启</h4></div><div class='modal-body'><form class='form-horizontal'><p class='confirm-p' localize='确定重启吗'>确定重启吗?</p><footer class='text-right'><button class='arm-btn arm-btn-sm arm-btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='arm-btn arm-btn-sm arm-btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			backdrop : "static",
			keyboard : false,
			controller:function($scope,$modalInstance){
				$scope.ok = function(){
					API.system.restart(function(){
						$modalInstance.close();
					})
				};
				$scope.close = function(){
					$modalInstance.close();
					$rootScope.$broadcast("close_modal");
				}
			},
			size:"sm"
		})
	};
	$scope.shutdown_confirm = function(){
		$scope.$root.$broadcast("open_modal");
		$modal.open({
			template:"<section id='widget-grid'><div class=''><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title modal-title-sm' id='mySmallModalLabel' localize='关机'>"+
							"关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  class='confirm-p' localize='确定关机吗'>确定关机吗?</p><footer class='text-right'><button class='arm-btn arm-btn-sm arm-btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='arm-btn arm-btn-sm arm-btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			controller:function($scope,$modalInstance){
				$scope.ok = function(){
					API.system.shutdown(function(){
						$modalInstance.close();
					})
				};
				$scope.close = function(){
					$modalInstance.close();
					$rootScope.$broadcast("close_modal");
				}
			},
			backdrop : "static",
			keyboard : false,
			size:"sm"
		})
	};
}])
.controller("homeController", ["$scope","$modal","API","shareData","waitBackdrop", function($scope,$modal,API,shareData,waitBackdrop){
	$scope.version = $$$I18N.get("GOD_VERSION");
	API.system.info(function(res){
		$scope.l_version = "(V" + res.result.version + ")";
	});
	$scope.$on("loop_data", function(e,res){
		if(res.relogin){
			location.replace("#/teaching");
		}
	});

}])
.controller('sortClientController', ['$scope',"API","shareData", function ($scope,API,shareData) {
	$scope.sort_type = "0";
	$scope.sort_num = null;
	$scope.finish = false;
	var cur_id = $scope.$root.order_id;
	$scope.sortOk = function(){
		var _this = this;
		var _id = $scope.$root.order_id;
		if(_this.sort_type ==1 && (this.sort_num < cur_id)){
			_this.sort_err = $$$I18N.get("输入序号需大于起始序号") + cur_id;
		}else{
			var num = parseInt(_this.sort_type) ? parseInt(_this.sort_num) : parseInt(_id);
			API.set_loop({order: num},function(res){
				_this.finish = true;
				_this.sort_type = 0;
				_this.final_id = res.result.order;
				_this.sort_err = "";
			},function(err){
				_this.sort_err = err;
			});
		}
	};
	$scope.clearData = function(){
		this.finish = false;
		this.sort_num = null;
		this.sort_type = 0;
	};
}])
.controller("settingController", ["$rootScope","$scope", "$filter","$interval","$modalInstance",function($rootScope,$scope,$filter,$interval,$modalInstance){

	$scope.selectDate = Date.now();
	
	$scope.pack_type = 0;
	$scope.close = function(){
		$rootScope.$broadcast("close_modal");
		$modalInstance.close();
	}
}])
.controller("settingServerController", ["$scope", "API",function($scope,API){

	$scope.btn_unable = true;
	API.network.get_server_ip(function(res){
		$scope.ip = res.result.console_ip;
		// $scope.mq_ip = res.result.rabbitmq_ip;
		$scope.port = res.result.console_port;
	});
	$scope.serverOk = function(){
		var _scope = this;
		_scope.ser_err = '';
		var _port = Number(_scope.port);
		var is_port = (_port > 1024 && _port < 65535) ? true : false;
		if(!is_port){
			_scope.ser_err = $$$I18N.get("请输入1024-65535之间的端口号");
		}else{
			_scope.btn_unable = true;
			API.network.set_server_ip({
				console_ip : _scope.ip || "",
				console_port : _port,
				rabbitmq_ip : _scope.ip || ""
			},function(res){
				_scope.ser_err = $$$I18N.get("保存成功");
			},function(){
				_scope.ser_err = $$$I18N.get("保存失败");
			})
		}
	};
	
}])
.controller("settingNetworkController", ["$scope","API","$interval","$timeout", function($scope,API,$interval,$timeout){

	$scope.pingType = 1;
	$scope.netType = '0';
	$scope.wireType = '0';
	$scope.client_type = 1;

	get_cur_ip();

	API.system.client_type(function(res){
		$scope.client_type = res.result.client_type;
	});

	function get_cur_ip(){
		API.network.get_ip(function(response){
			var result = response.result;
			if(result["interface-type"] == 1){
				write_wifi(result);
			}else{
				write_ip(result);
			}
			if(result && result.address && result.address.length > 6){
				$scope.net = result;
			}
		},function(err){
			$scope.net_err = err;
		});
	}
	// function get_oss_ip(){
	// 	API.network.get_oss_ip(function(res){
	// 		write_ip(res.result);
	// 	});
	// 	$scope.btn_unable = false;
	// }
	var wifi_timer;
	function get_wifi_list(){
		// $scope.wifiLoading = true;
		API.network.get_wifi_list(function(res){
			// $scope.wifiLoading = false;
			if(res.result && res.result.length > 0){
				$scope.wlans = res.result;
			}
			$timeout.cancel(wifi_timer);
			wifi_timer = $timeout(function(){
				get_wifi_list();
			},5000);
		},function(err){
			$scope.net_err = err;
		});
	}
	function write_wifi(res){
		if(res && res.address){
			$scope.wireType = String(res["interface-type"]);
			$scope.selectedWlan = res.wifi_name;
			$scope.wifi_password = null;
			$scope.wifiNet = {
				name: res.wifi_name,
				mask: res.mask,
				address: res.address,
				gateway: res.gateway,
				dns1: res.dns1,
				dns2: res.dns2
			};
			write_ip();
		}else{
			$scope.wifi_password = null;
			$scope.selectedWlan = null;
			$scope.wifiNet = {
				name: '',
				mask: '',
				address: '',
				gateway: '',
				dns1: '',
				dns2: ''
			};
		}
	}
	function write_ip(res){
		var _res = res;
		if(_res && _res.address){
			$scope.wireType = String(_res["interface-type"]);
			$scope.netType = String(_res["net-type"]);
			$scope.netIp = _res.address;
			$scope.netMask = _res.mask;
			$scope.netGateway = _res.gateway;
			$scope.netDNS = (_res.dns1.length > 6) ? _res.dns1 : "";
			$scope.netDNS2 = (_res.dns2.length > 6) ? _res.dns2 : "";
			write_wifi();
		}else{
			$scope.netIp = '';
			$scope.netMask = '';
			$scope.netGateway = '';
			$scope.netDNS = '';
			$scope.netDNS2 = '';
		}
	}
	function clear_ip(){
		if($scope.net && Number($scope.net["net-type"]) === 0 && Number($scope.net["net-type"]) === Number($scope.netType)){
			write_ip($scope.net);
		}else{
			write_ip();
		}
		$scope.net_err = null;
		$scope.networkConfigForm.$setPristine();
	};
	$scope.$watch("wireType", function(val){
		if(val == 1){
			get_wifi_list();
		}
		if(val == 0){
			$timeout.cancel(wifi_timer);
		}
	});
	$scope.change_net_type = function(type){
		clear_ip();
	};
	$scope.save_net_config = function(){
		var postData = {
			'interface-type' : Number($scope.wireType),
			'net-type' : Number($scope.netType),
			address : $scope.netIp,
			mask : $scope.netMask,
			gateway : $scope.netGateway,
			dns1 : $scope.netDNS,
			dns2 : $scope.netDNS2
		};
		$scope.submiting = true;
		API.network.set_ip(postData,function(res){
			get_cur_ip();
			$scope.net_err = $$$I18N.get("保存成功");
			$scope.submiting = false;
		},function(err){
			$scope.net_err = err;
			$scope.submiting = false;
		});
	};
	$scope.save_wifi_config = function(){
		var postData = {
			'interface-type' : Number($scope.wireType),
			'net-type':1,
			wifi_name: $scope.selectedWlan,
			wifi_pwd:$scope.wifi_password,
		};
		$scope.submiting = true;
		API.network.set_ip(postData,function(res){
			get_cur_ip();
			$scope.net_err = $$$I18N.get("保存成功");
			$scope.submiting = false;
		},function(err){
			$scope.submiting = false;
			$scope.net_err = err;
		});
	};

	$scope.getWifiBtnAble = function(){
		var wifi_able = [$scope.wifi_password,$scope.selectedWlan];
		return wifi_able.some(function(item){ return item ? false : true}) ? true : false;
	};

	$scope.select_wlan = function(w){
		$scope.selectedWlan = w;
	};

	$scope.get_dhcp = function(){
		$scope.getting = true;
		API.network.begin_dhcp(function(){
			$scope.out_time = 30;
			var timer = $interval(function(){
				if($scope.out_time > 0){
					if($scope.$root.is_get_dhcp){
						$scope.getting = false;
						$interval.cancel(timer);
						API.network.get_ip(function(res){
							write_ip(res.result);
						});
					}
					$scope.out_time--;
				}else{
					$interval.cancel(timer);
					API.network.cancle_dhcp(function(){
						$scope.getting = false;
					},function(){
						$scope.getting = false;
					});
				}
			},1000);
		});
	};

	$scope.get_oss = function(){
		get_oss_ip();
	};

	var ping;
	$scope.go_ping = function(){
		var _this = this;
		var num = _this.pingType == 1 ? 0 : _this.ping_count;
		_this.ping_result = "";
		_this.ping_submit = true;
		ping = require("child_process").exec("ping " + _this.ping_ip + (num ? " -c " + num : ""));
		ping.stdout.on("data", function(data){
			_this.ping_result += data;
			$scope.$apply();
		});
		ping.stdout.on("end", function(){
			try{
				ping.stdout.removeAllListeners();
				ping.kill();
			}
			catch(e){

			}
		});
	};
	$scope.cancel_ping = function(){
		var _this = this;
		_this.ping_submit = false;
		if(ping){
			ping.stdout.removeAllListeners();
			ping.kill();
		}
		_this.ping_result = "";
	}
	$scope.clear_config = function(){
		this.netIp = this.netMask = this.netGateway = this.netDNS = this.netDNS2 = undefined;
		this.net_err = '';
	};
	$scope.clear_ping_count = function(){
		this.ping_count = null;
	};

}])
.controller("settingSystemController", ["$scope","API", "$modal","$rootScope", function($scope,API,$modal,$rootScope){
	
	API.system.info(function(res){
		$scope.tableInfo = res.result;
	});
	API.system.screen_list(function(res){
		$scope.resolutions = res.result.support_resolution;
		$scope.resolution = res.result.current_resolution
	})
	$scope.sys_restart = function(){
		API.system.restart(function(){
		});
	};
	$scope.sys_update = function(){
		$scope.$root.$broadcast("closeSettingDialog", {_bool: true})
		$scope.isupdate = false; $scope.nofile = false; $scope.nospace = false;
		$modal.open({
			templateUrl : "./views/system_update.html",
			size : "md",
			backdrop : "static",
			keyboard : false,
			controller : function($scope,$modalInstance){
				$scope.update = function(){
					API.system.upgrate(function(res){
						$scope.isupdate = true;
						var code = res.code;
						switch(code){
							case 100 : $scope.nofile = true;//没有找到升级文件 
							     break;
							case 101 : $scope.nospace = true;//空间不够
								 break;
							case 0 : $scope.updating = true;
								break;
						}
					});
				};
				$scope.close = function(){
					$rootScope.$broadcast("close_modal");
					$modalInstance.close();
				};
			}
		});
	};
	$scope.resolutionOk = function(){
		var _this = this;
		var model_instance = $modal.open({
			template:"<section id='widget-grid'><div class=''><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title modal-title-sm' id='mySmallModalLabel' localize='设置分辨率'>"+
							"设置分辨率</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='SET_RESOLUTION'>设置分辨率将会重启，确定修改吗?</p><footer class='text-right'><button class='arm-btn arm-btn-sm arm-btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='arm-btn arm-btn-sm arm-btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			size: "sm",
			backdrop : "static",
			keyboard : false,
			controller: function($scope,$modalInstance){
				$scope.close = function(){
					$modalInstance.dismiss();
				};
				$scope.ok = function(){
					$modalInstance.close();
				};
			},
		});
		model_instance.result.then(function(res){
			API.system.screen_size({set_resolution : _this.resolution});
		})
	};
	// $scope.volumeOk = function(){
	// 	var postData = {
	// 		input : this.input_volume,
	// 		output : this.output_volume
	// 	};
	// 	API.system.volume(postData,function(res){

	// 	})
	// };
	
}])
.controller("teachingController", ["$scope", "API","shareData", "$location","waitBackdrop","$timeout","$interval","$rootScope" ,function($scope, API, shareData, $location, waitBackdrop,$timeout,$interval,$rootScope){

	$scope.mode = $$$mode;
	$scope.scens = [];
	$scope.err_mess ='';

	var _root = $rootScope;

	var refresh, timer;
	function teach_login(){
		var _scope = $scope;
		waitBackdrop.open({
			_ctrl: function($modalInstance){
				API.desktop.teaching.list(function(res){
					$modalInstance.close();
					store_list(res);
				},function(err){
					$modalInstance.close();
					_scope.scens = [];
					_scope.err_mess = err;
				});
			}
		});
	}
	function get_list(){
		var get_teaching_list = function(){
			API.desktop.teaching.get_teacher_vms(function(res){
				store_list(res);
			},function(err){
				$scope.scens = [];
				$scope.err_mess = err;
			});
		};
		refresh = $interval(get_teaching_list , 5000);
	}
	function store_list(p){
		var data = p.result;
		if(_root.lock_desk){
			$scope.scens = [];
			return;
		}
		if(data && data.vms.length){
			$scope.vms = data.vms;
			var _scens = data.modes.filter(function(s){
				return $scope.vms.some(function(v){
					return v.mode_id == s.id
				});
			});

			_scens.forEach(function(row){
				var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
				os && os.icon && (row.icon = os.icon);
			});

			$scope.scens.splice(0,$scope.scens.length);
			$scope.scens.push.apply($scope.scens,_scens);
			
			$scope.err_mess = '';

		}else if(data && data.vms.length === 0 ){
			$scope.scens.splice(0,$scope.scens.length);
			// 没有绑定桌面
			$scope.err_mess = $$$MSG.get(50011);
		}

	};

	$scope.$watch("scens" , function(newvalue){
		if(newvalue && newvalue.length && newvalue.length === 1){
			var _scen = $scope.scens[0];
			var _time = _root.wait_time;
			(_time > 0) && go_connect(_scen,_time);
		}else{
			$interval.cancel(timer);
			$scope.last_time = null;
		}
	},true);

	// 自动登录计时器
	function go_connect(desk,t){
		$scope.last_time = t;
		$interval.cancel(refresh);
		var interval = function(){
			timer = $interval(function(){
				if(--$scope.last_time <= 0){
					$scope.last_time = null;
					$interval.cancel(timer);
					$scope.connect(desk);
				}
			},1000);
		};
		interval();
	};

	$scope.connect = function(scen){
		_root.$broadcast("open_modal");
		var _scope = $scope;
		var vm = $scope.vms.filter(function(item){
			return item.mode_id == scen.id; 
		})[0];
		waitBackdrop.open({
			_ctrl: function($scope,$modalInstance){
				API.connect({vm_id: vm.id,display_name: vm.display_name},function(){
					$modalInstance.close();
				},function(err){
					$modalInstance.close();
					_scope.err_mess = err;
					get_list();
				});
			}
		});		
	};

	teach_login();
	get_list();

	$scope.$on("open_modal" , function(e){
		$interval.cancel(refresh);
		$interval.cancel(timer);
		$scope.last_time = null;
	});
	$scope.$on("close_modal" , function(e){
		get_list();
	});
	$scope.$on("loop_data", function(e,res){
		if(res.relogin){
			get_list();
		}
	});
	$scope.goback = function(){
		$location.url("/home");
		$interval.cancel(timer);
		$interval.cancel(refresh);
		$scope.last_time = null;
	};

	
	
}])
.controller("personalController", ["$scope", "API", "shareData","$location","waitBackdrop","$rootScope","$interval","$timeout", function($scope, api,shareData,$location,waitBackdrop,$rootScope,$interval,$timeout){

	var _root = $rootScope;
	var _loginMess = shareData.loginMess;
	var _refreshTimer = null;
	var _autoLogintimer = null;
	$scope.vms = [];

	function refresh_list(){
		api.desktop.personal.login(_loginMess,function(res){
			var _vms = res.result.vms;
			_vms.forEach(function(row){
				var os = $$$os_types.filter(function(item){ return item.key === row.image.os_type })[0];
				os && os.icon && (row.image.icon = os.icon);
			});
			$scope.vms.splice(0,$scope.vms.length);
			[].push.apply($scope.vms,_vms);
			_refreshTimer = $timeout(function(){
				refresh_list();
			}, 5000);
		},function(err){
			$scope.err_mess = err;
		});
	}

	function go_autologin_timer(desk,t){
		$scope.last_time = t;
		var interval = function(){
			_autoLogintimer = $interval(function(){
				if(--$scope.last_time <= 0){
					$scope.connect(desk);
				}
			},1000);
		};
		interval();
	}

	function clearTimer(){
		$scope.last_time = null;
		$interval.cancel(_autoLogintimer);
	}

	$scope.$on("open_modal" , function(e){
		clearTimer();
	});

	$scope.goback = function(){
		$location.url("/login?type=2");
		$timeout.cancel(_refreshTimer);
		clearTimer();  
	};

	$scope.connect = function(vm){
		var _scope = $scope;
		clearTimer();
		waitBackdrop.open({
			_ctrl: function($modalInstance){ 
				api.connect({vm_id: vm.id},function(){
					$modalInstance.close();
					_scope.err_mess = '';
					$timeout(function(){
						$scope.goback();
					},3000);
				},function(err){
					refresh_list();
					$modalInstance.close();
					_scope.err_mess = err;
				});
			}
		});
	};

	$scope.$watch('vms',function(newvalue){
		if(newvalue && newvalue.length && newvalue.length === 1){
			var _vm = $scope.vms[0];
			var _time =  _root.wait_time;
			(_time > 0) && go_autologin_timer(_vm, _time);
		}else{
			clearTimer();
		}
	},true);

	refresh_list();
}])
.controller("resetpasswordController", ["$scope","API","$location", function($scope,API,$location){

	$scope.user = $location.$$search.user;
	var checkValid = function(){
		if($scope.resetPasswordForm.$valid){
			if($scope.new_pwd === $scope.repeat_pwd){
				return true;
			}else{
				$scope.err_mess = $$$I18N.get("两次输入密码不一致");
				return false;
			}
		}else{
			$scope.err_mess = $$$I18N.get("格式不正确");
			return false;
		}
	};
	$scope.alterPassword = function(){
		var valid = checkValid();
		if(valid){
			API.desktop.personal.passwd({
				user_name:$scope.user || '',
				old_pwd:$scope.old_pwd || '',
				new_pwd:$scope.new_pwd || ''
			},function(){
				$scope.err_mess = $$$I18N.get("密码修改成功");
				setTimeout(function(){
					location.replace("#/login");
				},500)
			},function(err){
				$scope.err_mess = err;
			});
		}
	};
}])
.controller("personalloginController", ["$scope","API","shareData","waitBackdrop","$location",function($scope,API,shareData,waitBackdrop,$location){


	$scope.mode = $$$mode;
	var page_type = Number($location.$$search.type);

	API.desktop.personal.get_config(function(res){
		$scope.is_auto = res.result.auto_login;
		$scope.is_remenber = res.result.save_pwd;

		if($scope.is_remenber){
			$scope.username = res.result.username;
			$scope.password = res.result.password;
		}
		if($scope.is_auto && page_type === 1){
			login();
		}
	},function(err){
		$scope.err_mess = err;
	});
	$scope.$watch("is_auto",function(newval){
		if(newval){
			$scope.is_remenber = 1;
		}
	});
	$scope.$watch("is_remenber",function(newval){
		if(!newval){
			$scope.is_auto = 0;
		}
	});

	$scope.saveLogin = function(){
		var isValid = $scope.loginForm.$valid;
		if(isValid){
			login();
		}else if(!$scope.username || !$scope.password){
			$scope.err_mess = $$$I18N.get("用户名或密码不能为空");
		}
	};
	function login(){
		var postData = {
			auto_login: $scope.is_auto || "",
			save_pwd: $scope.is_remenber || "",
			username: $scope.username || "",
			password: $scope.password || ""
		};
		waitBackdrop.open({
			_ctrl: function($modalInstance){
				API.desktop.personal.login(postData,function(res){
					$modalInstance.close();
					shareData.loginMess = postData;
					location.replace("#/personal");
				},function(err){
					$modalInstance.close();
					$scope.err_mess = err;
				});
			}
		});
	}
}])
