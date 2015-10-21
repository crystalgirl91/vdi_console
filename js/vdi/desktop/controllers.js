angular.module("vdi.controllers")
.controller("vdiDesktopPersonalListController", ["$scope","$modal", "PersonDesktop", "VMCommon", "$interval", "$filter","PersonTemplate",function($scope,$modal, person_desktop, vm, $interval, $filter, tmpl){
	$scope.loading = true;
	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("instanceIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});
	var _ctrlScope = $scope;
	$scope.refresh = getList;
	function getList(){
		_ctrlScope.select = '';
		person_desktop.query(function(res){
			_ctrlScope.rows = res.result;
			_ctrlScope.allRows = res.result;
			_ctrlScope.rows.forEach(function(row){
				var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
				os && os.icon && (row.icon = os.icon);
			});
			_ctrlScope.loading = false;
		});
	}
	getList();

	tmpl.query(function(res){
		$scope.templateNum = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){ return item.status =="alive" }).length;
	});

	$scope.pagesize = parseInt(localStorage.personl_pagesize) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize",function(newvalue){
		localStorage.personl_pagesize = newvalue;
	});


	$scope.rows = [];

	$scope.changeStatus = function(){
		$scope.rows = $filter("filter")($scope.allRows,$scope.select);
		$scope.rows.forEach(function(item, i){
            item._selected = false;
        });
	};

	var _controllerScope = $scope;	
		$scope.start = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended'); });
		if(rows.length==0){
			$.bigBox({
				title: $$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP1"),
				timeout:6000
			});
		}else{
			rows.map(function(row){
				row._selected = false ;
				row.status = "building" ;
			});
			vm.start({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
				_controllerScope.refresh();				
			});
		}
	};

	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							rows.map(function(row){
								row._selected = false;
								row.status = "building" ;
							});
							vm.shutdowns({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
								_controllerScope.refresh();
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
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building" ;
						});
						vm.shutdowns({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	$scope.restart = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP4"),
				timeout:6000
			});
		}else{
		
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
							"桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.reboots({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	$scope.pause = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running'; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP5"),
				timeout:6000
			});
		}else{

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>"+ 
						"桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.pause({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	}
	$scope.resume = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused'; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopPersonalList_TIP6"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>"+
						"桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.resume({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		var is_running = rows.some(function(row){ return row.status == 'running'});
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>"+
					"桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.is_run = is_running;
				$scope.ok = function(){
					$modalInstance.close();
					person_desktop.delete({instance_ids: rows.map(function(row){ return row.instance_id; })}, function(data){
						rows.forEach(function(r){
							_controllerScope.refresh();
						});
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});			
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
	
}])

