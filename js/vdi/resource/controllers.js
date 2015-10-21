angular.module("vdi.controllers")

.controller("vdiResourceNetworkListController", ["$scope", "Network",'$modal',function($scope,network,$modal){
	$scope.rows = [];$scope.loading = true;

	$scope.is_run = true;
	network.query(function(res){
		var unedit_ids = res.net_ids;
		$scope.rows = res.networks.map(function(net){
			net.un_edit = unedit_ids.indexOf(net.id) === -1 ?  false : true;
			return net;
		});
		$scope.loading = false;
	});
	
	$scope.pagesizes = [10, 20, 30];
	$scope.pagesize = $scope.pagesizes[0];
	$scope.currentPage = 1;

	var _controllerScope = $scope;
	$scope.update = function(item,index){
		$scope.open_storage_dialog(item.type,item,true,index);
	};

	$scope.open_storage_dialog = function(type,network,update,index){
		var dialog = $modal.open({
			templateUrl: "views/vdi/dialog/resource/new_network.html",
			controller: "newNetworkManageDialog",
			size: "dm",
			resolve:{
				params : function(){
					return {type:type,update:update,network:angular.copy(network)};
				}
			}
		});
	  	dialog.result.then(function(result){
		  if(result){
			if(result.update){
			  $scope.rows[index] = result.network;
			}else{
			  $scope.rows.push(result.network);
			}
		  }

		});
	};
	$scope.switchdhcp = function(ops){
		network.enable_dhcp({id:ops.item.id,enable_dhcp:ops.item.dhcp},function(data){
		})
	};
	$scope.delete = function(item,idx){
		$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除网络'>"+
						"删除网络</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;'  ng-if="+ "item.type=='vlan'" +" localize='MESS_NEWNET2'>删除VLAN网络段需重启服务器,确定删除网络吗?</p><p ng-if="+"item.type=='logic'"+" style='margin-bottom:20px;' localize='确定删除网络吗'>确定删除网络吗?</p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance){
					$scope.item = item;
					$scope.ok = function(){
						$modalInstance.close();
						network.delete_network({id: item.id},function(res){
							_controllerScope.rows.splice(idx,1);
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
	}

}])
.controller("vdiResourceNetworkIPListController", ["$scope", "$routeParams" ,"$modal","Network",function($scope, $routeParams,$modal, network){
	$scope.rows =[];$scope.loading = true;
	$scope.$root && $scope.$root.$broadcast("navItemSelected", ["资源池", "网络管理", "网络IP池"]);
	var fn_address_callback = function(res){
		$scope.rows = res.data.map(function(item){
			item.able = !item.disable;
			return item;
		});
		$scope.loading = false;
		$scope.rows.forEach(function(row){
			var _ip = row.address.split(".");
			row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
		});
		$scope.netmess = res.network;
	};

	$scope.pagesize = parseInt(localStorage.netIP_pagesize) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize" , function(newvalue){
		newvalue && ( localStorage.netIP_pagesize = newvalue)
	})

	network.get({
		id : $routeParams.id,
		displayLength: 2551,
		scope:'all'
	}, fn_address_callback);
	$scope.parent_id = $routeParams.id;

	$scope.switchable = function(ascope){
		var item = ascope.item;
		network.delete({ids:item.id} ,function(res){
			network.get({
				id : $routeParams.id,
				displayLength: 2551,
				scope:'all'
			}, fn_address_callback);
		} , function(){
			network.get({
				id : $routeParams.id,
				displayLength: 2551,
				scope:'all'
			}, fn_address_callback);
		})
	};

	$scope.sortUsed = function(order){
		$scope.rows.sort(function(a, b){
			return (a._ip > b._ip) ? 1 : -1;
		});
		var a = $scope.rows.filter(function(row){
			return row.has_used;
		});
		a.forEach(function(row){
			$scope.rows.splice($scope.rows.indexOf(row), 1);
		});
		$scope.rows.unshift.apply($scope.rows, a);
		if(order){
			$scope.rows.reverse();
		}
	};
	$scope.sortUser = function(order){
		$scope.rows.sort(function(a, b){
			return (a.assignOwner > b.assignOwner) ? 1 : -1;
		});
		//assignOwner
	};
	$scope.sortAllocated = function(order){
		$scope.rows.sort(function(a, b){
			return (a._ip > b._ip) ? 1 : -1;
		});
		var a = $scope.rows.filter(function(row){
			return row.allocated;
		});
		a.forEach(function(row){
			$scope.rows.splice($scope.rows.indexOf(row), 1);
		});
		$scope.rows.unshift.apply($scope.rows, a);
		if(order){
			$scope.rows.reverse();
		}
	};
	$scope.sortIP = function(order){
		$scope.rows.sort(function(a, b){
			return (a._ip > b._ip) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};


	// $scope.delete =function(item){

	// 	var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && !row.has_used; });
	// 	$modal.open({
	// 			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除IP'>"+
	// 					"删除IP</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定删除IP吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
	// 			controller : function($scope, $modalInstance){
	// 				$scope.ok = function(){
	// 					$modalInstance.close();
	// 					network.delete({ids:rows.map(function(row){ return row.id })} ,function(res){
	// 						network.get({
	// 							id : $routeParams.id,
	// 							displayLength: 2551,
	// 							scope:'all'
	// 						}, fn_address_callback);
	// 					})
	// 				},
	// 				$scope.close = function(){
	// 					$modalInstance.close();
	// 				}
	// 			},
	// 			size : "sm"
	// 	});

	
	// };

}])

//控制器－主机管理
.controller("vdiResourceHostListController", ["$scope","$modal", "Host", "settings", function($scope,$modal, host, settings){
	$scope.loading = true;
	$scope.rows = [];

	$scope.languages = settings.languages;
	$scope.currentLang = settings.currentLang;
	$scope.current_theme = localStorage.current_theme || "smart-style-0";
	$scope.domain = $Domain;
	host.query(function(res){
		$scope.rows = res.hosts_list.map(function(item){
			item.submiting = false;
			return item;
		})
		.sort(function(a,b){
			return a.host > b.host? 1:-1;
		})
		.sort(function(a,b){
			if(a.is_console){
				return -1
			}else if(b.is_console){
				return 1;
			};
			return 0;
		});
		$scope.loading = false;
	});
	
	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	var _controllerScope = $scope;

	$scope.restart = function(){
		var rows = $scope.rows.filter(function(item) {return item._selected && item.status == true; });
		if(rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='重启主机'>"+
						"重启主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启主机吗?'>确定重启主机吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						rows.map(function(item){
							item.submiting = true;
							return item;
						})
						host.reboot({host_ids:rows.map(function(row){ return row.id }), action:"reboot_host" },function(){
							rows.map(function(item){
								item.submiting = false;
								return item;
							})
							host.query(function(res){
								_controllerScope.rows.splice(0,_controllerScope.rows.length);
								Array.prototype.push.apply(_controllerScope.rows,res.hosts_list);
							})
						});
	                    $modalInstance.close();
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}else{
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiResourceHostList_TIP1"),
				timeout:6000
			});
		}
		
	};

	$scope.poweroff = function(){
		var rows = $scope.rows.filter(function(item) {
			return item._selected;
		});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='关闭主机'>"+
					"关闭主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定关闭主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller: function($scope, $modalInstance){
				$scope.name = rows.map(function(row){ return row.host }).join(', ');
				$scope.ok = function(){
					host.power_off({host_ids:rows.map(function(row){ return row.id }), action:"poweroff_host" },function(){
						host.query(function(res){
							_controllerScope.rows.splice(0,_controllerScope.rows.length);
							Array.prototype.push.apply(_controllerScope.rows,res.hosts_list);
						});
					});
					$modalInstance.close();
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
		
	};
	
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var is_console = false;
		rows.forEach(function(item){
			if(item && item.is_console){
				is_console = true;
			}
		});
		if(is_console){
				$.bigBox({
					title:$$$I18N.get("INFOR_TIP"),
					content:$$$I18N.get("vdiResourceHostList_TIP2"),
					timeout : 6000
				});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除主机'>"+
						"删除主机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定删除主机吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.name = rows.map(function(row){ return row.host }).join(', ');
					$scope.ok = function(){
						$modalInstance.close();
						host.delete({host_ids:rows.map(function(row){ return row.id})}, function(res){
							$.bigBox({
								title:$$$I18N.get("INFOR_TIP"),
								content:$$$I18N.get("vdiResourceHostList_TIP3"),
								timeout : 6000
							});
							host.query(function(data){
								_controllerScope.rows.splice(0,_controllerScope.rows.length);
								Array.prototype.push.apply(_controllerScope.rows,data.hosts_list);
							})
						
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
		
		
	};
}])
.controller("vdiResourceStorageListController", ["$scope","$modal",  "Storage", "Host", function($scope,$modal,  Storage, hostList){
	$scope.rows = [];$scope.loading = true;
	$scope.servers = [];

    var load_data = function(idx){
        Storage.query(function(res){

        	//数据处理，把server_id相同的数据列为一组
      		var obj = {};
      		res.storage_list.forEach(function(item){
      			item.submiting = false;
      			if(obj[item.server_id] === undefined){
      				obj[item.server_id] = [item];
      			}else{
      				obj[item.server_id].push(item);
      			}
      		})
      		$scope.rows = [];
      		for(i in obj){
      			$scope.rows.push({"server_id":i,"server_name":obj[i][0].server_name,"detail":obj[i]});
      		}

            $scope.servers = res.servers.map(function(item,index){
                return item.ip;
            });
            $scope.loading = false;
        });
    };
    load_data();

    $scope.$on('newStorageAdded',function(){
       load_data();
    });


	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

    $scope.delete =function(item,storage_id,idx){

        // if(confirm("确定删除存储"+mount_point+"?")){
        //     item.submiting = true;
        //     Storage.delete({id:storage_id},function(data){
        //         load_data(idx);
        //     },function(){item.submiting = false;});
        // }
        $modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除存储'>"+
						"删除存储</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定删除存储吗'>确定删除存储吗</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.name = item.mount_point ;
					$scope.ok = function(){
						$modalInstance.close();
						item.submiting = true;
						Storage.delete({id:storage_id},function(data){
				            load_data(idx);
				        },function(){item.submiting = false;});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});


    }
}])

;