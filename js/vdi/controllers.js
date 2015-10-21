(function(){"use strict";


angular.module("vdi.controllers", [])

.config(["$filterProvider", function($filterProvider){
	$filterProvider.register("paging", function(){
		return function(items, index, pageSize){
			if(!items instanceof Array) return items;
			var total = items.length;
			var totalPage = Math.ceil(total / pageSize);
			index = Math.min(totalPage, Math.max(1, index));
			return items.slice((index - 1) * pageSize, index * pageSize);
		};
	});
}])

.controller("TaskListController", ["$scope", "Task", "$location", function($scope, task, $location){
    $scope.rows = [];
    var data = {};
    $scope.$on("instanceIDS", function($event, ids){
        data.instances = ids;
    });
    $scope.$on("imageIDS", function($event, ids){
        data.images = ids;
    });
    $scope.$on("clientIDS", function($event, ids){
        data.clients = ids;
    });
    var lists = [], flag = false;
    function schedule(){
        var postData = Object.keys(data).map(function(key){
            return {
                key: key,
                ids: data[key]
            };
        });
        task.post(postData,
            function(res){
                
                $scope.rows = res.results.tasks.filter(function(item){ return JSON.parse(localStorage.loginInfo).real_name ===  item.user});
                
                Object.keys(res.results).forEach(function(key){
                    if(key !== "tasks"){
                        $scope.$root && $scope.$root.$broadcast(key + "RowsUpdate", res.results[key]);
                    }
                });
                for(var i in res.results.notifies){
                    var item = res.results.notifies[i], color = '#004d60';
                    if( lists[item.id] == undefined ){
                        lists[item.id] = item;
                        if(item.waringtype === 0)
                            color = "#c79121";
                        else if(item.waringtype === 1)
                            color = "#004d60";
                        else
                            color = "#C46A69";
                        $.bigBox({
                            title:$$$I18N.get('waringtype'+item.waringtype),
                            content:$$$I18N.get(item.name) + ' (' + item.target + ')',
                            // title : item.id+item.name,
                            // content : item.id+item.content,
                            color : color
                        }, function(){
                            task.put({notify_id: item.id}, function(res){
                                console.log(111,res)
                            })
                        });
                    }
                }
                setTimeout(schedule, 3000);
            },
            function(){ setTimeout(schedule, 10000); }
        );
        for(var k in data){
            data[k] = undefined;
            delete data[k];
        }
    }
    schedule();

    $scope.toggleTaskList = function(){
        $("body").toggleClass("show_prog");
    };

}])
.controller("pageHeaderController", ["$scope", "$http", function($scope, $http){
    $scope.logout = function(){
        $http.get($Domain + "/logout");
        var theme = localStorage.current_theme || "smart-style-0";
        var i18n_code = localStorage.i18n_code;
        localStorage.clear && localStorage.clear();
        localStorage.current_theme = theme;
        localStorage.i18n_code = i18n_code;
        location.replace("login.html");
    };
}])
.controller("LogoController", ["$scope","settings", function($scope, settings){
    $scope.domain = $Domain;
    $scope.version = $$$version;
    $scope.languages = settings.languages;
    $scope.currentLang = settings.currentLang;
}])
.controller("userLoginInfoController", ["$scope", function($scope){
    if(localStorage.loginInfo){
        var userInfo = JSON.parse(localStorage.loginInfo);
        $scope.loginUser = userInfo;
    }
    else{
        localStorage.returnUrl = location.href;
        //location.replace("login.html");
    }
}])

.controller("vdiSummaryController", ["$scope", "Summary",function($scope, summary){


    summary.query(function(res){
        $scope.summary = res.info;       
    });
    
    summary.top_instance(function(res){

        $scope.instances_summary = res.instances_summary;

        $scope.top_instances_list = res.top_instances_list;
    });

    // summary.top_client(function(res){
    //     $scope.clients_summary = res.clients_summary;
    //     $scope.top_clients_list = res.top_client_list;
    // });

    summary.top_logs(function(res){
        $scope.top_logs_list = res.result;
        console.log(res)
    });

    summary.query(function(res){
        $scope.summary = res.info;
        $scope.cpu_rate = ($scope.summary.cpu_rate).toFixed(1); 
        var mem_data = [
            {
                'name':$$$I18N.get("已使用"), 
                'y':parseInt((($scope.summary.mem_used)/($scope.summary.memory_cnt)*100).toFixed(2))
            },
            {
                'name':$$$I18N.get("剩余"),
                'y':parseInt((($scope.summary.mem_remain)/($scope.summary.memory_cnt)*100).toFixed(2))
            }
        ];
        var disk_data = [
            {
                'name':$$$I18N.get("已使用"), 
                'y':parseInt((($scope.summary.disk_used)/($scope.summary.disk_cnt)*100).toFixed(2))
            },
            {
                'name':$$$I18N.get("剩余"),
                'y':parseInt((($scope.summary.disk_remain)/($scope.summary.disk_cnt)*100).toFixed(2))
            }
        ];
        //饼图开始
        angular.element("#3Dmemory").highcharts({
                chart: {
                    type: 'pie',
                    height:170,
                    spacing:[0,0,0,0],
                    backgroundColor:'#fafafa',
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                title: {
                    text: null
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35,
                        dataLabels: {
                            enabled: false,
                            format: ''
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: $$$I18N.get("内存"),
                    data:mem_data
                }]
        });
        angular.element("#3Ddisk").highcharts({
                chart: {
                    type: 'pie',
                    height:170,
                    backgroundColor:'#fafafa',
                    spacing:[0,0,0,0],
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                title: {
                    text: null
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35,
                        dataLabels: {
                            enabled: false,
                            format: ''
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: $$$I18N.get("存储"),
                    data: disk_data
                }]
        }); 
        //饼图结束  

    });

    $scope.view_desktop = function(id){
        window.open("desktopScreenshot.html#" + id, "person_desktop_" + id);
    };

}])


.controller("vdiAboutController", ["$scope", function($scope){}])


.controller("vdiMonitorAlarmController", ["$scope", "SystemAlarm", "$modal", function($scope, alarm, $modal){
    $scope.rows =[];$scope.loading = true;
    var _scope = $scope;
	alarm.query(function(data){
		$scope.rows = data.data;
        $scope.loading = false;
	});

    $scope.currentPage = 1;
    $scope.pagesize = Number(localStorage.alarm_pagesize) || 30;

    $scope.$watch("pagesize", function(newvalue){
        if(newvalue){
            localStorage.alarm_pagesize = newvalue;
        }
    })

    $scope.delete = function(item){
        var rows = item ? [item] : $scope.rows.filter(function(row){ return row._selected; })
        $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='DELETE_ALARM'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='ALARM_DELETE' param1='{{name}}'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.name = rows.map(function(row){ return row.id }).join(', ')
                        $scope.ok = function(){
                            alarm.delete({ids:rows.map(function(row){ return row.id })},function(data){
                                rows.forEach(function(row){
                                    var idx = _scope.rows.indexOf(row);
                                    _scope.rows.splice(idx, 1);
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
    $scope.deleteAll = function(){
        $modal.open({
                template: "<section id='widget-grid'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-ng-click='close()'><span aria-hidden='true'>×</span><span class='sr-only'>Close</span></button><h4 class='modal-title' id='mySmallModalLabel' data-localize='清空确认'>"+
                        "</h4></div><div class='modal-body'><form class='form-horizontal'><p style='margin-bottom:20px;' data-localize='CLEAR_TIP'></p><footer class='text-right'><button class='btn btn-primary' data-ng-click='ok()' data-localize='确定'></button><button class='btn btn-default' data-ng-click='close()' style='margin-left:5px;' data-localize='取消'></button></footer></form></div></div></section>",
                    controller : function($scope, $modalInstance){
                        $scope.ok = function(){
                            alarm.delete({ids:'all'},function(data){
                                _scope.rows.forEach(function(row){
                                    var idx = _scope.rows.indexOf(row);
                                    _scope.rows.splice(idx, 1);
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

.controller("vdiMonitorController", ["$scope","$interval","$http","$location", "Host","PersonDesktop", function($scope,$interval,$http,$location,Host,instance){
    $scope.refresh_time = 5000;

    $scope.cpu_options ={
        options: {
            chart: {
                type: 'area',   
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30, 0, 65, 68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                title: {
                    text: '%',
                    align: 'high',
                    ffset: 0,
                    rotation: 0,
                    y: -20,
                    x: 26

                },
                plotLines: [
                    {
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }
                ]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}%</b><br/>',
                //pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f} GB</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },
            // plotOptions: {
            //     area: {
            //         stacking: 'percent',
            //         // lineColor: '#ffffff',
            //         lineWidth: 1,
            //         marker: {   
            //             lineWidth: 1,
            //             lineColor: '#ffffff'
            //         }
            //     }

            // },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },

            series: [
                // {
                //     name: '空闲', color: "transparent",
                //     marker: {
                //         enabled: false
                //     }
                // },
                // {name: '正在使用', marker: {
                //     enabled: false
                // }},
                // {name: '系统', color: '#f86161', marker: {
                //     enabled: false
                // }},
                // {name: '等待使用', color: '#88de67', marker: {
                //     enabled: false
                // }}

                {name: $$$I18N.get("占用率"), marker: {
                    enabled: false
                }}
            ]

        },
        drawpoint: function (series,data, now) {
            // var y1 = data.cpu.user;
            // var y2 = data.cpu.system;
            // var y3 = data.cpu.iowait;
            // var y0 = 100 - y1 - y2 - y3;

            // series[0].addPoint([now, y0 / 100], true, true);//idel空闲
            // series[1].addPoint([now, y1 / 100], true, true);//user
            // series[2].addPoint([now, y2 / 100], true, true);//system
            // series[3].addPoint([now, y3 / 100], true, true);//iowait
            if(data.cpu.iowait){
                var y0 = (data.cpu.system + data.cpu.user + data.cpu.iowait);
            }
            else 
                var y0 = (data.cpu.system + data.cpu.user);

            series[0].addPoint([now, y0], true, true);
        }
    };

    $scope.mem_options ={
            options:{
                chart: {
                    type: 'area',
                    height: 250,
                    animation: Highcharts.svg, // don't animate in old IE
                    margin: [30, 0, 65, 38],
                },
                title: {
                    text: null
                },
                xAxis: {
                    type: 'datetime',
                },
                yAxis: {
                    lineWidth: 1,
                    tickWidth: 1,
                    title: {
                        text: 'GB',
                        align: 'high',
                        ffset: 0,
                        rotation: 0,
                        y: -20,
                        x: 26

                    },
                    plotLines: [
                        {
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }
                    ]
                },
                tooltip: {
                    pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f} GB</b><br/>',
                    crosshairs: true,
                    shared: true,
                    xDateFormat: '%Y-%m-%d %H:%M:%S'
                },
                legend: {
                    align: 'right',
                    verticalAlign: 'top',
                    y: -15
                },

                series: [
                    {
                        name: $$$I18N.get("己用内存"),
                        color: '#88de67',
                        marker: {
                            enabled: false
                        }
                    }
                ]

            },
            drawpoint: function (series, data, now) {
                var y0 = (data.mem.total - data.mem.free)/ 1024 / 1024 / 1024;

                series[0].addPoint([now, y0], true, true);
            }
        };

    $scope.net_options = {
        options:{
            chart: {
                type: 'spline',
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30,0,65,68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                title: {
                    text: 'KB/s',
                    align: 'high',
                    ffset: 0,
                    rotation: 0,
                    y: -20,
                    x: 40

                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}KB/s</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },
            series: [{
                name:  $$$I18N.get("上行"),
                marker: {
                    enabled: false
                }
            },{
                name:  $$$I18N.get("下行"),
                color: '#88de67',
                marker: {
                    enabled: false
                }
            }]

        },
        drawpoint : function (series, data, now) {
            var y0 = 0;
            var y1 = 0;
            if(data.net.send_speed){
              y0 = data.net.send_speed / 1024;
              y1 = data.net.recv_speed / 1024;
            }
            else{
              y0 = data.disk.read_speed / 1024;
              y1 = data.disk.write_speed / 1024;
            }
            
            series[0].addPoint([now, y0], true, true);
            series[1].addPoint([now, y1], true, true);
        }
    };

    $scope.disk_options = {
        options:{
            chart: {
                type: 'spline',
                height: 250,
                animation: Highcharts.svg, // don't animate in old IE
                margin: [30,0,65,68]
            },

            title: {
                text: null
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                lineWidth: 1,
                tickWidth: 1,
                title: {
                    text: 'KB/s',
                    align: 'high',
                    ffset: 0,
                    rotation: 0,
                    y: -20,
                    x: 40

                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                pointFormat: '<span">{series.name}</span>: <b>{point.y:.1f}KB/s</b><br/>',
                crosshairs: true,
                shared: true,
                xDateFormat: '%Y-%m-%d %H:%M:%S'
            },

            legend: {
                align: 'right',
                verticalAlign: 'top',
                y: -15
            },
            series: [{
                name:  $$$I18N.get("读取"),
                marker: {
                    enabled: false
                }
            },{
                name:  $$$I18N.get("写入"),
                color: '#88de67',
                marker: {
                    enabled: false
                }
            }]

        },
        drawpoint : function (series, data, now) {
            var y0 = data.disk.read_speed / 1024;
            var y1 = data.disk.write_speed /1024 ;

            series[0].addPoint([now, y1], true, true);
            series[1].addPoint([now, y0], true, true);
        }
    };

    $scope.change_server = function(item){
            $scope.item = item;
            $scope.subpath = item.type == 'vm' ? "monitor_vminfo" : "monitor_hostinfo";
            if(item.type != "vm"){
                return;
            }
            instance.get({id:item.id}, function(res){
                 $scope.cur_instance = {'name':res.display_name,
                                        'id':res.id,
                                        'type':res.mode_id ? "teaching" : "personal",
                                        'status':res.status};

        });
    };
    function metric_start(){
        return $interval(function(){
            if($scope.item){
                $scope.loading = true;
                $http.get($Domain+"/thor/"+$scope.subpath+"/"+$scope.item.id).success(function(data){
                    $scope.loading = false;
                    //4个图表directive会监听metric_data,4个图表的数据是一次请求拿下来的
                    if(data.data.msg){
                        //console.log(data.data.msg);
                    }else{
                        $scope.metric_data = data.data;
                    }

                });
            }

        },$scope.refresh_time);
    }

    var load_metric_data = metric_start();

    $scope.$watch('refresh_time',function(newvalue){
        $interval.cancel(load_metric_data);
        load_metric_data = metric_start();
    });

    $scope.$on('$destroy', function() {
        // Make sure that the interval is destroyed
        $interval.cancel(load_metric_data);

    });

    var path = $location.path();
    if(path == '/monitor/desktop'){
        $http.get($Domain+"/thor/monitor_tree").success(function(data){
            $scope.items = data.data.map(function(item){
                item.opened =false;
                return item;
            });
        });
    }else{
        Host.query(function(data){
            $scope.items = data.hosts_list;
            if(data.hosts_list.length > 0)
                $scope.change_server(data.hosts_list[0]);
        });
    }


    //console.log($scope);
    $scope.collapAll = function(){

        $scope.items.map(function(item,index){
            item.opened = false;
            return item;
        })
    };
    $scope.openAll = function(){
        $scope.items.map(function(item,index){
            item.opened = true;
            return item;
        })
    }

}])


})();
