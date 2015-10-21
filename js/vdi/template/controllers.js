"use strict";
/* Pages */
angular.module("vdi.controllers")
.controller("vdiTemplateHardwareListController", ["$scope", "$modal", "HardwareTemplate", function($scope, $modal, hardware){
	$scope.rows = [];
	$scope.loading = true;
	var _controllerScope = $scope;
	hardware.query(function(res){
		$scope.rows = res.hardwareList;
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];
	
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除硬件模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_TEMPLATE_H' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.name = rows.map(function(row){ return row.name }).join(', ');
				$scope.ok = function(){
					hardware.delete(
						{
							"instance_type_id": rows.map(function(item){ return item.id })
						},
						function(){
							rows.forEach(function(row){
								_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
							});
						}
					);
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};
}])
.controller("vdiTemplatePresonalDesktopListController",["$scope", "$modal", "TeachTemplate", "PersonTemplate", "Admin", "$interval", "$filter", function($scope, $modal, template, tmpl, admin, $interval, $filter){
	$scope.domain = $Domain;
	$scope.rows = [];
	var _controllerScope = $scope;
	$scope.loading = true;

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows.map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function($event, data){
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

	tmpl.query(function(res){
		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);
		$scope.rows.forEach(function(row){
			var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
			os && os.icon && (row.icon = os.icon);
		});
		$scope.running = res.running;
		$scope.shutoff = res.shutoff;
		$scope.loading = false;
		$scope.personalNames = $scope.rows.map(function(item){ return item.name });
		$scope.sameName = false;
	});

	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = rows.filter(function(row){ if( row.instance_count > 1 ) return row; });
		var delete_rows = rows.filter(function(row){ if( row.instance_count <= 1 ) return row; });console.log(123,delete_rows.length)
		if(delete_rows.length==0)
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTemplatePresonalDesktopList_TIP1"),
					timeout : 6000
				});
		else
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除个人模板'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:10px;' data-ng-if='delete_rows.length!=0' data-localize='DELETE_TEMPLATE_P' param1='{{deleteName}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length!=0' data-localize='NODELETE_TEACH_TEMPLATE' param1='{{nodeleteName}}'>其中' {{1}} '模板关联了其他桌面,不能被删除</p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance, $q){
				$scope.deleteName = delete_rows.map(function(row){ return row.name }).join(', ');
				$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
				$scope.delete_rows = delete_rows;$scope.nodelete_rows = nodelete_rows;
				$scope.ok = function(){
					$q.all(delete_rows.map(function(item){
						return tmpl.delete({ id: item.id })
					}))
					.then(function(res){
						delete_rows.forEach(function(row){
							_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
						});
						console.log(res);
					})
					.catch(function(rej){
						console.error(rej);
					})
					.finally(function(){

					});
					//tmpl.delete({});
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};
	$scope.copy = function(item){
		 $modal.open({
                templateUrl: "views/vdi/dialog/desktop/personal_save_template.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
                    $scope.min_namelength=2;$scope.max_namelength=20;
                    $scope.is_copy = true;
                    admin.query(function(res){
                        $scope.owners = res.users;
                        $scope.owner = $scope.owners[0];
                    });
                    $scope.type = '1';
                    $scope.temCopy = false;
                    $scope.ok = function(){
                		$scope.temCopy = true;
                        tmpl.copy({
                        	name: this.name,
                        	image_id : item.id,
                            type_code: this.type,
                            owner: $scope.owner.id
                        }, function(res){
                        	tmpl.query(function(res){
            					var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
            					newRows.forEach(function(row){
									var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
									os && os.icon && (row.icon = os.icon);
								});
            					_controllerScope.rows.splice(0, _controllerScope.rows.length);
            					Array.prototype.push.apply(_controllerScope.rows,newRows);
            				});
                        });
                        $modalInstance.close();                  		
                    	}

                    $scope.close = function(){
                        $modalInstance.close();
                    };
                } ]
            });
	};

}])
.controller("vdiTemplateTeachDesktopListController",["$scope", "$modal", "TeachTemplate", "PersonTemplate", "$route", "Admin", "TeachDesktop", "$interval", "$filter", function($scope, $modal, template, tmpl, $route,  admin, teachdesktop,$interval, $filter){
	// teachdesktop.query({ id : $route.current.params.id }, function(res){
	// 	console.log(787878,res.result)
	// });

	$scope.domain = $Domain;
	$scope.rows = [];
	
	$scope.images = [];
	$scope.loading = true;

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

	$interval(function(){
		$scope.$root && $scope.$root.$broadcast("imageIDS", $scope.rows.map(function(item){ return item.id }));
	}, 1000);
	$scope.$on("imagesRowsUpdate", function($event, data){

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
		$scope.rows.forEach(function(row){
			if(row.sync_status){
				var syncFaildLen = row.sync_status.filter(function(item){ return item.status === "sync failed" || item.status === "no space left" || item.sch == 'time out'}).length;
				var syncDownloading = row.sync_status.filter(function(item){ return item.status === "downloading" }).length;
				if(syncFaildLen){
					row.sync_status.syncFaild = true;
				}
				if(syncDownloading && !syncFaildLen){
					row.sync_status.syncing = true;
				}	
			}
			
		})
						
		$scope.$root.$broadcast("syncTempl", $scope.rows);
	});

	template.query(function(res){
		$scope.rows = res.win_images.concat(res.linux_images).concat(res.other_images);

		$scope.rows.forEach(function(row){
			var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
			os && os.icon && (row.icon = os.icon);

		});
		$scope.running = res.running;
		$scope.shutoff = res.shutoff;
		$scope.sync_mode = res.sync_mode;
		$scope.loading = false;
		$scope.teachNames = $scope.rows.map(function(item){ return item.name });
		$scope.sameName = false;
	});
	var _controllerScope = $scope;
	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = rows.filter(function(row){ if( row.instance_count > 1 ) return row; });
		var delete_rows = rows.filter(function(row){ if( row.instance_count <= 1 ) return row; });console.log(123,delete_rows.length)

		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("vdiTemplateTeachDesktopList_TIP1"),
					setTimeout: 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除教学模板'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:10px;' data-ng-if='delete_rows.length!=0' data-localize='DELETE_TEMPLATE_T' param1='{{deleteName}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length!=0' data-localize='NODELETE_TEACH_TEMPLATE' param1='{{nodeleteName}}'>其中' {{1}} '模板关联了其他桌面,不能被删除</p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
				controller: function($scope, $modalInstance, $q){
					$scope.deleteName = delete_rows.map(function(row){ return row.name }).join(', ');
					$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
					$scope.delete_rows = delete_rows;$scope.nodelete_rows = nodelete_rows;
					$scope.ok = function(){
						$q.all(delete_rows.map(function(item){
							return template.delete({ id: item.id })
						}))
						.then(function(res){
							delete_rows.forEach(function(row){
								_controllerScope.rows.splice(_controllerScope.rows.indexOf(row), 1);
							});
							console.log(res);
						})
						.catch(function(rej){
							console.error(rej);
						})
						.finally(function(){

						});
						//tmpl.delete({});
						$modalInstance.close();
					};
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size: "sm"
			});
	};
	$scope.syncTem = function(item){
		$scope.loading = false;
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_sync.html",
			controller: function($scope, $modalInstance){
				if(!$scope.sync_status){
					$scope.loading = true;
				}
				$scope.name = item.name;
				$scope.$on("syncTempl", function($event, data){
					var thistmpl = data.filter(function(r){ return r.id === item.id })[0];
					$scope.sync_status = thistmpl.sync_status;
					$scope.loading = false;
				})
				$scope.close = function(){
					$modalInstance.close();
				};
				$scope.Retry = function(temp){
					var data = {image_id: temp.image, server_ip: temp.server_ip, server_id: temp.server_id, version: temp.version}
					template.bt_sync_retry(data, function(res){

					}, function(){})
				};
				$scope.Repair = function(temp){
					var data = {image_id: temp.image, server_ip: temp.server_ip, server_id: temp.server_id, version: temp.version};
					console.log(data)
					template.bt_sync_repair(data, function(res){
						
					}, function(){})
				}
			},
			size: "lg"
			
		})
	};

	$scope.update = function(item){
		$modal.open({
			templateUrl: "views/vdi/dialog/template/template_mode_list.html",
			controller: function($scope, $modalInstance){
				$scope.modes = [];
				template.listModes({ id: item.id }, function(res){console.log(res);
					$scope.modes = res.modes;
				});
				$scope.ok = function(){
					template.applyTemplate({ id: item.id }, function(res){
						/* doSTH */
						$modalInstance.close();
					});
				};
				$scope.close = function(){
					$modalInstance.close();
				};
			}
			
		})
	};
	$scope.trigger = function(){
		$scope.rows.some(function(row){
			row._selected;
		});
	}

	$scope.copy = function(item){
		 $modal.open({
                templateUrl: "views/vdi/dialog/desktop/personal_save_template.html",
                size: "md",
                controller: ["$scope", "$modalInstance", function($scope, $modalInstance){
                    $scope.min_namelength=2;$scope.max_namelength=20;
                    $scope.is_copy = true;
                    admin.query(function(res){
                        $scope.owners = res.users;
                        $scope.owner = $scope.owners[0];
                    });
                    $scope.type = '1';
                    $scope.temCopy = false;
                    $scope.ok = function(){
                		$scope.temCopy = true;
                        template.copy({
                        	name: this.name,
                        	image_id : item.id,
                            type_code: this.type,
                            owner: $scope.owner.id
                        }, function(res){
                        	template.query(function(res){
	                        		var newRows = res.win_images.concat(res.linux_images).concat(res.other_images);
	                        		newRows.forEach(function(row){
										var os = $$$os_types.filter(function(item){ return item.key === row.os_type })[0];
										os && os.icon && (row.icon = os.icon);
									});
	                        		_controllerScope.rows.splice(0, _controllerScope.rows.length);
	                        		Array.prototype.push.apply(_controllerScope.rows,newRows);
	                        	});
                            
                        });
                        $modalInstance.close();                   		
                    	}
                    $scope.close = function(){
                        $modalInstance.close();
                    };
                } ]
            });
	};

	$scope.sync = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='SYNC_TEM'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='SYNC_TEM_TIP' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					template.sync({ image_id: item.id },
					function(res){
						console.log(res)

					},function(error){

					})
					
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};

	$scope.undoSync = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='UNDO_SYNC_TEM'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='TEM_UNDOSYNC' ></p><footer class='text-right' style='margin-top:20px;'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller: function($scope, $modalInstance){
				$scope.ok = function(){
					console.log(11111111111,item)
					template.bt_before_edit_template({ image_id: item.id },
					function(res){
						console.log(res)

					},function(error){

					})
					
					$modalInstance.close();
				};
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size: "sm"
		});
	};

}])

/* Dialogs */
angular.module("vdi.dialogs")
