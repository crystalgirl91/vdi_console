angular.module("vdi.controllers")
.controller("vdiPermissionController", ["$scope", "permissionList",function($scope,permission_list){
    permission_list.query(function(res){
    $scope.pmis = {
        "version":res.version,
        "build"  :res.build,
        "instance_num_quota":res.instance_num_quota,
        "license_time":res.license_time,
        "remain_days":res.remain_days,
        };
    });
    $scope.$on('test',function(event,data){
    	$scope.pmis = {
    		"instance_num_quota" : data.instnum,
    		"build" : data.build_version,
    		"version" : data.version,
    		"license_time" : data.time,
            "remain_days" : data.remain_days,
    	}
    })
}])