.controller("vdiDesktopTeachListController", ["$scope", "$route","$modal", "TeachDesktop", "VMCommon", "$interval", "$filter", function($scope, $route,$modal, teach_desktop, vm, $interval, $filter){
	$scope.rows = [];$scope.loading = true;$scope.refresh = getList;
	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("instanceIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("instancesRowsUpdate", function($event, data){
		var _rows = {};
		$scope.rows.forEach(function(item){
			_rows[item.id] = item;
		});
		data.forEach(function(item){
			if(_rows[item.id]){
				for(var k in item){
					_rows[item.id][k] = item[k];
				}
			}
		});
	});

	var _ctrlScope = $scope;
	var _id =  $route.current.params.id;
	function getList(){
		_ctrlScope.select = '';
		teach_desktop.query({ id : _id }, function(res){
			_ctrlScope.rows = res.result.reverse();
			_ctrlScope.allRows = res.result;
			_ctrlScope.loading = false;
			_ctrlScope.$root && $scope.$root.$broadcast("navItemSelected", ["桌面", "教学桌面", res.mode_name]);
		});
	}
	getList()
	$scope.changeStatus = function(){
		$scope.rows = $filter("filter")($scope.allRows,$scope.select);
		$scope.rows.forEach(function(item, i){
            item._selected = false;
        });
	};

	$scope.pagesize = parseInt(localStorage.teach_pagesize) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize",function(newvalue){
		if(newvalue){
			localStorage.teach_pagesize = newvalue;
		}
	});

	$scope.sortDesktopName = function(name,bool){
		$scope.rows.sort(function(a,b){
			var _numa,_numb;
			var get_num = function(tar){
				for(var i = tar.length - 1 ; i-- ; i >= 0 ){
					if(!Number(tar[i])){
						return Number(tar.substring(i + 1,tar.length));
					}
				}
			};
			_numa = get_num( a[name] );
			_numb = get_num( b[name] );
			return (_numa - _numb) * (bool ? -1 : 1);
		});
	};

	$scope.getTotalCount = function(rows){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.instances_count;
		}, 0);
	};

	$scope.getRunningCount = function(rows){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.running_count;
		}, 0);
	};

	$scope.getShutdownCount = function(rows){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.instances_count - item.running_count;
		}, 0);
	};

	var _controllerScope = $scope;
	$scope.start = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'shutdown' || row.status == 'suspended'); });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP1"),
				timeout:6000
			});
		}else{
			rows.map(function(row){
				row._selected = false ;
				row.status = "building" ;
			});
			vm.start({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
				_controllerScope.refresh();	
			});
		}
	};

	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); });
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP2"),
				timeout:6000
			});
		}else{
			$modal.open({
					template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
							"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定强制关闭桌面吗'>确定强制关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
					controller : function($scope, $modalInstance){
						$scope.ok = function(){
							$modalInstance.close();
							rows.map(function(row){
								row._selected = false;
								row.status = "building" ;
							});
							vm.shutdowns({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
								_controllerScope.refresh();
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
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP3"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
							"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭桌面吗'>确定自然关闭桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building" ;
						});
						vm.shutdowns({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	$scope.restart = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && (row.status == 'running' || row.status == 'suspended'); })
		if(rows.length==0){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP4"),
				timeout:6000
			});
		}else{
		
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重启'>"+
							"桌面重启</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定重启桌面吗'>确定重启桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.reboots({is_soft:'true',instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	$scope.pause = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'running'; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP5"),
				timeout:6000
			});
		}else{

			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面暂停'>"+ 
						"桌面暂停</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定暂停桌面吗'>确定暂停桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.pause({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	}
	$scope.resume = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.status == 'paused'; })
		if(rows.length ==0 ){
			$.bigBox({
				title:$$$I18N.get("INFOR_TIP"),
				content:$$$I18N.get("vdiDesktopTeachList_TIP6"),
				timeout:6000
			});
		}else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面恢复'>"+
						"桌面恢复</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定恢复桌面吗'>确定恢复桌面吗?</p><footer   class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						rows.map(function(row){
							row._selected = false;
							row.status = "building";
						});
						vm.resume({instance_ids: rows.map(function(row){ return row.instance_id; })},function(){
							_controllerScope.refresh();
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
	// $scope.delete = function(item){
	// 	var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
	// 	var is_running = rows.some(function(row){ return row.status == 'running'});
	// 	$modal.open({
	// 		template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面删除'>"+
	// 				"桌面删除</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='!is_run' style='margin-bottom:20px;' localize='桌面删除后无法恢复，确定删除桌面吗'>桌面删除后无法恢复，确定删除桌面吗?</p><p ng-show='is_run' style='margin-bottom:20px;' localize='存在未关机的桌面，仍然删除桌面吗'>存在未关机的桌面，仍然删除桌面吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
	// 		controller : function($scope, $modalInstance){
	// 			$scope.is_run = is_running;
	// 			$scope.ok = function(){
	// 				$modalInstance.close();
	// 				teach_desktop.delete({instance_ids: rows.map(function(row){ return row.instance_id; })}, function(data){
	// 					teach_desktop.query({ id : $route.current.params.id }, function(res){
	// 						_controllerScope.rows = res.result;
	// 						_controllerScope.$root && _controllerScope.$root.$broadcast("navItemSelected", ["桌面", "教学桌面", res.mode_name]);
	// 					});
	// 				});
	// 			},
	// 			$scope.close = function(){
	// 				$modalInstance.close();
	// 			}
	// 		},
	// 		size : "sm"
	// 	});			
	// };
	$scope.reset = function(item){
		var row = item;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面重置'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='确定重置桌面吗'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",

			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					teach_desktop.reset({instance_id: row.instance_id}, function(data){
						$.bigBox({
							title:$$$I18N.get("操作结果"),
							content:$$$I18N.get("重置成功"),
							timeout:5000
						});
						_controllerScope.refresh();
					});
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});			
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.id, "person_desktop_" + item.id);
	};
}])

