(function(){"use strict";
angular.module("vdi.dialogs", [])
.controller("newSceneDialog", [
"$scope", "$modalInstance",
"Host", "Scene", "SchoolRoom", "Network", "TeachTemplate", "HardwareTemplate","TeachDesktop","Server",
function($scope, $modalInstance, host, scene, schoolroom, net, teach, hardwares,list,server){
	var row_has_ha = false;
	/*  user */
	$scope.monthlists = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
	$scope.weeklists = [1, 2, 3, 4, 5, 6, 7];
	$scope.host_loading = true;
    $scope.insMax = 0;
    $scope.RDP = false;
    $scope.has_usb = false;
    $scope.has_domain = false;
    $scope.domain = null;
    $scope.has_ha = false;
    $scope.agents = [];
    $scope.diskmode = 'raw';
    $scope.data_rollback = 'false';

    var getMaxInstatnce = function(){
		var pool = $scope.pool_ips.filter(function(p){
				return p._selected;
			});
		var maxInstance = 0;
		if(pool && pool.length){
			pool.forEach(function(p){
				maxInstance += p.max_instance; 
			});
			$scope.notiMess = "1 ~" + maxInstance;
			$scope.insMax = maxInstance;
		}else{
			$scope.notiMess = $$$I18N.get("请先选择宿主机");
			$scope.insMax = 0;
		}
	};
	$scope.rollbackChange = function(scope){
		if(scope.rollback != 1){
			scope.has_ha = false;
		}else{
			$scope.agents&&$scope.agents.map(function(agent){
				if(agent._selected){
					scope.has_ha = true;
				}
			});
		}
	};


	host.query(function(data){

		$scope.host_loading = false;
		$scope.pool_ips= angular.copy(data.hosts_list).filter(function(item) {
			return item.status===true;
		}).map(function(item,idx){
			item._selected = false;
			return item;
		});
		$scope.agents = angular.copy(data.hosts_list).map(function(item){
			item._selected = false;
			return item;
		}).filter(function(item){
			return item.status === true && item.is_console === false;
		});
		getMaxInstatnce();
	});
	schoolroom.query(function(res){
		var schoolrooms = [];
		res.pools_.forEach(function(item){
			JSON.parse(localStorage.loginInfo).pool.forEach(function(pool){
				if(item.id === pool){
					schoolrooms.push(item)
				}
			})
		})
		$scope.pools = schoolrooms;
		$scope.pool = $scope.pools[0];
	});
	net.query(function(res){
	  	res.networks.map(function(n){
		  	n.desc = n.dhcp == false ? n.name:(n.name + "(" + n.cidr + ")");
		})
		$scope.networks = res.networks;
		$scope.network = $scope.networks[0];
	});
	hardwares.query(function(data){
		$scope.hardwareList = data.hardwareList.map(function(data){
			data.memory_mb = data.memory_mb/1024;
			return data;
		});
		$scope.hardware = $scope.hardwareList[0];
	})
	teach.query(function(data){
		$scope.winTable = data.win_images
			.filter(function(item){ return item.status == "alive" });
		$scope.linTable = data.linux_images
			.filter(function(item){ return item.status == "alive" });
		$scope.otherTable = data.other_images
			.filter(function(item){ return item.status == "alive" });
		$scope.image = $scope.winTable[0];
	});
	server.query(function(data){
		$scope.domains = data.servers;
	});

	
	$scope.hostNameType = 1;
	$scope.hostNamePre = "PC";
	$scope.hostNameBegin = 1;
	$scope.userNameType = 1;
	$scope.userNamePre = "K";
	$scope.userNameBegin = 1;

	$scope.clearRDP = function(scope){
		scope.RDP = false;
		$scope.userNameType = 1;
		$scope.userNamePre = "K";
		$scope.userNameBegin = 1;
	};
	$scope.clearDomain = function(scope){
		if(scope.has_domain){
			scope.domain = $scope.domains[0];
		}else{
			scope.domain = null;
		}
	};
	$scope.clearHA = function(scope){
		scope.agents.map(function(a){
			a._selected = false;
			return a;
		});
	}
	$scope.addZero = function(len,str_begin,str_end){
		if(str_end && str_begin){
			var end_len = str_end.toString().length;
			if(end_len < len){
				return  str_begin + new Array(len - end_len+1).join("0") + str_end;
			}else{
				return str_begin + str_end;
			}
		}
	};
	$scope.poolName = function(p){
		if(p.dhcp){
			return p.name + " ( " + p.dhcp_start + " - " +p.dhcp_end+ " ) ";
		}else{
			return p.name;
		}
	};
	$scope.checkAll = function(scope){
		if(scope._ischeckAll){
			$scope.pool_ips.map(function(pool){
				return pool._selected = true;
			})
		}else{
			$scope.pool_ips.map(function(pool){
				return pool._selected = false;
			});
		}
		scope.desktopNum = null;
		getMaxInstatnce();
	};
	$scope.checkOne = function(scope){
		var pool_ips = $scope.pool_ips.filter(function(p){ 
			return p._selected;
		});
		if(pool_ips.length === $scope.pool_ips.length){
			scope._ischeckAll = true;
		}else{
			scope._ischeckAll = false;
		}
		scope.desktopNum = null;
		getMaxInstatnce();
	};
	
	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.$on("hard",function(e,mess){
		$scope.hardware = mess;
	});

	$scope.$on("WizardStep_0", function(e, step, scope){
		var has_pool = $scope.pool_ips.filter(function(p){ return p._selected}).length ? true : false;
		scope.error = step.is_dirty;
		var checkName = function(){
			return $scope.allRows.some(function(row){
				return row.name === scope.sceneName;
			});
		};
		if(checkName()){
			$.bigBox({
				title:"",
				content:$$$MSG.get(14036),
				timeout:5000
			});
		}
		step.done = scope.bodyForm1.$valid && has_pool && !checkName();
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm2.$valid;
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm3.$valid;
		if(scope.has_ha){
			scope.server_select = scope.agents.filter(function(p){
				return p._selected;
			});
			if(scope.server_select.length<1){
				step.done = false;
			}
		}
	});
	$scope.$on("WizardStep_3", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm4.$valid;
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var _rollback = parseInt(scopes[2].rollback);
		var _data_rollback = scopes[2].hardware.local_gb ? parseInt(scopes[2].data_rollback) : null;
		var pool_ips = $scope.pool_ips.filter(function(p){ 
			return p._selected;
		});
		var postData = {
			hosts                 : pool_ips.length === $scope.pool_ips.length ? -1 : pool_ips.map(function(item){return item.id;}),
			network               : scopes[0].pool.network_id,
			domain                : scopes[0].domain && scopes[0].domain.id,
			has_domain            : scopes[0].has_domain,
			pool                  : scopes[0].pool.id,
			name                  : scopes[0].sceneName,
			instance_max          : scopes[0].desktopNum,

			image                 : scopes[1].image.id,

			instance_type         : scopes[2].hardware.id,
			has_usb               : scopes[2].has_usb,
			need_ha               : scopes[2].rollback == 1 && scopes[2].has_ha,
			server_ids 		      : scopes[2].rollback == 1 ? (scopes[2].has_ha && scopes[2].server_select.map(function(value){return value.id;}).join(',')):"",
			disk_type             : scopes[2].hardware.local_gb ? scopes[2].diskmode : undefined,
			
			hostname_type         : parseInt(scopes[3].hostNameType),
			hostname_prefix       : scopes[3].hostNamePre,
			hostname_beginwith    : scopes[3].hostNameBegin,
			is_exam               : scopes[3].RDP,
			username_type         : scopes[3].MORE ? parseInt(scopes[3].userNameType) : null,
			username_prefix       : scopes[3].MORE ? scopes[3].userNamePre : null,
			username_beginwith    : scopes[3].MORE ? scopes[3].userNameBegin : null,

			rollback              : _rollback,
			rollback_monthday     : _rollback === 3 ? scopes[2].rollback_monthday : undefined,
			rollback_weekday      : _rollback === 2 ? scopes[2].rollback_weekday : undefined,
			data_rollback         : _data_rollback,
			data_rollback_weekday : _data_rollback === 2 ? scopes[2].data_rollback_weekday : undefined,
			data_rollback_monthday: _data_rollback === 3 ? scopes[2].data_rollback_monthday : undefined
		};
		$modalInstance.close();
		scene.save(postData,
		function(data){
			// scope原型链上的刷新数据方法
			$scope.refresh();
		})
	});
}])
.controller("alterSceneDialog", ["$scope", "$modalInstance", "SchoolRoom", "Scene","Host","Server", function($scope, $modalInstance, schoolroom, scene,host,server){
	$scope.need_ha = false;
	var selectedServer,raw_need_ha;
	$scope.rollbackChange = function(value){
		if(value != "1"){
			$scope.need_ha = false;
			/*$scope.servers.map(function(server){
				server._selected = false;
				return server;
			});*/
		}else{
			if(selectedServer&&selectedServer.length>0){
				$scope.need_ha = angular.copy(raw_need_ha);
				$scope.servers = selectedServer;
			}
		}
	};
	host.query(function(data){
		var servers = [];
		$scope.host = data.hosts_list;
		$scope.max_instances = $scope.host.reduce(function(count,item){
			return count + item.max_instance;
		},0) ;

		$scope.servers = angular.copy(data.hosts_list).map(function(item){
			item._selected = false;
			return item;
		}).filter(function(item){
			return item.status === true && item.is_console === false;
		});

		scene.haConfig({id:$scope.currentItem.id},function(response){
			var data = response.result;
			if(data&&data.servers.length>0){
				$scope.need_ha = true;
				raw_need_ha = true;
				if($scope.servers){
					$scope.servers.map(function(value,index){
						data.servers.forEach(function(value2){
							if(value2.id == value.id){
								value._selected = true;
								$scope.servers[index] = value;
							}
						});
					});
					selectedServer = angular.copy($scope.servers);
				}
			}
		});
	})

	$scope.name = $scope.currentItem.name;
	$scope.desktopNum = $scope.currentItem.instance_max ;
	$scope.min_instances = $scope.currentItem.instance_max;
	$scope.rollback = $scope.currentItem.rollback;
	$scope.rollback_monthday = $scope.currentItem.rollback_monthday ? $scope.currentItem.rollback_monthday : "1";
	$scope.rollback_weekday = $scope.currentItem.rollback_weekday ? $scope.currentItem.rollback_weekday :"1";

	$scope.disk_type = $scope.currentItem.disk_type;
	$scope.data_rollback = $scope.currentItem.data_rollback;
	$scope.data_rollback_monthday = $scope.currentItem.data_rollback_monthday || "1";
	$scope.data_rollback_weekday = $scope.currentItem.data_rollback_weekday || "1";

	$scope.usb_redir = $scope.currentItem.usb_redir;
	$scope.running_count = $scope.currentItem.running_count;
	$scope.has_domain=$scope.currentItem.has_domain||false;
	$scope.domain = $scope.currentItem.domain;
	$scope.need_ha = false;

	server.query(function(data){
		$scope.domains=data.servers;
		$scope.domain=$scope.domains[0];
	},function(){
		
	});



	/*scene.get({id:$scope.currentItem.id},function(response){
		console.log(response);
	});*/

	$scope.ok = function(){
		
		var _rollback = parseInt(this.rollback);
		var _data_rollback = parseInt(this.data_rollback) >= 0 ? Number(this.data_rollback) : null;
		var item = {};
		//item.schoolroom = this.schoolroom.name;
		item.id = $scope.currentItem.id;
		item.pool = $scope.currentItem.pool;
		item.name = this.name;
		//item.network = this.schoolroom.network_id;
		item.instance_max          = $scope.currentItem.instance_max;
		item.rollback              = _rollback;
		item.rollback_monthday 	   = _rollback == 3 ? this.rollback_monthday : undefined;
		item.rollback_weekday      = _rollback == 2 ? this.rollback_weekday : undefined;
		item.data_rollback         = _data_rollback;
		item.data_rollback_monthday= _data_rollback === 3 ? this.data_rollback_monthday : undefined;
		item.data_rollback_weekday = _data_rollback === 2 ? this.data_rollback_weekday : undefined;
		item.usb_redir             = this.usb_redir;
		item.has_domain            = this.has_domain;
		item.domain                = this.domain;
		item.need_ha               = item.rollback==1 && this.need_ha;
		if(item.rollback ==1 && item.need_ha){
			item.server_ids = $scope.servers.filter(function(value){
				return value._selected;
			}).map(function(value){
				return value.id;
			});
			if(item.server_ids<1){
				return false;
			}
			item.server_ids = item.server_ids.join(',');
		}
		$modalInstance.close();
		scene.update(item, function(){
			$scope.refresh();
		},function(){
			$scope.refresh();
		});	
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("newPersonDialog", ["$scope", "$modalInstance", "Host","Network", "HardwareTemplate","PersonTemplate","User","Admin","Domain","PersonDesktop","Server",function($scope, $modalInstance, host, networks, hardwares, images,user,admin, domain,Person,server){
	$scope.desktopNum = 1;
	$scope.max_instance = 0;
	$scope.host_loading = true;

	host.query(function(data){
		$scope.host_loading = false;
		$scope.pool_ips = data.hosts_list.filter(function(item) {
			return item.status===true;
		});
		$scope.max_instance = $scope.pool_ips.reduce(function(count,p){
			return count + p.max_instance;
		},0);
	});
	networks.query(function(data){
	  	data.networks.map(function(n){
		  n.desc = n.dhcp == false ? n.name : (n.name + " (" + n.dhcp_start +" - "+ n.dhcp_end + ") ");

		})
		$scope.networks = data.networks;
		$scope.network = data.networks[0];
	});
	hardwares.query(function(data){
		$scope.hardwareList = data.hardwareList.map(function(data){
			data.memory_mb = data.memory_mb/1024;
			return data;
		});
		$scope.hardware = $scope.hardwareList[0];
	});

	/** user info **/
	server.query(function(data){
		$scope.domains = data.servers;
	});
	
	images.query(function(data){
		$scope.winTable = data.win_images
			.filter(function(item){ return item.status === "alive" })

		$scope.linTable = data.linux_images
			.filter(function(item){ return item.status === "alive" })
		$scope.otherTable = data.other_images
			.filter(function(item){ return item.status === "alive" })
		$scope.winTable.length && ($scope.image_id = $scope.winTable[0].id);
	});

	$scope.rule = 1;
	$scope.ip_choose =true;
	$scope.usb_redir = false;
	$scope.has_domain = false;
	$scope.diskmode = "raw";

	$scope.clearBindIP = function(scope){
		if(scope.network.dhcp){
			if(scope.is_bind){
				scope.bindRule = 1;
			}else{
				scope.bindRule = null;
				scope.start_ip = null;
			}
		}else{
			scope.is_bind = false;
			scope.bindRule = null;
			scope.start_ip = null;
		}
	};
	$scope.clearDomain = function(scope){
		if(scope.has_domain){
			scope.domain = $scope.domains[0];
		}else{
			scope.domain = null;
		}
	};
	$scope.getMaxInstance = function(scope){
		if(scope.pool_ip){
			$scope.max_instance = scope.pool_ip.max_instance;
		}else{
			$scope.max_instance = $scope.pool_ips.reduce(function(count,p){
				return count + p.max_instance;
			},0);
		}
	};

	$scope.$on("WizardStep_0", function(e, step, scope){
		scope.error = step.is_dirty;
		var checkName = function(){
			return $scope.allRows.some(function(row){
				return row.display_name === scope.desktopName;
			});
		};
		function check_net(){
			if(scope.network.netmask && scope.network.dhcp && scope.start_ip){
				var _mask = scope.network.netmask.split(".");
				var _startIP = scope.network.dhcp_start.split(".");
				var _bindStartIP = scope.start_ip.split(".");
				var isValid = _mask.map(function(seg,idx){
					return (_startIP[idx] & seg) === (_bindStartIP[idx] & seg);
				}).some(function(item){
					return item === false;
				});
				return isValid;
			}
			return false;

		}
		if(checkName()){
			$.bigBox({
				title:"",
				content:$$$MSG.get(14019),
				timeout:5000
			});
		}
		if(check_net()){
			$.bigBox({
				title:"",
				content:$$$MSG.get(12061),
				timeout:5000
			});
		}
		step.done = scope.bodyForm1.$valid && !checkName() && !check_net();
		$scope.select_users=[];
		if(scope.has_domain){
			if(scope.domain&&scope.domain.id>-1){
				domain.query({id:scope.domain.id},function(domain_res){
					$scope._users={"domain":domain_res.users};
				});
			}
		}else{
			user.query(function(user_res){
				$scope._users={"common":user_res.users};
				admin.query(function(admin_res){
					$scope._users.manager=admin_res.users;
				});
				
			});
		}
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm2.$valid;
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.bodyForm3.$valid;
	});
	$scope.$on("WizardStep_3", function(e, step, scope){
		scope.error = step.is_dirty;
		step.done = scope.select_users.length?true:false;
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var postData = {
			count        :scopes[0].desktopNum,
			display_name :scopes[0].desktopName,
			network      :scopes[0].network.id,
			inst_host    :scopes[0].pool_ip ? scopes[0].pool_ip.id :-1,

			image_id     :scopes[1].image_id,

			vcpu         :scopes[2].hardware.cpu_num,
			local_gb     :scopes[2].hardware.local_gb,
			memory_mb    :scopes[2].hardware.memory_mb*1024,
			usb_redir    :scopes[2].usb_redir,
			disk_type    :scopes[2].hardware.local_gb ? scopes[2].diskmode :undefined,
			
			driver_type  :"qcow2",
			user_id      :scopes[3].select_users.map(function(item){return item.id;}),
			rule_id      :scopes[3].rule
		};
		if(scopes[0].domain&&scopes[0].domain.id){
			postData['ad_server_id']=scopes[0].domain.id;
		}
		if(scopes[0].network.dhcp && scopes[0].is_bind){
			postData["ip_choose"] = Number(scopes[0].bindRule) === 1 ? true : false;
		};
		if (scopes[0].network.dhcp && scopes[0].is_bind && postData.ip_choose===false){ 
			postData["start_ip"] = scopes[0].start_ip;
		};

		$modalInstance.close();
		Person.save(postData, function(res){
			$scope.refresh();
		});
	});
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("alterPersonalDialog", ["$scope","$modalInstance","Network","HardwareTemplate","User","Admin" ,"PersonDesktop","Domain",function($scope, $modalInstance,net,hardwrare,user,admin,personDesktop,domain){
	$scope.IPs = [];
	net.query(function(res){
		$scope.networks = res.networks;
		$scope.network = $scope.currentItem.network;
		$scope.ip_able = true ;
		$scope.$watch("network",function(newvalue){
			if(newvalue && newvalue.cidr && newvalue.dhcp){
				$scope.ip_able = true;
				net.get({id:newvalue.id},function(res){
					$scope.IPs = res.data.filter(function(item){
						return item.has_used === false || item.address === $scope.currentItem.ips;
					}).map(function(item){
						return item.address;
					});
				});
			}else{
				$scope.IP ="";
				$scope.ip_able = false;
			}
		},true)

	});
	if($scope.currentItem&&$scope.currentItem.ad_server){
		domain.query({id:$scope.currentItem.ad_server},function(domain_res){
			$scope.users=domain_res.users;
			$scope.users.forEach(function(item){
				if(item.name == $scope.currentItem.user){
					$scope.user = item;
				};
			});
		});
	}else{
		admin.query(function(admin_res){
			user.query(function(user_res){
				$scope.users = admin_res.users.concat(user_res.users);	

				$scope.users.forEach(function(item){
					if(item.name == $scope.currentItem.user){
						$scope.user = item;
					};
				});
			});
		});
	}

	$scope.IP = $scope.currentItem.ips ? $scope.currentItem.ips : -1;
	$scope.display_name = $scope.currentItem.display_name;
	$scope.cpu_num = $scope.currentItem.vcpu;
	$scope.memory_mb = $scope.currentItem.memory_mb/1024;
	$scope.local_gb = $scope.currentItem.local_gb;
	$scope.diskmode = "raw";
	$scope.min_local_gbs = $scope.local_gb;
	$scope.usb_redir = $scope.currentItem.usb_redir;
	$scope.need_ha = $scope.currentItem.need_ha;

	$scope.name = function(net){
		var is_dhcp = net.dhcp;
		if(is_dhcp){
			return net.name + " ( " + net.dhcp_start + " - " + net.dhcp_end + " ) ";
		}else{
			return net.name;
		}
	}
	$scope.ok = function(){
		$modalInstance.close();
		var item ={};
		item.id = $scope.currentItem.id;
		item.display_name = this.display_name;
		item.user_id= this.user.id;
		item.vcpu = this.cpu_num;
		item.local_gb = this.local_gb;
		item.disk_type = this.local_gb ? this.diskmode : undefined;
		item.memory_mb = this.memory_mb*1024;
		item.network_id = this.network.id;
		item.need_ha = this.need_ha;
		item.usb_redir = this.usb_redir;
		item.ip = this.IP?this.IP:-1;
		personDesktop.update(item,function(res){
			$scope.refresh();
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};

}])

// .controller("dynamicMigrationPersonalDialog",["$scope", "$modalInstance","Host", "PersonDesktop", function($scope, $modalInstance,host,personDesktop){
// 	$scope.loading = true;
// 	host.query(function(res){
// 		$scope.loading = false;
// 		$scope.hosts = res.hosts_list.filter(function(item) {
// 			return item.ip === $scope.currentItem.pool_ip ? "" : item;
// 		});
// 		$scope.host = $scope.hosts[0];
// 	});


// 	$scope.selectTemplate = function(item){
// 		$scope.template = item;
// 	};
// 	$scope.post = function(){
// 		$scope.submiting = true;
// 		personDesktop.migrate({dest_host:this.host.ip,id:$scope.currentItem.id},function(res){
// 			$scope.submiting = false;
// 			$modalInstance.close();
// 		},function(res){

// 		});
		
// 	};
// 	$scope.close = function(){
// 		$modalInstance.close();
// 	};

// }])
.controller("snapshotPersonalDialog", ["$scope", "$modalInstance", "PersonDesktop", "VMCommon",function($scope, $modalInstance, personDesktop, vm){
	$scope.rows = [];
	vm.list_snapshot({ instance_id: $scope.currentItem.instance_id },function(res){
		$scope.rows = res.snapshots.map(function(item,index){
			item.status = false;
			return item;
		});
	});
	
	$scope.selectTemplate = function(item){
		$scope.template = item;
	};

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.save =function(index){
		$scope.rows[index].status = false;
		if(this.item.display_description){
			$modalInstance.close();
			vm.take_snapshot({
				method:"save",
				instance_id:$scope.currentItem.instance_id, 
				name:this.item.display_description
			},function(res){},function(res){
				$scope.rows.splice(index,1);
			});
		}else{
			$.bigBox({
				title :$$$I18N.get("操作结果"),
				content : $$$I18N.get("请输入合法数据"),
				color : "#C46A69",
				icon : "fa fa-warning shake animated",
				timeout : 6000
			});
		}		
	}

	$scope.addNew = function(){
		$scope.rows.unshift({"status":true});
	};

	$scope.delete = function(item){
		$modalInstance.close();
		vm.delete_snapshot({
			snapshot_id:this.item.name,
			instance_id:$scope.currentItem.instance_id
		},function(res){
			var idx = $scope.rows.indexOf(item);
			$scope.rows.splice(idx,1); 
		});	
	};
	$scope.restore =function(){
		$modalInstance.close();
		vm.restore_snapshot({
			method:"restore",
			snapshot_id:this.item.name,
			instance_id:$scope.currentItem.instance_id
		},function(res){
		})
	}
}])
.controller("saveTemplatePersonalDialog", ["$scope", "$modalInstance", "Admin", "PersonDesktop","HardwareTemplate", function($scope, $modalInstance, admin, personDesktop,hardwares){
	admin.query(function(res){
		$scope.owners = res.users;
		$scope.owner = $scope.owners[0];
	});
	$scope.classifys = $$$os_types;

	hardwares.query(function(data){
		$scope.hardwareList = data.hardwareList.map(function(data){
			data.memory_mb = data.memory_mb/1024;
			return data;
		});
		$scope.hardware = $scope.hardwareList[0];
	})

	$scope.classify = $scope.classifys.filter(function(os){
		return os.key === $scope.currentItem.os_type;
	})[0] || $scope.classifys[0];


	$scope.ok = function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
		if(this.saveTemplate.$valid){
			var postData = {
				instance_id: $scope.currentItem.instance_id,
				//os_type: $scope.classify.key,
				os_type: $scope.currentItem.os_type,
				name: this.name,
				type_code: this.type, //1 | 2, //1为教学 2为个人
				owner: $scope.owner.id,
				machine_type:this.type=='1' ? this.hardware.id : undefined
			};
			personDesktop.saveAsTemplate(postData, function(res){
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				$modalInstance.close();
				
			},function(){
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
		}
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("registerTeachTemplateDialog", ["$scope", "$modalInstance", "Admin", "registerTemplate", "TeachTemplate", function($scope, $modalInstance, admin, registerTemplate, teach){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.type = '1';
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name == JSON.parse(localStorage.loginInfo).name)
				$scope.owner = item;
		})
	});
	registerTemplate.query(function(res){
		console.log(res.result)
		$scope.templs = res.result;
		// $scope.templ = res.result[0];
	})
	$scope.os_types = $$$os_types;
	$scope.os_type = $scope.os_types[0];

	$scope.ok = function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
			var postData = {
				file_name: this.templ,
				name: this.name,
				type_code: this.type,
				os: this.os_type.value,
				is_64: this.os_type.value.indexOf("64 bit")>-1?true: false,
				owner: this.owner.id
			};
			console.log(postData)
			registerTemplate.update(postData, function(res){
				console.log(res)
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				$modalInstance.close();
				teach.query(function(res){
					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
					newRows.forEach(function(row){
						var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
						os && os.icon && (row.icon = os.icon);
					});
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,newRows);
				});
				
			},function(){
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("registerPersonalTemplateDialog", ["$scope", "$modalInstance", "Admin", "registerTemplate", "PersonTemplate", function($scope, $modalInstance, admin, registerTemplate, personal){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.type = '2';
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name == JSON.parse(localStorage.loginInfo).name)
				$scope.owner = item;
		})
	});
	registerTemplate.query(function(res){
		console.log(res.result)
		$scope.templs = res.result;
		// $scope.templ = res.result[0];
	})
	$scope.os_types = $$$os_types;
	$scope.os_type = $scope.os_types[0];

	$scope.ok = function(){
		$scope.submiting = true ;
		$scope.afterSubmiting =false ;
			var postData = {
				file_name: this.templ,
				name: this.name,
				type_code: this.type,
				os: this.os_type.value,
				is_64: this.os_type.value.indexOf("64 bit")>-1?true: false,
				owner: this.owner.id
			};
			console.log(postData)
			registerTemplate.update(postData, function(res){
				console.log(res)
				$scope.submiting = false ;
				$scope.afterSubmiting = true ;
				$modalInstance.close();
				personal.query(function(res){
					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
					newRows.forEach(function(row){
						var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
						os && os.icon && (row.icon = os.icon);
					});
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,newRows);
				});
				
			},function(){
				$scope.submiting = false ;
				$scope.afterSubmiting = false ;
			});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("addTeachTemplateDialog", [
"$scope", "$modalInstance", "TeachTemplate", "HardwareTemplate", "SystemISO", "Admin",
function($scope, $modalInstance, teach, hardware, iso, admin){


	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.auto_isos = [];$scope.all_isos = [];
	$scope.iso = [];$scope.$parent.userName = "Administrator";
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name == JSON.parse(localStorage.loginInfo).name)
				$scope.owner = item;
		})
		if(!$scope.owner) $scope.owner = $scope.users[0]
	});
	hardware.query(function(res){
		$scope.hardware_templates = res.hardwareList;
		$scope.template = $scope.hardware_templates[0];
	});
	iso.query(function(res){
		console.log(77777777,res)
		$scope.all_isos = res.isos.filter(function(iso){ return iso.os_type; });
		
		$scope.all_isos.forEach(function(item){
			item.os_type = item.os_type.split(",");
		});
		$scope.isos = $scope.all_isos;
		$scope.iso = [$scope.isos[0]];
		angular.forEach($scope.isos, function(item){
			if(item.support_auto_install == true)
				$scope.auto_isos.push(item);
		})
	});
	$scope.names = $scope.rows.map(function(item){ return item.name });
	$scope.sameName = false;
	var _scope = $scope;
	$scope.install = "manualinstall";
	$scope.$on("WizardStep_0", function(e, step, scope){
		scope.error = step.is_dirty;
		var flag = false;
		_scope.names.forEach(function(item){
			if(scope.name == item){ flag = true; }
		})
		if(flag){ _scope.sameName = true; }
		else { _scope.sameName = false; }
		step.done = !scope.step_pane0.$invalid && !_scope.sameName;
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		scope.error = step.is_dirty;
		if(scope.template.system_gb == 0)
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("模板系统盘不能为0"),
				timeout : 6000
			});
		step.done = !(scope.template.system_gb == 0);
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		_scope.install = scope.install;
		if(scope.iso != undefined && scope.iso[0] != undefined){
			_scope.system_version = scope.iso[0].os_type[0];
		}
		scope.error = step.is_dirty;
		step.done = (scope.iso != undefined && scope.iso[0] != undefined);
		
	});
	$scope.$on("WizardStep_3", function(e, step, scope){

		if(_scope.install == "autoinstall"){
			if(scope.step_pane3.$invalid || scope.system_version==undefined){
				scope.error = step.is_dirty;
				step.done = false;
			}
			else
				step.done = true;
		}
		else{
			step.done = true;
		}	
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var auto_install = scopes[2].install === "autoinstall" ? true : false;
		var item = {
			template_name: scopes[0].name,
			owner: scopes[0].owner.id,
			type_code : 1,
			vcpus: scopes[1].template.cpu_num,
			system_gb: scopes[1].template.system_gb,
			local_gb: scopes[1].template.local_gb,
			memory_mb: scopes[1].template.memory_mb,
			iso_path:scopes[2].iso[0].name,
			iso_id:scopes[2].iso[0].id,
			os_type: auto_install ? scopes[3].system_version : scopes[2].iso[0].os_type[0],
			auto_install: auto_install,
			key:scopes[3].key,
			username:scopes[3].userName,
			userPassword:scopes[3].userPassword,
			instance_type: scopes[1].template.id,

		};
		$modalInstance.close();
		teach.save(item,function(res){
			console.log(4444444444444,item)
			teach.query(function(res){
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
				newRows.forEach(function(row){
					var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
					os && os.icon && (row.icon = os.icon);
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows,newRows);
				if(!auto_install){
					var template = $scope.rows.filter(function(temp){ return temp.name ==  item.template_name})[0];
					window.open('templateModifybt.html#' + template.id + '&' + template.os_type,'_new','location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no');
				}
			});
		});
	});

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.cpu_num = 1;
}])
.controller("addPersonalTemplateDialog", [
"$scope", "$modalInstance", "PersonTemplate", "HardwareTemplate", "SystemISO", "Admin",
function($scope, $modalInstance, personal, hardware, iso, admin){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.auto_isos = [];$scope.all_isos = [];
	$scope.iso = [];$scope.$parent.userName = "Administrator";
	admin.query(function(res){
		$scope.users = res.users;
		angular.forEach($scope.users, function(item){
			if(item.name == JSON.parse(localStorage.loginInfo).name)
				$scope.owner = item;
		});
	});
	hardware.query(function(res){
		$scope.hardware_templates = res.hardwareList;
		$scope.template = $scope.hardware_templates[0];
	});
	iso.query(function(res){
		$scope.all_isos = res.isos.filter(function(iso){ return iso.os_type; });
		$scope.all_isos.forEach(function(item){
			item.os_type = item.os_type.split(",");
		});
		$scope.isos = $scope.all_isos;
		$scope.iso = [$scope.isos[0]];
		angular.forEach($scope.isos, function(item){
			if(item.support_auto_install == true)
				$scope.auto_isos.push(item);
		})
	});
	$scope.names = $scope.rows.map(function(item){ return item.name });
	$scope.sameName = false;
	var _scope = $scope;
	$scope.install = "manualinstall";
	$scope.$on("WizardStep_0", function(e, step, scope){
		scope.error = step.is_dirty;
		var flag = false;
		_scope.names.forEach(function(item){
			if(scope.name == item){ flag = true; }
		})
		if(flag){ _scope.sameName = true; }
		else { _scope.sameName = false; }
		step.done = !scope.step_pane0.$invalid && !_scope.sameName;
	});
	$scope.$on("WizardStep_1", function(e, step, scope){
		if(scope.template.system_gb == 0)
			$.bigBox({
					title : "错误提示",
					content : "模板系统盘为0",
					color : "#C46A69",
					icon : "fa fa-warning shake animated",
					timeout : 6000
				});
		step.done = !(scope.template.system_gb == 0);
	});
	$scope.$on("WizardStep_2", function(e, step, scope){
		_scope.install = scope.install;
		if(scope.iso != undefined && scope.iso[0] != undefined){
			_scope.system_version = scope.iso[0].os_type[0];
		}
		scope.error = step.is_dirty;
		step.done = (scope.iso != undefined && scope.iso[0] != undefined);
		
	});
	$scope.$on("WizardStep_3", function(e, step, scope){
		if(_scope.install == "autoinstall"){
			if(scope.step_pane3.$invalid || scope.system_version==undefined){
				scope.error = step.is_dirty;
				step.done = false;
			}
			else
				step.done = true;
		}
		else{
			step.done = true;
		}
	});
	$scope.$on("WizardDone", function(e, steps, scopes){
		var auto_install = scopes[2].install === "autoinstall" ? true : false;
		var item = {
			template_name: scopes[0].name,
			owner: scopes[0].owner.id,
			type_code : 2,
			vcpus: scopes[1].template.cpu_num,
			system_gb: scopes[1].template.system_gb,
			local_gb: scopes[1].template.local_gb,
			memory_mb: scopes[1].template.memory_mb,
			iso_path:scopes[2].iso[0].name,
			iso_id:scopes[2].iso[0].id,
			os_type: auto_install ? scopes[3].system_version : scopes[2].iso[0].os_type[0],
			auto_install: auto_install,
			key:scopes[3].key,
			username:scopes[3].userName,
			userPassword:scopes[3].userPassword,
			instance_type: scopes[1].template.id
		};
		$modalInstance.close();
		personal.save(item,function(res){
			personal.query(function(res){
				var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
				newRows.forEach(function(row){
					var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
					os && os.icon && (row.icon = os.icon);
				});
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows,newRows);
				if(!auto_install){
					var template = $scope.rows.filter(function(temp){ return temp.name ==  item.template_name})[0];
					window.open('templateModifybt.html#' + template.id + '&' + template.os_type,'_new','location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,toolbar=no');
				}
			});
		});
	});

	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.cpu_num = 1;
}])
.controller("addHardwareTemplateDialog", ["$scope", "$modalInstance","HardwareTemplate",function($scope,$modalInstance,hardware){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {
		cpu_num:1,
		memory_mb:1,
		system_gb:10,
		local_gb:0
	};
	$scope.master = angular.copy($scope.data);
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.ok = function(){
		var _this = this;

		hardware.save({
				"name" : this.data.name,
				"cpu_num" : this.data.cpu_num,
				"memory_mb": this.data.memory_mb*1024,
				"system_gb" :this.data.system_gb,
				"local_gb" :this.data.local_gb
			},
			function(data){
				$scope.rows.unshift({
					id: data.id,
					name : _this.data.name,
					cpu_num : _this.data.cpu_num,
					memory_mb: _this.data.memory_mb*1024,
					system_gb : _this.data.system_gb,
					local_gb : _this.data.local_gb
				});
				$modalInstance.close();
			}
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.add = false;
	$scope.btndisks = [];

	$scope.addharddisk = function(){
		$scope.add = true;
		$scope.btndisks.push({});
	};
	$scope.deleteharddisk = function(){
		$scope.add = false;
		$scope.data.local_gb = 0;
		$scope.btndisks.splice(0, 1);
	};
}])
.controller("editHardwareTemplateDialog", ["$scope", "$modalInstance","HardwareTemplate", function($scope, $modalInstance, hardware){
	$scope.min_namelength=2;$scope.max_namelength=20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data = angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function(){
		hardware.update(
			$scope.data,
			function(res){
				item.name = res.name;
				item.cpu_num = res.cpu_num;
				item.memory_mb = res.memory_mb;
				item.local_gb = res.local_gb;
				item.system_gb = res.system_gb;
				$modalInstance.close();
			},
			function(){

			}
		);
	};
	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.useNum="1"
	$scope.btndisks = [];
	$scope.addharddisk = function(){
		$scope.useNum-=1
		$scope.btndisks.push(new String);
	};
	$scope.deleteharddisk = function(itemindex){
		$scope.useNum+=1
		$scope.btndisks.splice(itemindex, 1);
	};
}])
.controller("clientSortDialog", ["$scope", "$modalInstance", "$modal", "Client", function($scope, $modalInstance, $modal, client){
	var _scope = $scope;var flag = false;
	$scope.computers = $scope.selected_rows;$scope.LENGTH = $scope.computers.length;
	$scope.able_computers = $scope.computers.filter(function(item){ return item.is_up; });
	$scope.unable_computers = $scope.computers.filter(function(item){ return !item.is_up; });
	$scope.able_noset_computers = $scope.able_computers.filter(function(item){ if(item.order_status !=2) return item; });
	$scope.able_noset_FWCompu = $scope.able_noset_computers.filter(function(item){ if(!(item.client_os.indexOf('Windows') > -1 || item.client_os.indexOf('windows') > -1)) return item; });
	$scope.noset_computers = $scope.computers.filter(function(item){ if(item.order_status !=2) return item; });
	$scope.set_computers = $scope.computers.filter(function(item){ if(item.order_status ==2) return item; });

	var ids = $scope.computers.map(function(item){ return item.id; });
	var able_ids = $scope.able_computers.map(function(item){ return item.id; });
	var able_noset_ids = $scope.able_noset_computers.map(function(item){ return item.id; });
	var able_noset_FW_ids = $scope.able_noset_FWCompu.map(function(item){ return item.id; });
	var noset_ids = $scope.noset_computers.map(function(item){ return item.id; });
	var set_ids = $scope.set_computers.map(function(item){ return item.id; });

	var computers = {};
	$scope.able_noset_computers.forEach(function(computer){
		computers[computer.id] = computer;
	});

	$scope.loop = false;$scope.results = 10;

  //   $scope.set = function(currentItem){
  //   	$modal.open({
		// 	template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel'>"+
		// 			"设置占位号</h4></div><div class='modal-body'><form class='form-horizontal' name='setNumber'><div class='form-group'><label class='col-xs-4 control-label required'>输入号码</label><div class='col-xs-7'><input type='number' required data-ng-model='placeholder' class='form-control'></div></div><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-ng-disabled='setNumber.$invalid'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;'>取消</button></footer></form></div></div></section>",
		// 	controller : function($scope, $modalInstance){
		// 		$scope.ok = function(){
		// 			client.setPlaceholder(
		// 			{ids:[currentItem.id], order:this.placeholder},
		// 			function(res){
		// 				//console.log(res)
		// 				currentItem.order_status = res.result[0].order_status;
		// 				currentItem.order = res.result[0].order;
		// 				_scope.set_computers.length++;
		// 				for(var i=0; i<_scope.able_noset_computers.length; i++){
		// 					if(_scope.able_noset_computers[i].id == res.result[0].id && _scope.able_noset_computers[i].is_up == true){
		// 						_scope.able_noset_computers.splice(i,1);
		// 						able_noset_ids.splice(i,1);
		// 					}
		// 				}
		// 				for(var i=0; i<noset_ids.length; i++){
		// 					if(noset_ids[i] == res.result[0].id){
		// 						_scope.noset_computers.splice(i,1);
		// 						noset_ids.splice(i,1);
		// 					}
		// 				}
		// 				//console.log(111,able_noset_ids);//console.log(222,noset_ids);
		// 			},function(){

		// 			})
					
		// 			$modalInstance.close();
		// 			//console.log(currentItem)
		// 		},
		// 		$scope.close = function(){
					
		// 			$modalInstance.close();
		// 		}
		// 	},
		// 	size : "sm"
		// });
  //   }

  //   $scope.cancel = function(currentItem){
  //   	$modal.open({
		// 	template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel'>"+
		// 			"取消占位号</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;'>确定取消占位号么?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;'>取消</button></footer></form></div></div></section>",
		// 	controller : function($scope, $modalInstance){
		// 		$scope.ok = function(){
		// 			client.setPlaceholder(
		// 			{ids:[currentItem.id], order:-1},
		// 			function(res){
		// 				currentItem.order_status = res.result[0].order_status;
		// 				currentItem.order = res.result[0].order;
		// 				_scope.set_computers.length--;
		// 				for(var i=0; i<_scope.computers.length; i++){
		// 					if(_scope.computers[i].id == res.result[0].id && _scope.computers[i].is_up == true){
		// 						_scope.able_noset_computers.push(_scope.computers[i]);
		// 						able_noset_ids.push(res.result[0].id);
		// 					}
		// 				}
		// 				for(var i=0; i<_scope.computers.length; i++){
		// 					if(_scope.computers[i].id == res.result[0].id){
		// 						_scope.noset_computers.push(_scope.computers[i]);
		// 						noset_ids.push(res.result[0].id);
		// 					}
		// 				}
						
		// 				//console.log(111,able_noset_ids);//console.log(222,noset_ids);
		// 			},function(){

		// 			});
					
		// 			$modalInstance.close();
		// 		},
		// 		$scope.close = function(){
		// 			$modalInstance.close();
		// 		}
		// 	},
		// 	size : "sm"
		// });
  //   }

    $scope.cancel = function(currentItem){
    	$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='取消登录序号'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CANCEL_LOGINNUM'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					client.setPlaceholder(
					{ids:[currentItem.id], order:-1},
					function(res){
						currentItem.order_status = res.result[0].order_status;
						currentItem.order = res.result[0].order;
					},function(){

					});
					
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
    }

	function time_loop(){
		client.polling(
			{ client_ids: able_noset_FW_ids },
			function(res){
				console.log(456,res.result);
				var trueNum = 0;$scope.width = 0;
				res.result.forEach(function(data){
					var computer = computers[data.id];
					console.log(computer, computer.order)
					if(data.order || !computer.is_up){
						console.log(123,computer);
						computer.client_name = data.name;
						computer.client_ip = data.ip;
						computer.order = data.order;
						trueNum++;
						$scope.width=(1/res.result.length)*trueNum*100 + "%";
					}
				});
				$scope.computers = $scope.able_noset_FWCompu;
				var unableComputers = $scope.computers.filter(function(item){ return !item.is_up; });
				var ableComputers = $scope.computers.filter(function(item){ return item.is_up; });
				var nosortComputers = ableComputers.filter(function(item){ return !item.order; });
				var sortedComputers = ableComputers.filter(function(item){ return item.order !== null; });
				sortedComputers.sort(
					function(item1,item2){
						return item1.order > item2.order ? 1 : -1;
					}
				);
				$scope.computers = [].concat(sortedComputers, nosortComputers, unableComputers);
				console.log(
					sortedComputers.map(function(item){ return item.id; }),
					nosortComputers.map(function(item){ return item.id; }),
					unableComputers.map(function(item){ return item.id; })
				);
				if(angular.element(".box-all").length){
					var t = setTimeout(function(){
						time_loop();
					}, 3000);
				}
				if(flag){
					clearTimeout(t);
				}

			},
			function(){
				if(angular.element("").length){
					setTimeout(function(){
						time_loop();
					}, 6000);
				}
			}
		);
	}

    $scope.startSort = function(){
    	if($scope.sorttype == "manual"){
			$scope.sorting = true;$scope.Manualsorting = true;

			client.setPlaceholder(
				{ids:able_noset_FW_ids, order:-1},
				function(res){
					res.result.forEach(function(data){
						var computer = computers[data.id];
						computer.order = null;
						console.log(computer, computer.order)
					});
					$scope.loop = true;
					time_loop();
				},function(){
					
				});

			client.sorting(
				{	ids:able_noset_FW_ids,
			        start_num:this.start_num,
			        clientname_prefix:this.clientname_prefix,
			        clientname_suffix:null
			    },
			    function(res){

				},
				function(){

				});
    	}
    	if($scope.sorttype == "auto"){
    		var trueNum = 0;$scope.width = 0;
			$scope.computers = $scope.noset_computers;$scope.sorting = true;
			client.setPlaceholder(
				{ids:noset_ids, order:this.start_num, auto_order:1},
				function(res){
					for(var i=0; i<res.result.length; i++){
						if(res.result[i].order){
							$scope.computers[i].order = res.result[i].order;
							trueNum++;
							$scope.width=(1/res.result.length)*trueNum*100 + "%";
						}
					}

				},function(){})
    	}
    }

	$scope.cancelSort = function(){
		flag = true;
		client.cancelsort({ids:able_noset_ids}, function(res){
			$modalInstance.close();
		});
	};

	$scope.ok = function(){};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("clientBindingIpDialog", ["$scope", "$modalInstance", "Client", "SchoolRoom", "Network", function($scope, $modalInstance, client, schoolroom, network){
			
	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected; });
	$scope.startIP = $scope.terminallists[0].target_ip;
	$scope.network_id;
	$scope.dhcp = false;
	schoolroom.query(function(res){
		angular.forEach(res.pools_, function(item){
			if(item.name == $scope.select.name){
				network.query(function(data){
					angular.forEach(data.networks, function(n){
						if(n.id == item.network_id){
							$scope.network = n.dhcp == false ? n.name:(n.name + "(" + n.dhcp_start + "~" + n.dhcp_end + ")");
							$scope.dhcp = n.dhcp;
						}
					});
				});
				$scope.network_id = item.network_id;
			}
		})

	});

	$scope.ok = function(){
		client.assignIps({
			method:"changeIp",
			start_ip:this.startIP,
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			network_id:this.network_id},
			function(res){
				var newip = res.result.map(function(item){ return item.ip});
			for(var i=0; i<newip.length; i++)
				$scope.terminallists[i].target_ip = newip[i];
			$modalInstance.close();
		})
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("configureserialnumberDialog", ["$scope", "$modalInstance", function($scope, $modalInstance){
	$scope.ok = function(){};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("calculateconfigurenumberDialog", ["$scope", "$modalInstance", function($scope, $modalInstance){

	$scope.ok = function(){};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("configureTerminalParameterDialog", ["$scope", "$modalInstance","Client", function($scope, $modalInstance, client){
    $scope.config = [];$scope.autologin = true;$scope.sending = false;
	$scope.resetWaittime = function(){
		$scope.config.wait_time = 0;
	}

	var selected_rows = $scope.rows.filter(function(row){ return row._selected; });
	client.getConfig({id:selected_rows[0].id}, function(data){
			$scope.config = data.config;
			if(!data.config.self_service) $scope.config.self_service = false;
			$scope.resolutions = ["1024x768","1366x768","1280x720","1280x1024","1440x900","1600x900","1920x1080"];
			if($scope.config.wait_time == 0)
				$scope.autologin = false;
			else $scope.autologin = true;
			if($scope.config.need_passwd == 1)
				$scope.checked = true;
			else $scope.checked = false;
		});
	if(selected_rows.length === 1){}
	
	$scope.ok = function(){
		$scope.sending = true;
		client.modifyConfig(
			{
				'api_host':$scope.config.api_host,
				'auto_start': $scope.config.auto_start,
				'self_service': $scope.config.self_service,
				// 'client_type': $scope.config.client_type,
				'desktop_mode': $scope.config.desktop_mode.toString(),
				'fullscreen': $scope.config.fullscreen,
				'id': selected_rows.filter(function(row){ return row.is_up == true; }).map(function(row){ return row.id; }),
				'need_passwd': $scope.config.need_passwd.toString(),
				'resolution': $scope.config.resolution,
				'shortcutKey': $scope.config.shortcutKey,
				'show_exit': $scope.config.show_exit,
				'shutdown_with_vm': $scope.config.shutdown_with_vm,
				'wait_time': $scope.config.wait_time,
				'init_pwd':$scope.config.init_pwd
			},
			function(res){
		        $modalInstance.close();
			},
			function(res){
				console.log(res)
				$scope.sending = false;
				$scope.failTip = true;
			})
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("configureClassroomDialog", ["$scope", "$modalInstance", "Client", function($scope, $modalInstance, client){
	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected; });

	$scope.poollists = $scope.classrooms.filter(function(item){ if(item.name !== $scope.select.name) return item;});
	$scope.pool = $scope.poollists[0];

	$scope.isUnchanged = function(){
		return angular.equals($scope.item, $scope.rows) 
				|| angular.equals($scope.currentItem, $scope.rows);
	};

	$scope.ok = function(){
		client.changePools(
		{
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			pool_id:this.pool.id
		},
		function(res){
			angular.forEach($scope.terminallists, function(item){
				item.target_ip = null;
				item.order = null;
				$scope.rows.splice($scope.rows.indexOf(item),1);
			});
			var newPool = res.result.map(function(item){ return item.pool_id});
			for(var i=0; i<newPool.length; i++)
				$scope.terminallists[i].pool = newPool[i];
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("configureNameDialog", ["$scope", "$modalInstance", "Client", function($scope, $modalInstance, client){
	$scope.terminallists = $scope.rows.filter(function(item){ return item._selected; });

	$scope.ok = function(){
		client.changeNames(
		{
			client_ids:$scope.terminallists.map(function(item){ return item.id}),
			prefix:this.prename
		},
		function(res){
			$modalInstance.close();
		});
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("configurenameDialog", ["$scope", "$modalInstance", function($scope, $modalInstance){

	$scope.ok = function(){};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("addUserRoleDialog", ["$scope", "$modalInstance", "Roles", function($scope, $modalInstance, role){
	$scope.checked = true;
	$scope.roles = $$$power_lists_add;
	$scope.roles.forEach(function(item){
		item._selected = $scope.checked;
		item._slide = false;
		item._arrow = "up";
	})
	$scope.selectAll = function(){
	 	$scope.checked = !$scope.checked;
	 	if($scope.checked){
	 		$scope.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = true;
	 		})
	 	}
	 	else{
	 		$scope.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = false;
	 		})
	 	}
	 }
	$scope.slide = function(name,checked){
		var fatheritem = $scope.roles.filter(function(item){ return item.key === name })[0];
		var subitem = $scope.roles.filter(function(item){ return item.belong === name })
		if(checked){
			fatheritem._arrow = "down";
			subitem.forEach(function(item){
				item._slide = true;
			})
		}
		else{
			fatheritem._arrow = "up";
			subitem.forEach(function(item){
				item._slide = false;
			})
		}
	 };
	$scope.select = function(name){
		var checked = $scope.roles.filter(function(item){ return item.key === name })[0]._selected;
		var subitem = $scope.roles.filter(function(item){ return item.belong === name })
		if(!checked){
			subitem.forEach(function(item){
				item._selected = true;
			})
		}
		else{
			subitem.forEach(function(item){
				item._selected = false;
			})
		}
		var length = $scope.roles.filter(function(item){ return item._selected; }).length;
		if(length+1 == $scope.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
	 };
	$scope.set = function(name){
		var allchecked = false;
		$scope.roles.filter(function(item){ return item.belong === name }).forEach(function(item){ 
			if(item._selected == true){
				allchecked = true;
			}
		})
		var fatheritem = $scope.roles.filter(function(item){ return item.key === name })[0];
		if(fatheritem){
			if(!allchecked)
				fatheritem._selected = false;
			else{
				fatheritem._selected = true;
			}	
		}
		var length = $scope.roles.filter(function(item){ return item._selected; }).length;
		if(length == $scope.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
	}



	 $scope.min_namelength=2;$scope.max_namelength=20;

	$scope.ok = function(){
		var _this = this;
		var roles = this.roles.filter(function(item){ return item._selected == true }).map(function(item){ return item.key });
		if(roles.length){
			role.save({
					"name": this.data.name,
					"desc": this.data.desc,
					"keys": roles.toString()
				},
				function(data){
					$scope.rows.push({
						id: data.id,
						name: data.name,
						desc: data.desc,
						user_num: data.user_num,
						redactor: data.redactor,
						updated_time: data.updated_time,
						access_key: data.access_key
					});
					$modalInstance.close();
				}
			);			
		}
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("PERMISSION_TIP"),
				timeout:6000
			});
		}

	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editUserRoleDialog", ["$scope", "$modalInstance", "Roles", function($scope, $modalInstance, role){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {};
	$scope.master = {};

	var item = $scope.item || $scope.currentItem;
	item.roles = $$$power_lists_add;
	var access_roles = item.access_key.split(",");
	item.roles.forEach(function(item){
		item._selected = false;
		item._slide = false;
		item._arrow = "up";
	})
	access_roles.forEach(function(role){
		item.roles.forEach(function(item){
			if(item.key === role) item._selected = true;
		})
	})
	$scope.data = angular.copy(item);

	if($scope.data.roles.filter(function(item){ return item._selected === true }).length === $scope.data.roles.length){
		$scope.checked = true;
	}
	else $scope.checked = false;

	$scope.selectAll = function(){
	 	$scope.checked = !$scope.checked;
	 	if($scope.checked){
	 		$scope.data.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = true;
	 		})
	 	}
	 	else{
	 		$scope.data.roles.forEach(function(item){
	 			if(item.key != "Administrator" && item.key != "User" && item.key != "Summary")
	 				item._selected = false;
	 		})
	 	}
	 }
	 $scope.slide = function(name,checked){
	 	var fatheritem = $scope.data.roles.filter(function(item){ return item.key === name })[0];
	 	var subitem = $scope.data.roles.filter(function(item){ return item.belong === name })
	 	if(checked){
	 		fatheritem._arrow = "down";
	 		subitem.forEach(function(item){
	 			item._slide = true;
	 		})
	 	}
	 	else{
	 		fatheritem._arrow = "up";
	 		subitem.forEach(function(item){
	 			item._slide = false;
	 		})
	 	}
	  };
	$scope.select = function(name){
		var checked = $scope.data.roles.filter(function(item){ return item.key === name })[0]._selected;
		var subitem = $scope.data.roles.filter(function(item){ return item.belong === name })
		if(!checked){
			subitem.forEach(function(item){
				item._selected = true;
			})
		}
		else{
			subitem.forEach(function(item){
				item._selected = false;
			})
		}
		var length = $scope.data.roles.filter(function(item){ return item._selected; }).length;
		if(length+1 == $scope.data.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
	 };
	$scope.set = function(name){
		var allchecked = false;
		$scope.data.roles.filter(function(item){ return item.belong === name }).forEach(function(item){ 
			if(item._selected == true){
				allchecked = true;
			}
		})
		var fatheritem = $scope.data.roles.filter(function(item){ return item.key === name })[0];
		if(fatheritem){
			if(!allchecked)
				fatheritem._selected = false;
			else{
				fatheritem._selected = true;
			}	
		}
		var length = $scope.data.roles.filter(function(item){ return item._selected; }).length;
		if(length == $scope.data.roles.length){
			$scope.checked = true;
		}
		else
			$scope.checked = false;
		
	}


	$scope.ok = function(){
		var _this = this;
		var roles = this.data.roles.filter(function(item){ return item._selected == true }).map(function(item){ return item.key });
		console.log(roles)
		if(roles.length){
			role.update({
					"id": this.data.id,
					"name": this.data.name,
					"desc": this.data.desc,
					"keys": roles.toString()
				},
				function(data){
					var POWER = item.access_key;
					item.name = data.name;
					item.desc = data.desc;
					item.access_key = data.access_key;
					item.redactor = data.redactor;
					item.updated_time = data.updated_time;
					item.user_num = data.user_num;
					$modalInstance.close();
					if(_this.data.id === JSON.parse(localStorage.loginInfo).permission && item.access_key != POWER){
						localStorage["power"] = roles.toString();
						location.reload();
					}
				}
			);			
		}
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("PERMISSION_TIP"),
				timeout:6000
			});
		}

	};
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
		if($scope.data.roles.filter(function(item){ return item._selected === true }).length === $scope.data.roles.length){
			$scope.checked = true;
		}
		else $scope.checked = false;
	};
}])
.controller("addUserAdminDialog", ["$scope", "$modalInstance", "Admin", "SchoolRoom", "Roles", function($scope, $modalInstance, admin, schoolroom, role){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope._ischeckAll = true;
	$scope.data = {
		sex:'true',
	};
	$scope.master = {sex:'true'};

	$scope.schoolroom_loading = true;
	schoolroom.query(function(res){
		$scope.schoolroom_loading = false;
		$scope.data.schoolrooms = res.pools_;
		$scope.data.schoolrooms.forEach(function(item){ item._selected = true;  });
	})
	role.query(function(res){
		$scope.roles = res.result;
		// $scope.data.role = res.result.filter(function(item){ return item.name==="Administrator" })[0];
	})
	$scope.DISABLED = false;
	$scope.changeRole = function(role){
		if($scope.data.role.name == "Administrator"){
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
			
		}
		else{
			$scope.DISABLED = false;
		}
	}
	$scope.checkAll = function(scope){
		if(scope._ischeckAll){
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			})
		}else{
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function(scope){
		var schoolrooms = $scope.data.schoolrooms.filter(function(p){ 
			return p._selected;
		});
		if(schoolrooms.length === $scope.data.schoolrooms.length){
			scope._ischeckAll = true;
		}else{
			scope._ischeckAll = false;
		}
	};

	$scope.reset = function() {
		console.log(56667,$scope.master)
		$scope.data=angular.copy($scope.master);
		console.log($scope.data)
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}
	$scope.ok = function(){
		var pools = $scope.data.schoolrooms.filter(function(item){ if(item._selected) return item }).map(function(item){ return item.id });
		if(pools.length)
			admin.save(
				{
					name: $scope.data.name,
					real_name: $scope.data.real_name,
					sex: $scope.data.sex,
					permission: $scope.data.role.id,
					password: $scope.data.password,
					passwordConfirm: $scope.data.passwordConfirm,
					email: $scope.data.email,
					contact: $scope.data.contact,
					pools: pools
				},
				function(data){
					data.result.instance_num = 0;
					$scope.rows.push(data.result);
					$modalInstance.close();
				}
			);
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("POOL_TIP"),
				timeout:6000
			});
		}
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editUserAdminDialog", ["$scope", "$modalInstance","Admin", "SchoolRoom", "Roles", function($scope, $modalInstance, admin, schoolroom, role){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.owner = JSON.parse(localStorage.loginInfo).keys == $$$powers? true:false;

	$scope.master = {};
	$scope.data = {};

	var item = $scope.item || $scope.currentItem;
	$scope.schoolroom_loading = true;
	schoolroom.query(function(res){
		$scope.schoolroom_loading = false;
		item.schoolrooms = res.pools_;
		var i = 0;
		item.schoolrooms.forEach(function(sch){
			item.pool.forEach(function(id){
				if(sch.id === id){
					sch._selected = true;
					i++;
				}
			})
		});
		if(i == item.schoolrooms.length){
			$scope._ischeckAll = true;
		}
		role.query(function(res){
			item.roles = res.result;
			var myrole = res.result.filter(function(role){ return role.name === item.permission })[0];
			// if(myrole)
				item.myrole = res.result.filter(function(role){ return role.name === item.permission })[0];
			// else
			// 	item.myrole = res.result[0];
			$scope.data = angular.copy(item);
			console.log(11111,$scope.data);
		})
		
	})
	if(!$scope.owner)
		$scope.DISABLED = true;
	$scope.changeRole = function(role){
		if($scope.data.myrole && $scope.data.myrole.name == "Administrator"){
			role._ischeckAll = true;
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			});
			$scope.DISABLED = true;
			
		}
		else{
			console.log(item.pool);
			$scope.data.schoolrooms.forEach(function(item){
					item._selected = false;
			})
			item.pool.forEach(function(schoolroom_id){
				$scope.data.schoolrooms.forEach(function(item){
					if(item.id === schoolroom_id){
						item._selected = true
					}
				})
			});
			if($scope.data.schoolrooms.filter(function(item){ return item._selected == true }).length == $scope.data.schoolrooms.length)
				role._ischeckAll = true;
			else role._ischeckAll = false;
			
			$scope.DISABLED = false;
		}
	}
	$scope.checkAll = function(scope){
		if(scope._ischeckAll){
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = true;
			})
		}else{
			$scope.data.schoolrooms.map(function(schoolroom){
				return schoolroom._selected = false;
			});
		}
	};
	$scope.checkOne = function(scope){
		var schoolrooms = $scope.data.schoolrooms.filter(function(p){ 
			return p._selected;
		});
		if(schoolrooms.length === $scope.data.schoolrooms.length){
			scope._ischeckAll = true;
		}else{
			scope._ischeckAll = false;
		}
	};


	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
		if($scope.data.schoolrooms.filter(function(item){ return item._selected === true }).length === $scope.data.schoolrooms.length){
			$scope.$$childTail._ischeckAll = true;
		}
		else {console.log($scope); $scope.$$childTail._ischeckAll = false;}

	};

	$scope.edit = function() {
		var user_id = this.data.id;
		var pools = this.data.schoolrooms.filter(function(item){ if(item._selected) return item }).map(function(item){ return item.id });
		if(pools.length)
			admin.update(
			{
				id:this.data.id,
				contact:this.data.contact,
				email:this.data.email,
				name:this.data.name,
				real_name:this.data.real_name,
				sex:this.data.sex,
				password:this.data.password,
				pools:pools,
				permission: this.data.myrole.id

			},
				function(res){
					var PERMISSION = item.permission;
					item.name = res.result.name;
					item.real_name = res.result.real_name;
					item.sex = res.result.sex;
					item.email = res.result.email;
					item.contact = res.result.contact;
					item.pool = res.result.pool;
					item.permission = res.name;
					if(user_id === JSON.parse(localStorage.loginInfo).id){
							localStorage["power"] = $scope.data.roles.filter(function(item){ return item.name === res.name })[0].access_key;
							var logInfor = JSON.parse(localStorage.loginInfo);
							logInfor.keys = localStorage["power"];
							logInfor.pool = res.result.pool;
							localStorage.loginInfo = JSON.stringify(logInfor);
							if(item.permission != PERMISSION){ location.reload(); }
						}
					$modalInstance.close();
				},
				function(){  }
			);
		else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("POOL_TIP"),
				timeout:6000
			});
		}
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("addUserCommonDialog", ["$scope", "$modalInstance","User", function($scope, $modalInstance, user){
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	$scope.data = {
		sex:'true',
		role:'2',
	};
	console.log($scope.data)
	$scope.master = {sex:'true',role_desc:'教师'};

	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}

	$scope.ok = function(){
		var _this = this;
		user.save(
			$scope.data,
			function(data){
				data.result.instance_num = 0;
				$scope.rows.unshift(data.result);
				$modalInstance.close();
			}
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editUserCommonDialog", ["$scope", "$modalInstance", "User", function($scope, $modalInstance, user){
	console.log("dddddddd")
	$scope.min_namelength=2;$scope.max_namelength=20;$scope.min_passwordLe=6;$scope.max_passwordLe=20;
	var item = $scope.item || $scope.currentItem;
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
	};
	$scope.edit = function() {
		user.update(
		{
			id:this.data.id,
			contact:this.data.contact,
			email:this.data.email,
			name:this.data.name,
			real_name:this.data.real_name,
			sex:this.data.sex,
			password:this.data.password
		},
			function(res){
				item.name = res.result.name;
				item.real_name = res.result.real_name;
				item.sex = res.result.sex;
				item.email = res.result.email;
				item.contact = res.result.contact;
				item.password = res.result.password;
				item.passwordConfirm = res.result.passwordConfirm;
				$modalInstance.close();
			},
			function(){}
		);
	};
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("addUserDomainDialog", ["$scope", "$modalInstance", "Server", function($scope, $modalInstance, Server){
	
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}

	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem||{});
	};

	$scope.close = function(){
		$modalInstance.close();
	};	

	$scope.ok=function(){
		Server.create($scope.data,function(response){
			$scope.rows.unshift(response.result[0]);
			$modalInstance.close();
		},function(){
		});
	};

	$scope.data = {"user":"","passwd":""};
}])
.controller("editUserDomainDialog", ["$scope", "$modalInstance", "Server", function($scope, $modalInstance, Server){
	var item = $scope.item || $scope.currentItem||{};
	console.log(item);
	$scope.data = angular.copy(item);
	Server.get({"id":item.id},function(response){
		var data=response;
		angular.forEach(data,function(value,key){
			item[key]=data[key];
		});
	},function(){
		console.log(arguments);
	});

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}

	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem||{});
	};

	$scope.close = function(){
		$modalInstance.close();
	};	

	$scope.ok=function(){
		Server.update($scope.data,function(response){
			var data=response.result[0];
			angular.forEach(data,function(value,key){
				item[key]=data[key];
			});
		});
		$modalInstance.close();
	};
}])
.controller("userDoaminAscingDialog", ["$scope", "$modalInstance", "Domain", function($scope, $modalInstance, Domain){
	var item = $scope.item || $scope.currentItem||{},domainName="";
	$scope.domainId=parseInt(location.hash.match(/\d+$/)[0]);
	$scope.data = angular.copy(item);
	$scope.data.ous = [];
	$scope.data.scope=0;

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}

	$scope.close = function(){
		$modalInstance.close();
	};	

	$scope.ok=function(){
		$scope.data.id=$scope.domainId;
		$scope.data.auto=0;

		$scope.data.ous=[];
		$scope.selected.map(function(item){
			item.src=item.src.join(",OU=");
			item.src="OU="+item.src+domainName;
			$scope.data.ous.push(item.src);
			return item;
		});

		Domain.asycing($scope.data,function(response){
			response.result.map(function(item){
				var len=$scope.rows.length,i;
				for(i=0;i<len;i++){
					if(item.id==$scope.rows[i].id){
						$scope.rows[i]=item;
					}
				}
				if(i>=len){
					$scope.rows.push(item);
				}
			});
			$modalInstance.close();
		},function(){});
	};
	$scope.status = 'loading';
	Domain.get({"id":$scope.domainId},function(response){
		console.time("handleDoaminData");
		$scope.status = 'completed';
		var menus=$(".menus")[0],i,index,temp=[],data;
		$scope.ous=response.ous;
		domainName=response.ous[0].url[0].substring(response.ous[0].url[0].indexOf(",DC="));

		data = Array.prototype.concat.apply([], $scope.ous.map(function(item){
		      return item.url;
		  })).map(function(url){
		      return url.split(",").filter(function(s){
		          return s.indexOf("OU=") === 0;
		      })
		  });
		angular.forEach(data,function(item){
		  angular.forEach(item,function(subItem,subIndex){
		    item[subIndex]=subItem.split("=")[1];
		  });
		  if(item.length==1&&item[0]){
		    temp.push({"text":item[0],"children":[],"src":item});
		  }else if(item.length==2&&item[1]){
		    angular.forEach(temp,function(_temp,_index){
		      if(_temp.text==item[1]){
		        temp[_index].children.push({"text":item[0],"children":[],"src":item});
		      }
		    });
		  }else if(item.length==3&&item[2]){
		    angular.forEach(temp,function(_temp,_index){
		      if(_temp.text==item[2]){
		        angular.forEach(_temp.children,function(_temp1,_index2){
		          if(_temp1.text==item[1]){
		            temp[_index].children[_index2].children.push({"text":item[0],"children":[],"src":item});
		          }
		        });
		      }
		    });
		  }
		});
		$scope.temp=temp;
		console.timeEnd("handleDoaminData");
	},function(){
		$scope.status = 'completed';
	});
	console.time("userDoaminAscingDialog controller to init function");
	$scope.selected=[];
	$scope.select_row=function(_item){
		var i,currentItemFlag=true,_itemFlag=true;
		if($scope.currentItem){$scope.currentItem.active=false;}
		
		angular.forEach($scope.temp,function(temp1,index1){	
			if(currentItemFlag&&$scope.currentItem&&temp1.text==$scope.currentItem.text){
				$scope.temp[index1]=$scope.currentItem;
				currentItemFlag=false;
			}
			if(_itemFlag&&temp1.text==_item.text){
				$scope.temp[index1]=_item;
				_itemFlag=false;
			}
			if(currentItemFlag||_itemFlag){
				angular.forEach(temp1.children,function(temp2,index2){
					if(currentItemFlag&&$scope.currentItem&&temp2.text==$scope.currentItem.text){
						$scope.temp[index1].children[index2]=$scope.currentItem;
						currentItemFlag=false;
					}
					if(_itemFlag&&temp2.text==_item.text){
						$scope.temp[index1].children[index2]=_item;
						_itemFlag=false;
					}
					if(currentItemFlag||_itemFlag){
						angular.forEach(temp2.children,function(temp3,index3){
							if(currentItemFlag&&$scope.currentItem&&temp3.text==$scope.currentItem.text){
								$scope.temp[index1].children[index2].children[index3]=$scope.currentItem;
								currentItemFlag=false;
							}
							if(_itemFlag&&temp3.text==_item.text){
								$scope.temp[index1].children[index2].children[index3]=_item;
								_itemFlag=false;
							}
						});
					}
				});
			}
		});
		_item.active=true;
		$scope.currentItem=_item;
	}
	$scope.select=function(_item){
		var item=_item||$scope.currentItem,index,i,j,children,flag=true;
		if(!item){
			return false;
		}

		/**delete children from selected**/
		angular.forEach(item.children,function(child){
			angular.forEach(child.children,function(subChild){
				index=$scope.selected.indexOf(subChild);
				if(index>-1){
					$scope.selected.splice(index,1);
				}
			});


			index=$scope.selected.indexOf(child);
			if(index>-1){$scope.selected.splice(index,1);}
		});
		
		/**add item to selected**/
		//item.active=true;
		angular.forEach($scope.selected,function(child1){
			if(child1.text==item.text){
				flag=false;
			}else if(flag){
				angular.forEach(child1.children,function(child2){
					if(child2.text==item.text){
						flag=false;
					}else if(flag){
						angular.forEach(child2.children,function(child3){
							if(child3.text==item.text){
								flag=false;
							}
						});
					}
				});
			}

		});
		if(flag){
			$scope.selected.unshift(item);
		}
	}
	$scope.removeSelected=function(_item){
		var index;
		if(!_item){
			return false;
		}
		index=$scope.selected.indexOf(_item);
		if(index>-1){
			$scope.selected.splice(index,1);
			$scope.currentItem="";
		}
	}
	console.timeEnd("userDoaminAscingDialog controller to init function");
}])
.controller("editSchoolroomDialog", ["$scope", "$modalInstance", "SchoolRoom","Network", "Admin", function($scope, $modalInstance, sc, network, admin){
	$scope.min_namelength=2;$scope.max_namelength=20;
	var item = $scope.item || $scope.currentItem;
	console.log(2222222,$scope)

	$scope.data = angular.copy(item);
	network.query(function(data){
	  	/*data.networks.map(function(n){
		  n.desc = n.dhcp == false ? n.name:(n.name + "(" + n.cidr + ")");
		});*/
		$scope.networks = data.networks;
		angular.forEach($scope.networks, function(item){
			if(item.id == $scope.data.network_id){
				$scope.data.network = item;
				if($scope.item)
					$scope.item.network = item;
				if($scope.currentItem)
					$scope.currentItem.network = item;
			}
		})
		$scope.network = item.network_cidr;
	});
	
	
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	};
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
	};

	var ids = [];
	admin.query(function(res){
		ids = res.users.filter(function(item){ return item.permission === 'Administrator' }).map(function(item){ return item.id })
	})
	var _id;
	$scope.edit = function(){
		_id = this.data.id;
		sc.update(
			{
				"id":this.data.id,
				"name": this.data.name,
				"desc": this.data.desc,
				"network_id": this.data.network.id,
				"ip_start": this.data.ip_start || '',
				"ip_end": this.data.ip_end || ''
			},

			function(res){
				if(res.id ==_id){
					var user_ids = item.user_ids;
					item.dhcp = res.dhcp;
					item.name = res.name;
					item.desc = res.desc;
					item.network_cidr = res.network_cidr;
					item.network_name = res.network_name;
					item.network_id = res.network_id;
					item.user_num = res.user_num || item.user_num;
					item.user_ids = res.user_ids || item.user_ids;
					item.dhcp = res.dhcp;
					item.dhcp_start = res.dhcp_start;
					item.dhcp_end = res.dhcp_end;
					item.ip_start = res.ip_start;
					item.ip_end = res.ip_end;
					$modalInstance.close();
				}else{
					$.bigBox({
						//title : $$$MSG.get("PAI_CODE") + res.data.code,
						//content : $$$MSG.get(res.data.code),
						title: '',
						content: "该IP范围同"+res.name+"("+res.ip_start+" ~ "+res.ip_end+")"+"教室重复，请重新填写",
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
				}
				
			},
			function(){  }
		);

	};
}])
.controller("addSchoolroomDialog", ["$scope", "$modalInstance", "SchoolRoom", "Network", "Admin", function($scope, $modalInstance, schoolroom, network, admin){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = {};
	$scope.master = {};

	network.query(function(data){
	  	/*data.networks.map(function(n){
		  n.desc = n.dhcp == false ? n.name:(n.name + "(" + n.cidr + ")");
		});*/
	console.log(data);
		$scope.networks = data.networks;
		$scope.network = $scope.networks[0];
	})

	var ids = [];
	admin.query(function(res){
		ids = res.users.filter(function(item){ return item.permission === 'Administrator' }).map(function(item){ return item.id });
	})
	$scope.ok = function(){
		var _this = this;
		schoolroom.save({
				"name": this.data.name,
				"desc": this.data.desc,
				"network_id": this.network.id,
				"ids": ids,
				"ip_start": this.data.ip_start || '',
				"ip_end": this.data.ip_end || ''
			},
			function(data){
				if(!data.name || data.name == _this.data.name){
					$scope.rows.push({
						id: data.id,
						name: _this.data.name,
						desc: _this.data.desc,
						network_cidr: _this.network.cidr,
						network_name: _this.network.name,
						network_id: _this.network.id,
						user_num: ids.length,
						user_ids: ids,
						terminalCount: 0,
						sceneCount: 0,
						dhcp: _this.network.dhcp,
						dhcp_start: _this.network.dhcp_start,
						dhcp_end: _this.network.dhcp_end,
						ip_start: _this.data.ip_start,
						ip_end: _this.data.ip_end
					});
					var logInfor = JSON.parse(localStorage.loginInfo);
					logInfor.pool = logInfor.pool.concat(data.id);
					localStorage.loginInfo = JSON.stringify(logInfor);
					$modalInstance.close();
				}else{
					$.bigBox({
						//title : $$$MSG.get("PAI_CODE") + res.data.code,
						//content : $$$MSG.get(res.data.code),
						title: '',
						content: "该IP范围同"+data.name+"("+data.ip_start+" ~ "+data.ip_end+")"+"教室重复，请重新填写",
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
				}
				
			}
		);

	};
	$scope.close = function(){
		$modalInstance.close();
	};
	$scope.reset = function() {
		$scope.data=angular.copy($scope.master);
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	};
}])

.controller("hostMoreDialog", ["$scope", "HostServiceManage", "HostNetworkManage", "$modalInstance", "Host", "HostManage",
    function($scope, service, network, $modalInstance,hostList,host){
    //查询服务
    service.query({host:$scope.item.id}, function(res){
        $scope.rows = res.result;
        $scope.rows.forEach(function(item){
            item.log_file = $Domain+"/thor/host/log/"+item.host_id+"?service_type="+item.name;
        });
    });
    //查询网卡
    network.query({host:$scope.item.ip}, function(res){
        $scope.networks = res.networks.map(function(item){ 
        	item.readonly = true;
        	return item;
     	}).sort(function(a,b){
     		return a.name > b.name;
     	});
    });

    //网卡进入编辑模式
	$scope.edit = function(item){
		item.readonly = false;
	};
    //开启服务
	$scope.active = function(item){
        item.msg = "Restart service..."
        service.start({host:item.host_id, service:item.name},

            function(rep){
               item.msg = "Success";
            },

            function(error){
                item.is_run = false;
                item.msg = error.statusCode();
            });
	};
    //修改网卡
	$scope.ok = function(item){
		item.submiting = true ;
		item.readonly = true;

		if(item.ip && item.netmask && item.gateway){
			//掩码，网关，IP同网段校验
			var ip_arr =  item.ip.split(".");
			var netmask_arr =  item.netmask.split(".");
			var gateway_arr =  item.gateway.split(".");

			var res0 = parseInt(ip_arr[0]) & parseInt(netmask_arr[0]);
			var res1 = parseInt(ip_arr[1]) & parseInt(netmask_arr[1]);
			var res2 = parseInt(ip_arr[2]) & parseInt(netmask_arr[2]);
			var res3 = parseInt(ip_arr[3]) & parseInt(netmask_arr[3]);

			var res0_gw = parseInt(gateway_arr[0]) & parseInt(netmask_arr[0]);
			var res1_gw = parseInt(gateway_arr[1]) & parseInt(netmask_arr[1]);
			var res2_gw = parseInt(gateway_arr[2]) & parseInt(netmask_arr[2]);
			var res3_gw = parseInt(gateway_arr[3]) & parseInt(netmask_arr[3]);

			if(res0 == res0_gw && res1 == res1_gw && res2 == res2_gw && res3 == res3_gw){
				var backItem = {
					"id":$scope.item.id,
					"ip":item.ip,
					"iface":item.iface,
					"netmask":item.netmask,
					"gateway":item.gateway,
	                "console_ip":item.console_ip
				};
				network.save(backItem, function(){
					item.submiting =false ;
				},function(){
					item.submiting =false ;
					item.readonly = false; 
				});
			}else{
				$.bigBox({
					title:$$$I18N.get("INFOR_TIP"),
					content:$$$I18N.get("hostMoreDialog_TIP1"),
					timeout:6000
				});
				item.submiting =false ;
				item.readonly = false; 
			}
		}else{
			var backItem = {
				"id":$scope.item.id,
				"ip":item.ip,
				"iface":item.iface,
				"netmask":item.netmask,
				"gateway":item.gateway,
	            "console_ip":item.console_ip
			};
			network.save(backItem, function(){
				item.submiting =false ;
			},function(){
				item.submiting =false ;
				item.readonly = false; 
			});

		}

		
	}
    //窗口关闭按钮
	$scope.close = function(){
		$modalInstance.close();
	};
    //修改ROOT密码
    $scope.rootBtn_unable = false;
	$scope.savePWD = function(){
		$scope.rootBtn_unable = true;
		var _this = this;
		host.modify_pwd({
            "id":this.item.id,
			"new_pwd":_this.new_pwd
		},function(res){
			$scope.rootBtn_unable = false;
			$scope.rootForm_suc = true;
			setTimeout(function(){
				$scope.rootForm_suc = false;
			},1000);
			_this.new_pwd = null;
		},function(){
			$scope.rootBtn_unable = false;
			_this.new_pwd = null;
		});
	};
    //修改最大实例数
    $scope.insBtn_unable = false;
	$scope.saveMaxInstance = function(){
		$scope.insBtn_unable = true;
		var _this = this;
		host.modify_pwd({
            "id":_this.item.id,
			"max_instance":_this.max_instance
		},function(res){
			$scope.insBtn_unable = false;
			$scope.item.max_instance = _this.max_instance;
			$scope.insForm_suc = true;
			setTimeout(function(){
				$scope.insForm_suc = false;
			},1000);
			_this.max_instance = null;
		});
	};
	// 修改外部IP
	$scope.IP_Btn_unable = false;
	$scope.save_outer_IP = function(){
		$scope.IP_Btn_unable = true;
		var _this = this;
		host.external_ip({
            "host":_this.item.id,
			"external_ip":_this.outerIP
		},function(res){
			$scope.IP_Btn_unable = false;
			$scope.outerIPForm_suc = true;
			setTimeout(function(){
				$scope.outerIPForm_suc = false;
			},1000);
		});
	};

    //下载日志
    $scope.down_log = function(item){
        host.log_down({"id":item.host_id, "service_type":item.name},
        function(res){
            document.getElementById("logFilePath"+item.name).click();
            return true;
        });
    };
}])

.controller("hostRenewDialog", ["$scope", "$modalInstance", "Host", function($scope, $modalInstance, host){
   	$scope.loading = true;
    host.query_deleted(function(res){
    	$scope.loading = false;
        $scope.host_deleted_list = res.host_deleted_list;
    	$scope.host =  $scope.host_deleted_list[0];
    });
    $scope.post = function(){
    	host.renew_deleted({id:this.host.id},function(){
    		$modalInstance.close();
    		host.query(function(res){
				$scope.rows.splice(0,$scope.rows.length);
				Array.prototype.push.apply($scope.rows,res.hosts_list);
			})
    	})
    }

    $scope.ip = function(host){
    	return host.ip+"("+host.name+")";
    }
	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("newNetworkManageDialog", ["$scope", "$modalInstance", "Network",'params', function($scope, $modalInstance, network,params){
	$scope.network = params.network || {type:params.type};

	if($scope.network.type=='logic'){
		$scope.network.dhcp = true;
	}
	// if($scope.network.dhcp_start){
	//   var ipsplit = $scope.network.dhcp_start.split('.');
	//   $scope.network.start_1 = ipsplit[0];
	//   $scope.network.start_2 = ipsplit[1];
	//   $scope.network.start_3 = ipsplit[2];
	//   $scope.network.start_4 = ipsplit[3];
	// }

	// if($scope.network.dhcp_end){
	//   var ipsplit = $scope.network.dhcp_end.split('.');
	//   $scope.network.end_1 = ipsplit[0];
	//   $scope.network.end_2 = ipsplit[1];
	//   $scope.network.end_3 = ipsplit[2];
	//   $scope.network.end_4 = ipsplit[3];
	// }

	// $scope.$watch('network.netmask',function(newvalue){
	//   if(newvalue){
	// 	  $scope.bit_1 = newvalue.split('.')[1] == '255';
	// 	  $scope.bit_2 = newvalue.split('.')[2] == '255';
	//   }
	// });

	$scope.update = params.update;

	$scope.close = function(){
		$modalInstance.close();
	};

	// [1,2,3].map(function(i){
	//   $scope.$watch('network.start_'+i,function(newvalue){
	// 	$scope.network['end_'+i] = newvalue;
	//   })
	// });

	$scope.ok = function () {
		var _this = this;

		// if($scope.network.start_1&&$scope.network.start_2&&$scope.network.start_3&&$scope.network.start_4)
		// 	$scope.network['dhcp_start'] = [$scope.network.start_1, $scope.network.start_2, $scope.network.start_3, $scope.network.start_4].join('.');
	 //  	if($scope.network.end_1&&$scope.network.end_2&&$scope.network.end_3&&$scope.network.end_4)
		// 	$scope.network['dhcp_end'] = [$scope.network.end_1, $scope.network.end_2, $scope.network.end_3, $scope.network.end_4].join('.');

	  	$scope.submiting = true;

	  	network.query(function(res){
  			network.add({network: $scope.network}, function (res) {
  				if(res.code===0 && res.result === false){
  					$.bigBox({
						title:$$$I18N.get("新建失败"),
						content : $$$I18N.get("该网络同XXX网络重复，请直接修改该网络").replace("XXX",res.name),
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
					$scope.submiting = false;
  				}else{
			  		$modalInstance.close({network:res.network,update:$scope.update});
			 	}
			},function(){
			  $scope.submiting = false;
			});
	  	});
	};
}])
.controller("newNetworkIPDialog", ["$scope", "$modalInstance","Network", function($scope, $modalInstance,network){
	var netMess= $scope.$parent.netmess;
	var rows = $scope.$parent.rows;

	$scope.close = function(){
		$modalInstance.close();
	};

	$scope.ok = function(){

		$scope.submiting = true;
		var postData = {
				"network_id":$scope.parent_id,
				"start":this.start,
				"end":this.end
		};
		network.save(postData,function(res){
			if(res.code===0 && res.result === false){
  					$.bigBox({
						title:$$$I18N.get("新建失败"),
						content : $$$I18N.get("该网络同XXX网络重复，请直接修改该网络").replace("XXX",res.name),
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
					$scope.submiting = false;
			}else{
				network.get({
					id : netMess.id,
					displayLength: 2551,
					scope:'all'
				},function(res){
					$scope.submiting = false;
					$modalInstance.close();
					rows.splice(0,rows.length);
					Array.prototype.push.apply(rows,res.data);
					rows.map(function(row){
						row.able = !row.disable;
						return row;
					});
					rows.forEach(function(row){
						var _ip = row.address.split(".");
						row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
					});
				})
			}
		},function(res){
			$scope.submiting = false;
		});
		
	};
}])
.controller("addStorageManageDialog", ["$scope","$modalInstance","Storage","$q", function($scope, $modalInstance, storage, $q){

    $scope.storage = {format_type:'ext4'};
	storage.get(function(data){
		$scope.types = data.protocol;
		console.log($scope.types )
		$scope.storage.type = $scope.types[0];

		$scope.usages = data.usages
		$scope.storage.usage = $scope.usages[0];

		$scope.servers = data.servers;
		$scope.storage.server = $scope.servers[0];
	});
	//清空数据
	$scope.clearData = function(){
		$scope.iscsi_targets = [];
		$scope.luns = [];
	  	$scope.lvs = [];
	  	$scope.storage.iscsi_target = null;
	  	$scope.storage.lun = null;
	  	$scope.storage.lv = null;
	  	$scope.storage.createlvm = null;
	  	$scope.lun_in_use = false;
	}

	$scope.searchISCSI = function(){
		$scope.loadiscsi = true;
	  	$scope.clearData();
		storage.getScsi({host:$scope.storage.host,user_host:$scope.storage.server.ip},function(res){
			$scope.loadiscsi = false;
			$scope.iscsi_targets = res.iqn_list;
            $scope.storage.iscsi_target = res.iqn_list[0];
		},function(){
            $scope.loadiscsi = false;
        });
	};
	$scope.searchFClun = function(){
		$scope.loadlun = true;
		$scope.clearData();
		storage.getFCLun({server_id:$scope.storage.server.id}, function(res){
            $scope.luns = res.lunList;
            $scope.loadlun = false ;
		},function(){
			$scope.loadlun = false ;
		});
	}
	$scope.$watch("storage.server",function(newvalue){
		if(newvalue){
			var type = $scope.storage.type.id;
			if(type==="iscsi" && $scope.storage.host){

				$scope.searchISCSI();

			}else if(type==="fc"){

				$scope.searchFClun();
				
			}
		}
	});
	$scope.$watch("storage.type",function(newvalue){
		if(newvalue&&newvalue.id=='fc'){

		  	$scope.searchFClun()
		}

	});
    var cancel_lun_loading = function(){
        $scope.loadlun = false;
    };

	$scope.$watch("storage.iscsi_target",function(newvalue){
		if(newvalue){
			// 清空数据
            $scope.loadlun = true;
			$scope.luns = [];
		  	$scope.lvs = [];
		  	$scope.storage.lun = null;
		  	$scope.storage.lv = null;
		  	$scope.storage.createlvm = null;
            storage.getLun({ iqn:$scope.storage.iscsi_target,host:$scope.storage.host,server_id:$scope.storage.server.id},function(res){
                $scope.luns = res.lunList;
                $scope.storage.lun = res.lunList[0];
                $scope.loadlun = false;
            },cancel_lun_loading);
        }
	});

    $scope.lun_in_use = false;

    $scope.$watch("storage.lun",function(newvalue){
        if(newvalue){
            var target_data = $scope.storage.type.id=='fc'?newvalue.value:$scope.storage.iscsi_target;
            $scope.loadlv = true;
            $scope.lun_in_use = false;
            storage.exsist({target: Base64.encode(target_data),lun:newvalue.lun,host:$scope.storage.server.id},function(data){
                $scope.lun_in_use = data.inuse;
			  	$scope.lun_in_host = data.host;
                $scope.loadlv = false;
            },cancel_lun_loading);

            $scope.lvs = newvalue.lvs;
            if(newvalue.lvs&&newvalue.lvs.length>0){
                $scope.storage.lv = newvalue.lvs[0];
                $scope.storage.createlvm = false;
                $scope.storage.format = false;
            }else{
                $scope.storage.lv = null;
                $scope.storage.format = true;
            	$scope.storage.createlvm = true;
				}
        }
    });

    $scope.$watch("storage.createlvm",function(newvalue){
    	if($scope.storage.createlvm ){
    		$scope.storage.format = true;
    	}
    });

    $scope.server_label = function(server){
    	return  server.ip ? (server.name+" ("+server.ip+")" ) : server.name;
    };

    $scope.getCloud = function(lvs){
    	if(lvs){
    		return lvs.some(function(lv){ return lv.lv == "tcloud"})
    	}
    };
 
	$scope.ok = function(){

        $scope.submiting = true;
		storage.save($scope.storage, function(res){
		  $scope.close();
		  $scope.$emit('newStorageAdded');
		},function(){$scope.submiting = false;});

	}
	$scope.close = function(){
		$modalInstance.close();
	};
}])

.controller("UpdateLicenseDialog",["$scope","$modalInstance", function($scope,$modalInstance){
	$scope.ex={
		url: $Domain + '/thor/license/export'
	}
	$scope.version = $$$version;
	$scope.close=function(){
		$modalInstance.close();
	};
	var encodeHTML = function(txt, con){
		con = con || document.createElement("div");
		while(con.firstChild){
			con.removeChild(con.firstChild);
		}
		return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
	};
	var format = function(tmpl){
		var data = Array.prototype.slice.call(arguments, 0);
		return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function(match, param){
			if(data[param]){
				return encodeHTML(data[param]);
			}
			return match;
		}) : "";
	};
	setTimeout(function(){
		$('#uploadISO').uploadify({
			'auto'     : true,
			'buttonText' : $$$I18N.get("上传授权文件"),
			'button_image_url':'',
	        'swf'      : 'js/plugin/uploadify/uploadify.swf',
	        'uploader' : $Domain + '/thor/license/show',
	        'file_post_name': 'licensekey',
	        'fileTypeExts' : '*.txt;*.acvt;*.key',
	        'multi' : false,
	        'width' : '119',
	        'height': '31',
	        'onFallback':function(){
		        var message = $$$I18N.get("Flash 插件没有安装");
		        $.bigBox({
						title : $$$I18N.get("INFOR_TIP"),
						content : message,
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
		    },
		    'onSelectError':function(file, errorCode, errorMsg){
		        this.queueData.errorMsg = $$$I18N.get('文件不会被添加到队列中')+"\n";
		        var settings = this.settings;
		        if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
	       	
		            switch(errorCode) {
		                case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
		                    if(settings.queueSizeLimit > errorMsg) {
		                        this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED"), errorMsg);
		                    }
		                    else{
		                        this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED2"), settings.queueSizeLimit);
		                    }
		                    break;
		                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
		                    this.queueData.errorMsg += format($$$I18N.get("FILE_EXCEEDS_SIZE_LIMIT"), file.name,settings.fileSizeLimit);
		                    break;
		                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
		                    this.queueData.errorMsg += format($$$I18N.get("ZERO_BYTE_FILE"), file.name);
		                    break;
		                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
		                    this.queueData.errorMsg += format($$$I18N.get("INVALID_FILETYPE"), file.name,settings.fileTypeDesc );
		                    break;
		            }
		        }
		    },
	        'onUploadSuccess':function(response,data){
	        	var data=JSON.parse(data);
	        	switch(data.code){
                    case 0:
                        $modalInstance.close();
                        $.bigBox({
                            title : $$$I18N.get("授权更新成功"),
                            // 新的授权内容已生效，请关闭本窗口后刷新页面查看。
                            content : $$$I18N.get("LICENSE_MESS_1"),
                            color : "#8ac38b",
                            icon : "fa fa-ok shake animated",
                            timeout : 6000
                        });
                        $scope.$emit('test',data);
                        break;
                    case -1:
                        $.bigBox({
                            title : $$$I18N.get("授权更新失败"),
                            // "授权文件与服务器硬件ID不匹配，请确认后重新上传。"
                            content : $$$I18N.get("LICENSE_MESS_2"),
                            color : "#C46A69",
                            icon : "fa fa-warning shake animated",
                            timeout : 6000
                        });
                        break;
                    default :
                        $.bigBox({
                            title : $$$I18N.get("授权更新失败"),
                            // "不是合法的授权文件格式或内容，请检查确认后重新上传。"
                            content : $$$I18N.get("LICENSE_MESS_3"),
                            color : "#C46A69",
                            icon : "fa fa-warning shake animated",
                            timeout : 6000
                        });
	        	}
	        }
       })
	} ,3 );
	}])
.controller("addSystemUSBDialog",["$scope","$modalInstance", "SystemUSB", function($scope,$modalInstance,systemusb){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.data = { allow: 'true' };
	$scope.types = [];
	var keys = ['0x01','0x02','0x03','0x05','0x06','0x07','0x08','0x09','0x0A','0x0B','0x0D','0x0E','0x0F','0x10','0x11','0xDC','0xE0','0xEF','0xFE','0xFF','-1'];
	keys.forEach(function(item){
		$scope.types.push({key: item, value: $$$I18N.get(item)})
	});
	console.log(11111,$scope.types)
	$scope.data.class_id = $scope.types[0];
	$scope.master = { allow: true, class_id: $scope.types[0]};
	$scope.reset = function() {
		$scope.data = $scope.master;
		console.log($scope.data)
	};
	$scope.isUnchanged = function(){
		return angular.equals($scope.master,$scope.data);
	}
	$scope.ok = function(){
		systemusb.save({
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1'? $scope.data.product_id: "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1'? $scope.data.vendor_id: "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow=="true"?true:false
		}, function(res){
			systemusb.get(function(res){
				res.result.forEach(function(item){
					item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
				})
				$scope.rows.splice(0, $scope.rows.length);
				Array.prototype.push.apply($scope.rows,res.result);
			})
			
		});
		$modalInstance.close();
	}

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("editSystemUSBDialog",["$scope","$modalInstance", "SystemUSB", function($scope,$modalInstance,systemusb){
	$scope.min_namelength=2;$scope.max_namelength=20;
	$scope.types = [];
	var keys = ['0x01','0x02','0x03','0x05','0x06','0x07','0x08','0x09','0x0A','0x0B','0x0D','0x0E','0x0F','0x10','0x11','0xDC','0xE0','0xEF','0xFE','0xFF','-1'];
	keys.forEach(function(item){
		$scope.types.push({key: item, value: $$$I18N.get(item)})
	});
	var item = $scope.item || $scope.currentItem;
	if(item.product_id.indexOf("0x")>-1){
		item.product_id = item.product_id == -1? "-1": item.product_id.substring(2);
		console.log(1111,$scope.rows)
	}
	if(item.vendor_id.indexOf("0x")>-1){
		item.vendor_id = item.vendor_id == -1? "-1": item.vendor_id.substring(2);
	}
	$scope.data = angular.copy(item);

	$scope.isUnchanged = function(){
		return angular.equals($scope.item,$scope.data) || angular.equals($scope.currentItem,$scope.data);
	}
	$scope.reset = function() {
		$scope.data=angular.copy($scope.item || $scope.currentItem);
	};

	$scope.ok = function() {
		systemusb.update(
		{	
			group_id: $scope.data.id,
			class_id: $scope.data.class_id.key,
			priority: $scope.data.priority,
			rule_name: $scope.data.rule_name,
			product_id: $scope.data.product_id == '-1'? $scope.data.product_id: "0x" + $scope.data.product_id,
			vendor_id: $scope.data.vendor_id == '-1'? $scope.data.vendor_id: "0x" + $scope.data.vendor_id,
			allow: $scope.data.allow
		},
			function(res){
				systemusb.get(function(res){
					res.result.forEach(function(item){
						item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
					})
					$scope.rows.splice(0, $scope.rows.length);
					Array.prototype.push.apply($scope.rows,res.result);
				})
				$modalInstance.close();
			},
			function(){  }
		);
	};

	$scope.close = function(){
		$modalInstance.close();
	};
}])
.controller("systemUpgradeDetailDialog", ["$scope", "SystemUpgrade","modal_data","$modalInstance",function($scope, SystemUpgrade,modal_data,$modalInstance){

	SystemUpgrade.query({owner:modal_data},function(res){
		$scope.rows = res.result;
	});
	$scope.close = function(){
		$modalInstance.close();
	}
}])
})();