angular.module("vdi.controllers")
.controller("vdiSystemBackupListController", ["$scope","$modal", "SystemBackup", function($scope,$modal, backup){
	$scope.rows = [];$scope.loading = true;
	backup.query(function(data){
		$scope.rows = data.ret;
		$scope.loading = false;
	})

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	var controller_scope = $scope;
	$scope.getURL = function(item){
		return $Domain + "/thor/admin/download?file_name=" + item.name;
	};
	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='BACKUP_DE'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='BACKUP_DE_CONTENT'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						$modalInstance.close();
						backup.delete({name:item.name}, function(data){
								//TODO
							var idx=controller_scope.rows.indexOf(item);
							controller_scope.rows.splice(idx,1);
						})
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
		
	};
	$scope.add = function(){
		$scope.submiting = true;
		backup.backup({name:$scope.backupname, method:"backup"}, function(data){
			backup.query(function(res){
					$scope.submiting  = false;
					$scope.backupname = null;
					$scope.rows.splice(0,$scope.rows.length);
					$scope.rows = res.ret;
			})
		})
	};
}])
.controller("vdiSystemISOListController", ["$scope", "SystemISO", "$modal","$rootScope", "$filter", function($scope, iso, $modal, $rootScope, $filter){
	// var encodeHTML = function(txt, con){
	// 	con = con || document.createElement("div");
	// 	while(con.firstChild){
	// 		con.removeChild(con.firstChild);
	// 	}
	// 	return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
	// };
	// var format = function(tmpl){
	// 	var data = Array.prototype.slice.call(arguments, 0);
	// 	return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function(match, param){
	// 		if(data[param]){
	// 			return encodeHTML(data[param]);
	// 		}
	// 		return match;
	// 	}) : "";
	// };

	// $("#uploadISO").uploadify({
	//     'swf'		: 'js/plugin/uploadify/uploadify.swf',
	//     'uploader' 	: $Domain + '/thor/isos',
	//     'button_image_url':'',
	//     'cancelImage' : 'js/plugin/uploadify/cancel.png',
	//     'fileSizeLimit' :'2GB',
	//     'onFallback':function(){
	//         var message = $$$I18N.get("Flash 插件没有安装");
	//         $.bigBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content : message,
	// 				color : "#C46A69",
	// 				icon : "fa fa-warning shake animated",
	// 				timeout : 6000
	// 			});
	//     },
	//     'onUploadStart':function(){
	//     		$.bigBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content : $$$I18N.get("INFOR_UPISO"),
	// 				iconSmall : "fa fa-warning shake animated",
	// 				timeout : 5000
	// 			});
	//     },
	//     'onSelectError':function(file, errorCode, errorMsg){
	//         this.queueData.errorMsg = $$$I18N.get('文件不会被添加到队列中')+"\n";
	//         var settings = this.settings;

	//         if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
	//             switch(errorCode) {
	//                 case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
	//                     if(settings.queueSizeLimit > errorMsg) {
	//                         this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED"), errorMsg);
	//                     }
	//                     else{
	//                         this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED2"), settings.queueSizeLimit);
	//                     }
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
	//                     this.queueData.errorMsg += format($$$I18N.get("FILE_EXCEEDS_SIZE_LIMIT"), file.name,settings.fileSizeLimit);
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
	//                     this.queueData.errorMsg += format($$$I18N.get("ZERO_BYTE_FILE"), file.name);
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
	//                     this.queueData.errorMsg += format($$$I18N.get("INVALID_FILETYPE"), file.name,settings.fileTypeDesc );
	//                     break;
	//             }
	//         }
	//     },
	//     'queueSizeLimit':1,
	//     'progressData' : 'speed',
	//     // 'removeCompleted': false,
	//     'fileTypeExts'   : "*.iso; *.iSo; *.isO; *.iSO; *.Iso; *.ISo; *.IsO; *.ISO;",
	//     'multi'		: false,
	//     'height':32,
	//     'width':78,
	//     'buttonText': $$$I18N.get("上传iso"),
	//     'onUploadSuccess' : function (file, data, response) {
	//     	data = JSON.parse(data);
	//     	switch(data.code){
	// 			case -2:
	// 				location.replace("login.html");
	// 				//alert("需要重新登录");
	// 			break;
	// 			case 0:
	// 				var item = data.result;
	// 		        $scope.rows.unshift(item);
	// 		        $scope.$apply();
	// 		    break;
	// 			default:
	// 				$.bigBox({
	// 					title : $$$MSG.get("PAI_CODE") + data.code,
	// 					content :$$$MSG.get(data.code),
	// 					color : "#C46A69",
	// 					icon : "fa fa-warning shake animated",
	// 					timeout : 6000
	// 				});
	// 			break;
	// 		}
	//     },
	//     'onUploadError':function(file,errorCode,errorMsg,errorString){
	//         if (errorMsg === 413){
	// 			$.smallBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content : $$$I18N.get("文件名已存在"),
	// 				color : "#C46A69",
	// 				iconSmall : "fa fa-warning shake animated",
	// 				timeout : 5000
	// 			});
	//         }
	//     }
	// });

// if(progressInfor.xhr){
// 	progressInfor.xhr.upload.onprogress=function(e){ 
// 		console.log($scope)
// 		$rootScope.$broadcast("progress", {
// 			loaded: e.loaded,
// 			position: e.position,
// 			total: e.total,
// 			totalSize: e.totalSize
// 		})
// 	 };

// }
	$scope.rows = [];$scope.loading = true;
	rows = [];
	function loadIso(){
		iso.query(function(res){
			$scope.rows = res.isos;
			$scope.loading = false;
			var test = /Windows 7/;
			$scope.rows.forEach(function(item){
				//item.os_type = $$$os_types[Math.random() * $$$os_types.length ^ 0].key;
				if(item.os_type){
					var type = $$$os_types.filter(function(type){ return type.key === item.os_type; })[0];
					if(type){
						item.os_type = type;
					}else if (test.test(item.os_type)){
						item.os_type = $$$os_types.filter(function(type){ return type.key === 'Windows 7' })[0];
					}
				}
				item.editable = false;
			});
			angular.copy($scope.rows,rows);
			$scope.select = "";
		});		
	}
	loadIso();

	$scope.filter_iso = function(item){
		if(!item){
			$scope.rows = rows;
			return true;
		}
		$scope.rows = rows.filter(function(row){
			return (item=='package'||item=='other')?(row.os_type['key']==item):(row.os_type['key']!='package'&&row.os_type['key']!='other');
		});
	};
	$scope.finishUpload = function(){
		loadIso();
	};
	$scope.os_types = $$$os_types;
	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.change = function(item){
		var new_item = JSON.parse(JSON.stringify(item));
		if(new_item.os_type){
			new_item.os_type = item.os_type.key;
		}
		iso.update(new_item, function(res){
			rows.map(function(row){
				if(res.result && row.id == res.result.id){
					row.os_type = item.os_type;
				}
				return row;
			})
		});
		$scope.filter_iso($scope.select);
	};
	$scope.hideButton = function(){
		$scope.uploadStart = false;
	}
	var _scope = $scope;
	$scope.delete = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='ISO_DELETE'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_ISO_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.name = item.name;
				$scope.ok = function(){
					iso.delete({
						ids: [item.id]
					}, function(res){
						var idx = _scope.rows.indexOf(item);
						_scope.rows.splice(idx, 1);
						rows.splice(rows.indexOf(item), 1);
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
}])
.controller("vdiSystemLogListController", ["$scope", "SystemLog", "$modal", function($scope, log, $modal){
	$scope.rows = [];
	$scope.loading = true;

	$scope.currentPage = 1;
	$scope.pagesize = 30;
	$scope.totalCount = 0;

	var _start = 0;
	var fn_get_logs = function(){
		var size = Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
		log.query({
			displayLength: size,
			displayStart: ($scope.currentPage - 1) * size,
			search: ""
		}, function(data){
			$scope.rows = data.data.sort(function(a,b){
				return b.datetime - a.datetime;
			});
			$scope.totalCount = data.totalRecords;
			$scope.loading = false;
			_start = data.displayStart;
		});
	};
	fn_get_logs();

	$scope.logPageSizeChange = function(){
		$scope.currentPage = $scope.pagesize ? Math.floor(_start / $scope.pagesize) + 1 : 0;
		fn_get_logs();
	};
	$scope.logPageChange = function(){
		fn_get_logs();
	};

	$scope.delete = function(item){
		var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; });

		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_LOG'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_LOG_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					log.delete({ids:rows.map(function(row){ return row.id })},function(data){
						fn_get_logs();
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
	$scope.deleteAll = function(){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_RIZHI'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELETE_RIZHI_CONTENT'></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					log.delete({ids:'all'}, function(data){
						fn_get_logs();
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
}])
.controller("vdiSystemUpgradeListController", ["$scope","SystemUpgrade","$modal", function($scope, upgrade, $modal){
	// var encodeHTML = function(txt, con){
	// 	con = con || document.createElement("div");
	// 	while(con.firstChild){
	// 		con.removeChild(con.firstChild);
	// 	}
	// 	return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
	// };
	// var format = function(tmpl){
	// 	var data = Array.prototype.slice.call(arguments, 0);
	// 	return typeof tmpl === "string" ? tmpl.replace(/\{\{([^\}]+)?\}\}/g, function(match, param){
	// 		if(data[param]){
	// 			return encodeHTML(data[param]);
	// 		}
	// 		return match;
	// 	}) : "";
	// }
	// $("#uploadISO").uploadify({
	//     'swf'		: 'js/plugin/uploadify/uploadify.swf',
	//     'uploader' 	: $Domain + '/thor/admin/upgrade',
	//     'button_image_url':'',
	//     'cancelImage' : 'js/plugin/uploadify/cancel.png',
	//     'fileSizeLimit' :'2GB',
 //        'onFallback':function(){
 //            var message =  $$$I18N.get("Flash 插件没有安装");
 //            $.bigBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content : message,
	// 				color : "#C46A69",
	// 				icon : "fa fa-warning shake animated",
	// 				timeout : 6000
	// 			});
 //        },
 //        'removeCompleted': true,
 //        'fileTypeExts'   : "*.bin;",
 //        'multi': false,
 //        'height':32,
 //        'width':100,
 //        'buttonText': $$$I18N.get("上传系统包"),
 //        'onSelectError':function(file, errorCode, errorMsg){
	//         this.queueData.errorMsg = $$$I18N.get('文件不会被添加到队列中')+"\n";
	//         var settings = this.settings;
	//         if ($.inArray('onSelectError', settings.overrideEvents) < 0) {
       	
	//             switch(errorCode) {
	//                 case SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED:
	//                     if(settings.queueSizeLimit > errorMsg) {
	//                         this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED"), errorMsg);
	//                     }
	//                     else{
	//                         this.queueData.errorMsg += format($$$I18N.get("QUEUE_LIMIT_EXCEEDED2"), settings.queueSizeLimit);
	//                     }
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
	//                     this.queueData.errorMsg += format($$$I18N.get("FILE_EXCEEDS_SIZE_LIMIT"), file.name,settings.fileSizeLimit);
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
	//                     this.queueData.errorMsg += format($$$I18N.get("ZERO_BYTE_FILE"), file.name);
	//                     break;
	//                 case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
	//                     this.queueData.errorMsg += format($$$I18N.get("INVALID_FILETYPE"), file.name,settings.fileTypeDesc );
	//                     break;
	//             }
	//         }
	//     },
 //        'onUploadSuccess' : function (file, data, response) {
 //        	data = JSON.parse(data);
        	
 //        	switch(data.code){
	// 			case -2:
	// 				location.replace("login.html");
	// 				//alert("需要重新登录");
	// 			break;
	// 			case 0:
	// 				upgrade.query(function(data){
	// 					$scope.rows = data.versions
	// 				});
	// 		    break;
	// 			default:
	// 				$.bigBox({
	// 					title : $$$MSG.get("PAI_CODE") + data.code,
	// 					content : $$$MSG.get(data.code),
	// 					color : "#C46A69",
	// 					icon : "fa fa-warning shake animated",
	// 					timeout : 6000
	// 				});
	// 			break;
	// 		}
 //        },
 //        'onUploadError':function(file,errorCode,errorMsg,errorString){
 //            if (errorMsg == 413){
	// 			$.smallBox({
	// 				title : $$$I18N.get("INFOR_TIP"),
	// 				content: $$$I18N.get("不是正确的系统包格式"),
	// 				color : "#C46A69",
	// 				iconSmall : "fa fa-warning shake animated",
	// 				timeout : 5000
	// 			});
 //            }else{
	// 			$.bigBox({
	// 				title: $$$I18N.get("INFOR_TIP"),
	// 				content : $$$I18N.get("上传的版本低于现在的版本"),
	// 				color : "#C46A69",
	// 				iconSmall : "fa fa-warning shake animated",
	// 				timeout : 5000
	// 			});
 //            }
 
 //        }
 //    });

	
	$scope.loading = true;
	function getList(){
		$scope.rows = [];
		upgrade.query(function(data){
			var _data = data.versions;
			var new_data = {};
			 _data.forEach(function(d,idx){
			 	d._idx = idx;
			 	if(new_data[d.owner]){
			 		new_data[d.owner].push(d);
			 	}else{
			 		new_data[d.owner] = [d];
			 	}
			 });
			 Object.keys(new_data).forEach(function(i){
			 	$scope.rows.push(new_data[i]);
			 });
			$scope.loading = false;
		});
	}
	getList();
	$scope.viewDetail = function(witch){
		$modal.open({
			resolve:{
				modal_data: function(){
					return witch;
				}
			},
			backdrop:'static',
			controller:"systemUpgradeDetailDialog",
			templateUrl:"views/vdi/dialog/system/system_upgrade_detail.html",
			size:'md'
		});
	}


	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	// $scope.upgrade = function(ver){
	// 	upgrade.upgrade(ver, function(res){
	// 		for(var n in res.result){
	// 			ver[n] = res.result[n];
	// 			if(n == res.result.length-1)
	// 				location.reload();
	// 		}
	// 	});
	// };
	$scope.finish = function(){
		getList();
	};
	$scope.upgrade = function(item){
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' localize='升级'>"+
							"升级</h4></div><div class='modal-body'><form class='form-horizontal'><p  style='margin-bottom:20px;' localize='UPGRADEMESS'>升级完成后会重启服务器，所有未完成操作正在运行的虚拟机状态将丢失，是否立即升级？</p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' localize='确定'>确定</button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' localize='取消'>取消</button></footer></form></div></div></section>",
					
			controller : function($scope, $modalInstance){
				$scope.ok = function(){
					item['auto'] = true;
					upgrade.upgrade(item, function(){
						$modalInstance.close();
					});
					
				},
				$scope.close = function(){
					$modalInstance.close();
				}
			},
			size : "md"
		});
	};
}])
.controller("vdiSystemUSBListController", ["$scope", "$modal", "SystemUSB", function($scope, $modal, systemusb){
	$scope.rows = [];
	systemusb.get(function(res){
		//$scope.rows = [{id: 1, class_id: '0x00', priority: 2, rule_name: "ffff", product_id: "0x1111", vendor_id: "0x1234", allow: true}];
		$scope.rows = res.result;
		$scope.rows.forEach(function(item){
			item.class_id = { key: item.class_id, value: $$$I18N.get(item.class_id)};
		})
	})

	$scope.currentPage = 1;
	$scope.pagesizes = [10,20,30];
	$scope.pagesize = $scope.pagesizes[0];

	$scope.delete = function(item){
		var selected_rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected });
		var rows = $scope.rows;
		
		$modal.open({
			template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELE_USB'>"+
						"</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='DELE_USB_TIP'=></p><footer  class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",

				controller : function($scope, $modalInstance){
					$scope.ok = function(){
						systemusb.delete({ids: selected_rows.map(function(row){ return row.id; })},function(res){
							selected_rows.forEach(function(item){
								var index = rows.indexOf(item);
								rows.splice(index, 1);
							});
						})

						$modalInstance.close();
					},
					$scope.close = function(){
						$modalInstance.close();
					}
				},
				size : "sm"
		});
		
	};
}])