.controller("vdiDesktopSceneListController", ["$scope","$modal" ,"Scene","$filter","TeachTemplate","SchoolRoom", function($scope, $modal,scene,$filter,template,SchoolRoom){
	$scope.loading = true;
	$scope.searchText = "";
	$scope.rows = [];
	$scope.allRows = [];
	$scope.refresh = getList;

	var _controllerScope = $scope;
	var _loginPool =  JSON.parse(localStorage.loginInfo).pool;
	var _loginClassroom = localStorage.classroom;

	SchoolRoom.query(function(res){
		_controllerScope.classrooms = res.pools_.filter(function(pool){
			return _loginPool.indexOf(pool.id) === -1 ? false : true;
		});
	});
	getList();
	function getList(){
		_controllerScope.select = '';
		scene.query(function(res){
			_controllerScope.allRows = res.modes;
			_controllerScope.rows = res.modes.filter(function(mode){
				return _loginPool.indexOf(mode.pool) === -1 ? false: true;
			});
			_controllerScope.loading = false;
		});
	}
	
	template.query(function(res){
		$scope.templateNum = res.win_images.concat(res.linux_images).concat(res.other_images).filter(function(item){ return item.status =="alive" }).length;
	});

	$scope.getTotalCount = function(){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.instances_count;
		}, 0);
	};

	$scope.getRunningCount = function(rows){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.running_count;
		}, 0);
	};

	$scope.getShutdownCount = function(rows){
		return $filter("filter")($scope.rows, $scope.searchText).reduce(function(count, item){
			return count + item.instances_count - item.running_count;
		}, 0);
	};

	$scope.filter_school = function(name){
		name ? $scope.rows = $filter("filter")($scope.allRows,{schoolroom:name},true) : $scope.rows = $scope.allRows;
	};

	$scope.pagesize = parseInt(localStorage.scene_pagesize) || 30;
	$scope.currentPage = 1;

	$scope.$watch("pagesize", function(newvalue){
		newvalue && (localStorage.scene_pagesize = newvalue)
	});

	$scope.start = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		rows.forEach(function(row){
			row.running_count = row.instances_count;
			row._selected = false;
		});	
		scene.powerOn({ids : rows.map(function(row){return row.id }),action : "power-on"},function(){
			getList();
		});
	};
	$scope.forceShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面强制关机'>"+
					"桌面强制关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定强制关闭场景吗'>确定强制关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					$modalInstance.close();
					rows.forEach(function(row){
						row.running_count = 0;
						row._selected = false;
					});	
					scene.forcePowerOff({ids : rows.map(function(row){return row.id }),
                        action : "force-power-off"}, function(){
			            getList();
			        });  
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	$scope.natureShutdown = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='桌面自然关机'>"+
					"桌面自然关机</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' localize='确定自然关闭场景吗'>确定自然关闭场景吗?</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'></button></footer></form></div></div></section>",
			
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
			        $modalInstance.close();
			        rows.forEach(function(row){
						row.running_count = 0;
						row._selected = false;
					});	
					scene.powerOff({ids : rows.map(function(row){return row.id }), action : "power-off"}, function(){
                    	getList();
			        })		
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "sm"
		});
	};
	$scope.active =function(id){
		$scope = this;
		scene.active({id :id},function(res){
		},function(res){
			$scope.item.active =$scope.item.active?false:true;		
		})
	}
	// $scope.speed = function(item){
	// 	var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
	// 	$modal.open({
	// 		template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel'>"+
	// 				"开机加速</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;'>确定场景开启开机加速吗</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;'>取消</button></footer></form></div></div></section>",
			
	// 		controller : function($scope, $modalInstance){
	// 			$scope.names = rows.map(function(row){ return row.name }).join(', ');
	// 			$scope.ok = function(){
	// 				$modalInstance.close();
	// 				scene.speed({ids : rows.map(function(row){return row.id }), action : "speed"}, function(){
 //                    	rows.forEach(function(row){
	// 		                row.status = "";
			        
	// 		        	});
	// 		        })		
	// 			},
	// 			$scope.close = function(){
	// 				$modalInstance.close();
	// 			}
	// 		},
	// 		size : "sm"
	// 	});
	// };

	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && !(row.active); });
		var has_running = rows.some(function(row){ return row.running_count});
		if(rows.length==0){
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiDesktopSceneList_TIP1"),
				timeout : 6000
			});
		}
		else{
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='删除场景'>"+
						"删除场景</h4></div><div class='modal-body'><form class='form-horizontal'><p ng-show='has_run' style='margin-bottom:10px;' localize='存在未关机的桌面,仍然删除场景吗'></p><p ng-show='!has_run' style='margin-bottom:10px;' localize='删除场景无法恢复，确定删除场景吗'>删除场景无法恢复，确定删除场景吗?</p><footer class='text-right'><button class='btn btn-primary ' data-ng-click='ok()' localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
				
				controller : function($scope, $modalInstance){
					$scope.has_run =  has_running;
					$scope.ok = function(){
						$modalInstance.close();
						scene.delete({ids : rows.map(function(row){return row.id }), action : "delete"}, function(){
							getList();
				        })		
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
			});
		}
	};

	$scope.enableStartSpeed = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected;});		
		rows.forEach(function(row){
			row.speed = !row.speed;
		});
		$scope.currentItem = null;
	};
}])
;