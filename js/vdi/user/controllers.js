angular.module("vdi.controllers")
.controller("vdiUserAdminManageController", ["$scope", "Admin","$modal", function($scope, UseradminList, $modal){
	$scope.rows = [];$scope.loading = true;
	$scope.owner = JSON.parse(localStorage.loginInfo).keys == $$$powers? true:false;
	$scope.loginName = JSON.parse(localStorage.loginInfo).name;
	
	UseradminList.query(function(res){
		if(!$scope.owner){
			$scope.rows = res.users.filter(function(item){ return item.name == $scope.loginName });
		}
		else{
			$scope.rows = res.users;
		}
		$scope.loading = false;
		$scope.rows.forEach(function(row){
			if(row.last_login !== null){
				var _ip = row.last_login.split(".");
				row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
			}
			else{
				var _ip = null;
				row._ip = null;
			}
		});
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

    $scope.sortIP = function(order){
    	$scope.rows.sort(function(a, b){
    		//return (a._ip > b._ip) ? 1 : -1;
    		if(a._ip === null)
    			return 2;
    		if(a._ip != null && b._ip != null && a._ip > b._ip)
    			return 1;
    		if(a._ip != null && b._ip != null && a._ip <= b._ip)
    			return -1;
    	});
    	if(order){
    		$scope.rows.reverse();
    	}
    };

	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected && row.id !== 1; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });
		var rows = $scope.rows;

		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					setTimeout: 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

					controller : function($scope, $modalInstance){
						$scope.nodelete_rows = nodelete_rows;
						$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
						$scope.ok = function(){
							UseradminList.delete({
								ids: delete_rows.map(function(row){ return row.id; })
							}, function(res){
								delete_rows.forEach(function(item){
									var index = rows.indexOf(item);
									rows.splice(index, 1);
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

}])
.controller("vdiUserCommonManageController", ["$scope","User","$modal", "$http", function($scope, UsercommonList, $modal, $http){
	$scope.href = $Domain;
	$scope.rows = [];$scope.loading = true;
	UsercommonList.query(function(res){
		$scope.rows = res.users;
		$scope.loading = false;
		$scope.rows.forEach(function(row){
			if(row.last_login !== null){
				var _ip = row.last_login.split(".");
				row._ip = (_ip[0] << 16) + (_ip[1] << 8) + Number(_ip[2]) + (_ip[3] / 1000);
			}
			else{
				var _ip = null;
				row._ip = null;
			}
		});
	});
	var WIDTH = $$$I18N.get("GOD_VERSION") == "cloudClassEn" || $$$I18N.get("GOD_VERSION") == "korean" ? 66:50;
    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];

    $scope.sortIP = function(order){
    	$scope.rows.sort(function(a, b){
    		//return (a._ip > b._ip) ? 1 : -1;
    		if(a._ip === null)
    			return 2;
    		if(a._ip != null && b._ip != null && a._ip > b._ip)
    			return 1;
    		if(a._ip != null && b._ip != null && a._ip <= b._ip)
    			return -1;
    	});
    	if(order){
    		$scope.rows.reverse();
    	}
    };

    var _scope = $scope;
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });
		var rows = $scope.rows;
		
		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					setTimeout: 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.nodelete_rows = nodelete_rows;
						$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						UsercommonList.delete({
							ids: delete_rows.map(function(row){ return row.id; })
						},
						function(res){
							delete_rows.forEach(function(item){
								var index = rows.indexOf(item);
								rows.splice(index, 1);
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

	$("#uploadISO").uploadify({
	    'swf'		: 'js/plugin/uploadify/uploadify.swf',
	    'uploader' 	: $Domain + '/thor/user/import',
	    'button_image_url':'',
	    'cancelImage' : 'js/plugin/uploadify/cancel.png',
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
	    'progressData' : 'percentage',
	    // 'removeCompleted': false,
	    'fileTypeExts'   : "*.xls;",
	    'multi'		: false,
	    'height':22,
	    'width':WIDTH,
	    'buttonText': $$$I18N.get("导入"),
	    'onUploadSuccess' : function (file, data, response) {
	    	data = JSON.parse(data);
	    	
	    	switch(data.code){
				case -2:
					location.replace("login.html");
				break;
				case 0:
					var item = data.result;
			        $scope.rows.unshift(item);
			        $scope.$apply();
					location.reload();
			    break;

				default:
					//console.log("API错误码为: " + res.data.code + ", message:" + res.data.message);
					$.bigBox({
						title : $$$MSG.get("PAI_CODE") + data.code,
						content : $$$MSG.get(data.code),
						color : "#C46A69",
						icon : "fa fa-warning shake animated",
						timeout : 6000
					});
				break;
			}
	    },
	    'onUploadError':function(file,errorCode,errorMsg,errorString){
	        if (errorMsg === 413){
				$.smallBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("文件名已存在"),
					color : "#C46A69",
					iconSmall : "fa fa-warning shake animated",
					timeout : 5000
				});
	        }

	    }

	});

}])
.controller("vdiUserDomainController", ["$scope", "$modal", "Server", function($scope,$modal,Server){
	$scope.loading = true;
	$scope.rows = [];

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading=false;

	Server.query(function(response){
		$scope.rows=response.servers;
	},function(){
		//console.log(arguments);
	});

	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var rows = $scope.rows;
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除域控制器'>"+
					"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.name = selected_rows.map(function(row){ return row.host }).join(', ');
				$scope.ok = function(){
					Server.delete({
						ids: selected_rows.map(function(row){ return row.id; })
					},
					function(res){
						selected_rows.forEach(function(item){
							var index = rows.indexOf(item);
							rows.splice(index, 1);
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
	
}])
.controller("vdiUserDomainListController",["$scope", "$modal","Domain", "User",function($scope, $modal,Domain,User){
	$scope.loading = true;
	
	$scope.domainId=parseInt(location.hash.match(/\d+$/)[0]);

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.loading=false;
	$scope.rows=[];

	$scope.oneKeySycing=function(){
		Domain.asycing({"auto":1,"id":$scope.domainId},function(response){
			console.log(response);

			angular.forEach(response.result,function(item,index){
				var i;
				for(i=0;i<$scope.rows.length;i++){
					if(item.id==$scope.rows[i]){
						$scope.rows[i]=item;
					}
				}
				if(i>=$scope.rows.length){
					$scope.rows.push(item);
				}
				//$scope.rows.push(item);
			});
		});
	}

    var _scope = $scope;
	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });
		var nodelete_rows = selected_rows.filter(function(row){ return row.instance_num != 0; });
		var delete_rows = selected_rows.filter(function(row){ return row.instance_num == 0; });
		var rows = $scope.rows;
		
		if(delete_rows.length==0){
			$.bigBox({
					title : $$$I18N.get("INFOR_TIP"),
					content : $$$I18N.get("ADMIN_TIP"),
					setTimeout: 6000
				});
		}
		else 
			$modal.open({
				template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除用户'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='USER_TIPGROUP1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='USER_TIPGROUP2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.nodelete_rows = nodelete_rows;
						$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
						$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');
					$scope.ok = function(){
						User.delete({
							ids: delete_rows.map(function(row){ return row.id; })
						},
						function(res){
							delete_rows.forEach(function(item){
								var index = rows.indexOf(item);
								rows.splice(index, 1);
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

	Domain.query({"id":$scope.domainId},function(response){
		$scope.rows=response.users;
	},function(){
	});
}])
.controller("vdiUserRoleManageController", ["$scope", "$modal", "Roles",function($scope, $modal, roles){
	$scope.rows = [];var _controllerScope = $scope;$scope.loading = true;
	$scope.powers = $$$powers;
	roles.query(function(res){
		$scope.rows = res.result.sort(function(a,b){
			if(a.name === 'Administrator'){
				return -1
			}else if(b.name === 'Administrator'){
				return 1;
			};
			return 0;
		});
		$scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesizes = [30,20,10];
    $scope.pagesize = $scope.pagesizes[0];


    $scope.delete = function(item){
    	var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
    	var nodelete_rows = selected_rows.filter(function(row){ return row.user_num != 0; });
    	var delete_rows = selected_rows.filter(function(row){ return row.user_num == 0; });
    	var rows = $scope.rows;

    	if(delete_rows.length==0){
    		$.bigBox({
    				title : $$$I18N.get("INFOR_TIP"),
    				content : $$$I18N.get("ROEL_TIP"),
    				setTimeout: 6000
    			});
    	}
    	else 
    		$modal.open({
    			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='删除角色'>"+
    					"删除角色</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ROLES1' param1='{{name}}'></p><p style='margin-bottom:20px;' data-ng-if='nodelete_rows.length' data-localize='DELETE_ROLES2' param1='{{nodeleteName}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

    				controller : function($scope, $modalInstance){
    					$scope.nodelete_rows = nodelete_rows;
    					$scope.name = delete_rows.map(function(row){ return row.name }).join(', ');
    					$scope.nodeleteName = nodelete_rows.map(function(row){ return row.name }).join(', ');

    					$scope.ok = function(){
    						roles.delete({
    							ids: delete_rows.map(function(row){ return row.id; })
    						}, function(res){
    							delete_rows.forEach(function(item){
    								var index = rows.indexOf(item);
    								rows.splice(index, 1);
    							});
    							$modalInstance.close();
    						});
    					}
    					$scope.close = function(){
    						$modalInstance.close();
    					}
    				},
    				size : "sm"
    			});
    	};

}])
/* Dialogs */
angular.module("vdi.dialogs");
