angular.module("vdi.controllers")
.controller("vdiTerminalClientManageController",["$scope", "$modal", "Client", "SchoolRoom", "$interval", "$filter", function($scope, $modal, client, schoolroom, $interval, $filter){
	$scope.rows = []; $scope.loading = true; $scope.sorttype = ""; var allrows = [];

	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("clientIDS", $filter("paging")($scope.rows, $scope.currentPage, $scope.pagesize).map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("clientsRowsUpdate", function($event, data){
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
	client.query(function(res){
		allrows = res.clients;
		schoolroom.query(function(res){
			var schoolrooms = [];
			res.pools_.forEach(function(item){
				JSON.parse(localStorage.loginInfo).pool.forEach(function(pool){
					if(item.id === pool){
						schoolrooms.push(item)
					}
				})
			})
			$scope.classrooms = schoolrooms;
			var storageClassroom = $scope.classrooms.filter(function(cla){ return cla.id == localStorage.classroom})[0];
			var defaultClassroom = $scope.classrooms[0];
			$scope.select = storageClassroom || defaultClassroom;
			$scope.loading = false;
		});
		allrows.forEach(function(row){
			var _ipClient = row.client_ip.split(".");
			row._ipClient = (_ipClient[0] << 16) + (_ipClient[1] << 8) + Number(_ipClient[2]) + (_ipClient[3] / 1000);
			var _ipTarget;
			if(row.target_ip !== null){
				_ipTarget = row.target_ip.split(".");
				row._ipTarget = (_ipTarget[0] << 16) + (_ipTarget[1] << 8) + Number(_ipTarget[2]) + (_ipTarget[3] / 1000);
			}
			else{
				_ipTarget = null;
				row._ipTarget = null;
			}
		});
		console.log(allrows)
		$scope.running = res.running;
		$scope.shutoff = res.shutoff;
		
	});
	$scope.$watch("select",function(newvalue){
		if(newvalue){
			$scope.rows = allrows.filter(function(item){ return item.pool == newvalue.name});
			localStorage.classroom = newvalue.id;
		}
	});
	
	$scope.selecteds = [];
	$scope.addselect = function(item){
		$scope.selecteds.push(item);
	}
	$scope.sortClientIP = function(order){
		console.log($scope.rows)
		$scope.rows.sort(function(a, b){
			return (a._ipClient > b._ipClient) ? 1 : -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};
	$scope.sortTargetIP = function(order){
		$scope.rows.sort(function(a, b){
			if(a._ipTarget === null)
				return 2;
			if(a._ipTarget != null && b._ipTarget != null && a._ipTarget > b._ipTarget)
				return 1;
			if(a._ipTarget != null && b._ipTarget != null && a._ipTarget <= b._ipTarget)
				return -1;
		});
		if(order){
			$scope.rows.reverse();
		}
	};

    $scope.currentPage = 1;
    $scope.pagesize = Number(localStorage.terminal_pagesize) || 30;
	$scope.$watch("pagesize" , function(newvalue){
		$scope.pagesize = newvalue || 0;
		localStorage.terminal_pagesize = newvalue ? newvalue : 0;
	}); 

    $scope.selectUp = function(){
        var rows = $scope.rows;
        return rows.some(function (row) {
            return row._selected && row.is_up;
        });
    };

	$scope.clientbind = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
	};

	$scope.clientManualSort = function(item){
		$scope.sorttype = "manual";
		$scope.selected_rows = $scope.rows;
	};

	$scope.clientAutoSort = function(item){
		$scope.sorttype = "auto";
		$scope.selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
	};
	$scope.configure = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables != selected_rows.length){
			$.bigBox({
						title : $$$I18N.get("INFOR_TIP"),
						content : $$$I18N.get("vdiTerminalconfigure_TIP"),
						setTimeout: 6000
					});			
		}

	};
	$scope.configurename = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables != selected_rows.length){
			$.bigBox({
						title : $$$I18N.get("INFOR_TIP"),
						content : $$$I18N.get("vdiTerminalconfigureName_TIP"),
						setTimeout: 6000
					});			
		}

	};
	$scope.wakeup = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经唤醒")
			$.bigBox({
				title : $$$I18N.get("INFOR_TIP"),
				content : $$$I18N.get("vdiTerminalClientManage_TIP6"),
				timeout : 6000
			});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='唤醒确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller : function($scope, $modalInstance){
					$scope.name = selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name; }).join(', ');
					$scope.ok = function(){
						$modalInstance.close();
						console.log(selected_rows);
						client.wakeups({
							"method": "wakeup",
							macs: selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_mac; }),
							client_names: selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name; }),
							ids: selected_rows.filter(function(row){
								if(row.is_up == false){
									return row;
								}
							}).map(function(row){
								return row.id;
							})
						}, function(res){
							
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
	$scope.closeTerminal = function(item){
		console.log(111111111,item)
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经关机")
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP7"),
					timeout : 6000
				});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='关机确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP2' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; }).join(', ')
						$scope.ok = function(){
							client.shutdowns({
								"method": "shutdown",
								client_ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; }),
								client_names: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; })
							}, function(res){
								console.log(res);
								$modalInstance.close();
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
	$scope.rebootTerminal = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			//alert("终端已经关机")
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP7"),
					timeout : 6000
				});
		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='重启确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='确定重启吗' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; }).join(', ')
						$scope.ok = function(){
							client.shutdowns({
								"method": "reboot",
								client_ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; }),
								client_names: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name; })
							}, function(res){
								console.log(res);
								$modalInstance.close();
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

	$scope.terminate = function(item){
		var ables = 0;
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == false)
				ables ++;
		})
		if(ables == selected_rows.length)
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP8"),
					timeout : 6000
				});		if(ables != selected_rows.length){
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='中断确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP3' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.client_name }).join(', ');
						$scope.ok = function(){
							client.killSessions({
								ids: selected_rows.filter(function(row){ if(row.is_up == true) return row;}).map(function(row){ return row.id; })
							}, function(res){
								console.log(res);
								$modalInstance.close();
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
	$scope.delete = function(){
		var ables = 0;var rows = $scope.rows;
		var selected_rows = $scope.rows.filter(function(row){ return row._selected; });
		angular.forEach(selected_rows, function(item){
			if(item.is_up == true)
				ables ++;
		})
		if(ables == selected_rows.length ){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP9"),
					timeout : 6000
				});
		}
		else
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除确认'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLIENT_TIPGROUP4' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.name = selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.client_name }).join(', ')
						$scope.ok = function(){
							client.delete({
								client_ids : selected_rows.filter(function(row){ if(row.is_up == false) return row;}).map(function(row){ return row.id; })
							}, function(res){
								console.log(res)
								res.ids.forEach(function(item){
									rows.forEach(function(data){
										if(data.id == item){
											rows.splice(rows.indexOf(data), 1);
										}
									})
								});
								res.ids.forEach(function(item){
									allrows.forEach(function(data){
										if(data.id == item){
											allrows.splice(allrows.indexOf(data), 1);
										}
									})
								});
								console.log(222222222,rows,allrows)
								$modalInstance.close();

							}, function(){});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
				},
				size : "sm"
			});
	};
	$scope.view = function(item){
		window.open("desktopScreenshot.html#" + item.inst_id, "person_desktop_" + item.inst_id);
	};
}])
.controller("vdiTerminalSchoolroomManageController", ["$scope", "SchoolRoom","$modal", function($scope, schoolroom, $modal){
	$scope.rows = [];var _controllerScope = $scope;$scope.loading = true;
	$scope.owner = JSON.parse(localStorage.loginInfo).keys == $$$powers? true:false;

	schoolroom.query(function(res){
		if($scope.owner){
			$scope.rows = res.pools_.sort(function(a,b){
				if(a.name === 'default'){
					return -1
				}else if(b.name === 'default'){
					return 1;
				};
				return 0;
			});
		}
		else{
			var schoolrooms = [];
			res.pools_.forEach(function(item){
				JSON.parse(localStorage.loginInfo).pool.forEach(function(pool){
					if(item.id === pool){
						schoolrooms.push(item)
					}
				})
			})
			$scope.rows = schoolrooms;
		}
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];


	$scope.delete = function(item){

		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.name !== 'default'; })
		var nodelete_rows = selected_rows.filter(function(row){ if( row.sceneCount != 0 || row.terminalCount != 0 ) return row; });
		var delete_rows = selected_rows.filter(function(row){ if( row.sceneCount == 0 && row.terminalCount == 0 ) return row; });

		if(delete_rows.length==0)
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTerminalClientManage_TIP10"),
					timeout : 6000
				});
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教室'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:10px;' data-localize='CLASSROOM_TIPGROUP1' param1='{{deleteName}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length!=0' data-localize='CLASSROOM_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
					controller : function($scope, $modalInstance){
						$scope.deleteName = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
						$scope.delete_rows = delete_rows;$scope.nodelete_rows = nodelete_rows;
						$scope.ok = function(){
							schoolroom.delete({
								ids: delete_rows.map(function(row){ return row.id; })
							}, function(){
								delete_rows.forEach(function(row){
									_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
								});
								$modalInstance.close();
							});
						},
						$scope.close = function(){
							$modalInstance.close();
						}
				},
				size : "sm"
			});
	};

	$scope.changeClass = function(item){
		localStorage.classroom = item.id;
	};
}])

.controller("vdiTerminalSessionManageController", ["$scope", "Session", "$modal", function($scope, session, $modal){
	$scope.rows = [];$scope.loading = true;
	session.query(function(res){
		$scope.rows = res.clients;
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

	$scope.terminate = function(item){

		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
		
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='中断会话'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='SESSION_TIPGROUP1'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						session.delete({
							ids: selected_rows.map(function(row){ return row.id; })
						}, function(res){
							console.log(res);
							$modalInstance.close();
						});
					},
					$scope.close = function(){
						$modalInstance.close();
					}
			},
			size : "sm"
		});

	};

}])
