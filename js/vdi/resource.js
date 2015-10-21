"use strict";

angular.module("vdi.resource", [])

.factory("Task", ["$resource", function($resource){
	return $resource($Domain + "/thor/home/tasklog", null, {
		query: { method: "GET", isArray: false },
		post: { method: "POST" },
		put: { method: "PUT" }
	});
}])
.factory("Summary", ["$resource", function($resource){
	return $resource($Domain + "/thor/home", null, {
		query: { method: "GET", isArray: false},
		top_logs: { method: "GET", isArray: false, url: $Domain + "/thor/home/top_logs"},
        top_instance: {method:"GET", isArray: false, url:$Domain + "/thor/home/top_instance"},
        top_client: {method:"GET", isArray: false, url:$Domain + "/thor/home/top_client"}
	});
}])

/* 主机－集群 */
.factory("Host", ["$resource", function($resource){
	return $resource($Domain + "/thor/hosts", null, {
		query:
			{ method: "GET", isArray: false},
        query_deleted:
            {method:"GET", url:$Domain+"/thor/hosts/deleted"},
        renew_deleted:
            {method:"POST", url:$Domain+"/thor/hosts/deleted"},
        power_off:
            {method: "POST", url:$Domain+"/thor/host/maintainHost", params:{action:'poweroff_host'}},
        reboot:
            {method: "POST", url:$Domain+"/thor/host/maintainHost", params:{action:'reboot_host'}}
	});
}])

/* 主机－单个 */
.factory("HostManage", ["$resource", function($resource){
	return $resource($Domain + "/thor/host/:id", {id:"@id"}, {
        modify_pwd:
            {method:"PUT"},
        external_ip:
        	{method:"POST", url:$Domain + "/thor/host/external_ip"},
        log_down:
            {method:"POST", url:$Domain + "/thor/host/log/:id", params:{id: "@id" }, isArray: false},
        query:
            {method:"GET"}
	});
}])

.factory("Network", ["$resource", function($resource){
	return $resource($Domain + "/thor/networks", { id: "@id" }, {
		query:
			{ method: "GET", isArray: false, params: null},
		get:
			{ method: "GET", url:$Domain + "/thor/network/:id", params: { id: "@id" }, isArray: false},
		delete:
			{ method: "PUT",  url:$Domain + "/thor/network/fixedIp"},
		save:
			{ method: "POST", url:$Domain + "/thor/network/fixedIp"},
		add:
			{ method: "POST", url:$Domain + "/thor/network/add"},
		delete_network:
			{ method: "DELETE", url:$Domain + "/thor/networks"},
	  	enable_dhcp:
	  	{ method: "POST", url:$Domain + "/thor/network/:id"}

	});

}])


.factory("Storage", ["$resource", function($resource){
	
	return $resource($Domain + "/thor/storage", null, {
		query:
			{method: "GET", url:$Domain + "/thor/storages", isArray: false },

		get:
			{method: "GET", url:$Domain + "/thor/storage/", isArray: false},
		getScsi:
			{method: "GET", url:$Domain + "/thor/storage/getScsi"},
		getLun:
			{method: "GET", url:$Domain + "/thor/storage/getLun"},
		getFCLun:
			{method: "GET", url:$Domain + "/thor/storage/getFCLun"},
        save:
            {method:"POST", url:$Domain + "/thor/storage"},
        delete: {method:"DELETE", url:$Domain + "/thor/storage"},
        exsist: {method:"GET", url:$Domain + "/thor/storage/storageinuse"}
	});
}])
/*  ??? */
.factory("HostServiceManage", ["$resource", function($resource){
	var res = $resource($Domain + "/thor/host/services", null, {
		"query":
			{ method: "GET", isArray: false},
        "start":
            {method:"GET", isArray:false, url:$Domain + "/thor/host/services/start"}
	});
	return res;
}])


.factory("HostNetworkManage", ["$resource", function($resource){
	var res = $resource($Domain + "/thor/host/networkInfo", null, {
		"query": {method: "GET", isArray: false},
        "save":{method:"POST"}
	});
	return res;
}])


/* 桌面 */
.factory("Scene", ["$resource", function($resource){
	return $resource($Domain + "/thor/pool/modes", null, {
		query:
			{ method: "GET", isArray: false },
		get:
			{ method: "GET", url: $Domain + "/thor/pool/mode/:id", params: {id: "@id"}},
		update:
			{ method: "POST", url: $Domain + "/thor/pool/mode/:id", params: {id: "@id"} },
		active:
			{ method: "PUT", url: $Domain + "/thor/pool/mode", params: {id: "@id"} },
		"powerOn":
			   {method: "POST", url: $Domain + "/thor/pool/mode/action"},
	    "powerOff":
			   {method: "POST", url: $Domain + "/thor/pool/mode/action"},
	    "forcePowerOff":
			   {method: "POST", url: $Domain + "/thor/pool/mode/action"},
		"haConfig":
			{ method: "GET", url: $Domain + "/thor/pool/mode/haConfig/:id", params:{id: "@id"}}

	});
}])
.factory("TeachDesktop", ["$resource", function($resource){
	return $resource($Domain + "/thor/instance/mode/:id", { id: "@id" }, {
		query:
			{ method: "GET", isArray: false },
		"delete":
			{ method:"DELETE", url: $Domain + "/thor/instances" },
		reset:
			{ method:"POST" , url:$Domain + "/thor/instance/mode/reset"},
		save:
			{ method:"POST" },
		get:
			{ method: "GET", url: $Domain + "/thor/instance/:id", params: { id: "@id" }, isArray: false },

		start:
			{ method: "POST", url: $Domain + "/thor/instances/starts" },
		shutdown:
			{ method: "POST", url: $Domain + "/thor/instances/shutdowns" },
		pause:
			{ method: "POST", url: $Domain + "/thor/instances/pause" },
		resume:
			{ method: "POST", url: $Domain + "/thor/instances/unpause" },
		reboots:
			{ method: "POST", url: $Domain + "/thor/instances/reboots" },
		screenshot:
			{ method: "POST", url: $Domain + "/thor/instances/screenshot" },
		list_snapshot:
			{ method: "GET", url: $Domain + "/thor/instances/snapshot" },
		take_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot" },
		restore_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot" },
		delete_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot" }
	});
}])
.factory("PersonDesktop", ["$resource", function($resource){
	return $resource($Domain + "/thor/instance/:id", { id: "@id" }, {
		query:
			{ method: "GET", url: $Domain + "/thor/instances", isArray: false },
		"delete":
			{ method:"DELETE", url: $Domain + "/thor/instances" },
		save:
			{ method:"POST", url: $Domain + "/thor/instance" },
		get:
			{ method: "GET", isArray: false },
		update:
			{ method: "PUT" },

		start:
			{ method: "POST", url: $Domain + "/thor/instance/starts" },
		shutdown:
			{ method: "POST", url: $Domain + "/thor/instance/shutdowns" },
		pause:
			{ method: "POST", url: $Domain + "/thor/instance/pause" },
		resume:
			{ method: "POST", url: $Domain + "/thor/instance/unpause" },
		reboot:
			{ method: "POST", url: $Domain + "/thor/instance/reboots" },
		migrate : 
			{ method: "post",url: $Domain + "/thor/instance/livemigration/:id" , params: { "id": "@id" } },
		screenshot:
			{ method: "POST", url: $Domain + "/thor/instances/screenshot/:id", params: { "id": "@id" } },
		list_snapshot:
			{ method: "GET", url: $Domain + "/thor/instances/snapshot/:id", params: { "id": "@id" } },
		take_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot/:id", params: { "id": "@id" } },
		restore_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot/:id", params: { "id": "@id" } },
		delete_snapshot:
			{ method: "POST", url: $Domain + "/thor/instances/snapshot/:id", params: { "id": "@id" } },
		saveAsTemplate:
			{ method: "POST", url: $Domain + "/thor/instance/saveTemplate" }
	});
}])

//教学桌面--桌面修改
.factory("SenceAlter", ["$resource", function($resource){
	var res = $resource($Domain + "/thor/pool/mode/new", null, {
		"query": 
		       {method: "GET", isArray: false},
		"save": 
		       {method: "POST"}
	});
	return res;
}])

// teach and person can use this
.factory("VMCommon", ["$resource", function($resource){
	var base_url = $Domain + "/thor/instance";
	return $resource(base_url, { id: "@id" }, {
		"start":
			{ method: "POST", url: base_url +"/starts"},
		"shutdowns":
			{ method: "POST", url: base_url +"/shutdowns"},
		"pause":
			{ method: "POST", url: base_url + "/pause"},
		"resume":
			{ method: "POST", url: base_url + "/unpause"},
		"reboots":
			{ method: "POST", url: base_url + "/reboots"},
		"screenshot":
			{ method: "POST", url: base_url + "/screenshot"},
		"list_snapshot":
			{ method: "GET", url:base_url + "/snapshot"},
		"take_snapshot":
			{ method:"POST", url:base_url + "/snapshot"},
		"restore_snapshot":
			{ method:"POST", url:base_url + "/snapshot"},
		"delete_snapshot":
			{ method:"DELETE", url:base_url + "/snapshot"}
	});
}])


/* 用户 */
.factory("Roles", ["$resource", function(res){
	return res($Domain + "/thor/user/permissions", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/permissions", isArray: false},
		update:
			{method: "PUT", url: $Domain + "/thor/user/permissions" }
	});
}])
.factory("Admin", ["$resource", function(res){
	return res($Domain + "/thor/user/manager", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/manager", isArray: false},
		update: 
			{method: "PUT", url: $Domain + "/thor/user/manager" }
	});
}])
.factory("User", ["$resource", function(res){
	return res($Domain + "/thor/user/common", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/common", isArray: false},
		update: 
			{method: "PUT", url: $Domain + "/thor/user/common" }
	});
}])
.factory("Server", ["$resource",function($resource){
	return $resource($Domain + "/thor/user/server", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/user/server"},
		get: 
			{ method: "GET", url: $Domain + "/thor/user/info/:id", params: { "id": "@id" }, isArray:false},
		update: 
			{ method: "PUT", url: $Domain + "/thor/user/server",  isArray:false},
		create:
			{ method: "POST", url: $Domain + "/thor/user/server"},
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" }, isArray:false},
		listDomain:
			{ method: "GET", url: $Domain + "/thor/user/server/:id", params: { "id": "@id" }}
	});
}])
.factory("Domain", ["$resource",function($resource){	
	return $resource($Domain + "/thor/user/domain/:id", { "id": "@id" }, {
		list:
			{method: "GET", url: $Domain + "/thor/user/get_users"},
		query:
			{ method: "GET", url: $Domain + "/thor/user/domain/:id",params:{"id":"@id"}},
		asycing:
			{ method: "POST", url: $Domain + "/thor/user/domain/:id", params: { "auto": "@auto" }, isArray: false},
		get:
			{ method: "GET", url: $Domain + "/thor/user/ou/:id",params:{"id":"@id"}},
		"delete":
			{ method: "DELETE", url:"/thor/user/common",isArray: false}
	});
}])

/*  终端  */
.factory("Session", ["$resource", function($resource){
	return $resource($Domain + "/thor/client/session", null, {
		query: { method: "GET", url: $Domain + "/thor/client/session", isArray: false },
		
		"delete": {method: "DELETE"}
		
	});
}])
.factory("SchoolRoom", ["$resource", function($resource){
 	return $resource($Domain + "/thor/pools", null, {
 		query: { method: "GET", isArray: false },
		save :
			{ method: "POST", url: $Domain + "/thor/pool" },
		"delete":
			{ method: "DELETE"},
		update:
			{ method: "PUT", url: $Domain + "/thor/pool" }
 	});
 }])
.factory("Client", ["$resource", function($resource){
	var res = $resource($Domain + "/thor/client", { id: "@id" }, {
		query:
			{ method: "GET", isArray: false, url: $Domain + "/thor/clients" },
		list:
			{ method: "GET", isArray: false, url: $Domain + "/thor/client/pool/:id" },
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/clients" },
		get:
			{ method: "GET", url: $Domain + "/thor/client/:id" },
		getConfig:
			{ method: "GET", url: $Domain + "/thor/client/config/:id", params: { "id": "@id" } },
		alive:
			{ method: "GET", url: $Domain + "/thor/client/alive" },
		assignIps:
			{ method: "POST", url: $Domain + "/thor/clients" },
		modifyConfig:
			{ method: "POST", url: $Domain + "/thor/client/config" },
		changeNames:
			{ method: "POST", url: $Domain + "/thor/client/changeNames" },
		changePools:
			{ method: "POST", url: $Domain + "/thor/client/changePools" },
		shutdowns:
			{ method: "POST", url: $Domain + "/thor/clients" },
		seePwd:
			{ method: "GET", url: $Domain + "/thor/client/seePwd" },
		wakeups:
			{ method: "POST", url: $Domain + "/thor/clients" },
		killSessions:
			{method: "DELETE", url: $Domain + "/thor/client/session"},
		polling:
			{method: "GET", url: $Domain + "/thor/client/order"},//轮询
		sorting:
			{method: "POST", url: $Domain + "/thor/client/order"},//开始排序
		setPlaceholder:
			{method: "PUT", url: $Domain + "/thor/client/order"},//设置占位
		cancelsort:
			{method: "DELETE", url: $Domain + "/thor/client/order"}//取消排序

	});
	return res;
}])

/* 模板 */
.factory("registerTemplate", ["$resource", function(res){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "get", url: $Domain + "/thor/image/register" },
		update:
			{ method: "POST", url: $Domain + "/thor/image/register" }
	});
}])
.factory("TeachTemplate", ["$resource", function(res){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/1", isArray: false },
		update:
			{ method: "POST", url: $Domain + "/thor/image/modify_template/:id", params: { id: "@id" } },
		listModes:
			{ method: "GET", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" }, isArray: false },
		applyTemplate:
			{ method: "POST", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" } },
		status:
			{ method: "GET", url: $Domain + "/thor/image/status/:id", params: { id: "@id" } },
		copy:
			{ method: "POST", url: $Domain + "/thor/image/clone_template"},
		sync:
			{ method: "post", url: $Domain + "/thor/image/bt_sync_template" },
		sync_status:
			{ method: "GET", url: $Domain + "/thor/image/bt_sync_status" },
		bt_before_edit_template:
			{ method: "POST", url: $Domain + "/thor/image/bt_before_edit_template" },
		bt_save_template:
			{ method: "POST", url: $Domain + "/thor/image/bt_save_template" },
		bt_prev_save_template:
			{ method: "POST", url: $Domain + "/thor/image/bt_prev_save_template" },
		bt_sync_retry:
			{ method: "POST", url: $Domain + "/thor/image/bt_sync_retry" },
		bt_sync_repair:
			{ method: "POST", url: $Domain + "/thor/image/bt_sync_repair" }
	});
}])
.factory("PersonTemplate", ["$resource", function(res){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/2", isArray: false },
		update:
			{ method: "POST", url: $Domain + "/thor/image/modify_template/:id", params: { id: "@id" } },
		listModes:
			{ method: "GET", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" }, isArray: false },
		applyTemplate:
			{ method: "POST", url: $Domain + "/thor/image/update_mode_instance/:id", params: { id: "@id" } },
		status:
			{ method: "GET", url: $Domain + "/thor/image/status/:id", params: { id: "@id" } },
		copy:
			{ method: "POST", url: $Domain + "/thor/image/clone_template"}
	});
}])
.factory("HardwareTemplate", ["$resource", function(res){
	return res($Domain + "/thor/image", null, {
		query:
			{ method: "GET", url: $Domain + "/thor/image/hardwares", isArray: false },
		"delete":
			{ method: "DELETE", url: $Domain + "/thor/image/hardwares" },
		save:
			{ method: "POST",url: $Domain + "/thor/image/hardwares" },
		get:
			{ method: "GET", url: $Domain + "/thor/image/hardwares/:id", params: { id: "@id"}, isArray: false },
		update:
			{ method: "PUT", url: $Domain + "/thor/image/hardware/:id", params: { id: "@id"}, isArray: false }
	});
}])


/* 系统 */
.factory("SystemISO", ["$resource", function($resource){
	return $resource($Domain + "/thor/isos", null, {
		query: { method: "GET", isArray: false},
		update: { method: "PUT" }
//        loadISO: {method: "POST", url:  $Domain + "/thor/image/loadISO"}
	});
}])

.factory("SystemBackup", ["$resource", function(res){
	return res($Domain + "/thor/admin/backup", null, {
		query: { method: "GET", isArray: false},
		backup:
			{ method: "POST"},
		restore :
			{ method: "POST"},
		delete :
			{ method: "DELETE"}
	});
}])

.factory("SystemUpgrade", ["$resource", function($resource){
	return $resource($Domain + "/thor/admin/upgrade", null, {
		query: { method: "GET", isArray: false},
		upload: { method: "POST"},
		upgrade:
			{ method: "PUT" },
		delete :
			{ method: "DELETE"}

	});
}])
.factory("SystemLog", ["$resource", function($resource){
	return $resource($Domain + "/thor/log", null, {
		query: { method: "GET", isArray: false},
		delete :
			{ method: "DELETE"}
	});
}])

.factory("SystemAlarm", ["$resource", function($resource){
	return $resource($Domain + "/thor/alarmLog", null, {
		query: { method: "GET", isArray: false},
		delete :
			{ method: "DELETE"}
	});
}])
.factory("SystemUSB", ["$resource", function($resource){
	return $resource($Domain + "/thor/usb", null, {
		query: { method: "GET", isArray: false},
		save: { method: "POST" },
		update: { method: "PUT" },
		delete: { method: "DELETE"}
	});
}])

.factory("VNC", ["$resource", function($resource) {
	return $resource($Domain + "/thor/instance/vnc/:id", { id: "@id" }, {
		loadISO:
			{ method: "POST", url: $Domain + "/thor/image/loadISO" },
		save:
			{ method: "POST", url: $Domain + "/thor/image/update_template" }
	});
}])

.factory("permissionList", ["$resource", function($resource){
	return $resource($Domain + "/thor/permission", null, {
		query: { method: "GET", isArray:false}
	});
}])
.factory("pushlicenseFile", ["$resource", function($resource){
	return $resource($Domain + "/thor/license/show", null, {
		update: { method: "GET", isArray:false}
	});
}])

.factory("Scheduler", ["$resource", function($resource){
	return $resource($Domain + "/thor/classScheduler", { pool_id: "@pool_id" }, {
		get: { method: "GET" },
		save: { method: "POST" },
		getConfig: { method: "GET", url: $Domain + "/thor/classSchedulerConfig" },
		updateConfig: { method: "PUT", url: $Domain + "/thor/classSchedulerConfig" }
	});
}])

.factory("init", ["$resource", function($resource){
	return $resource($Domain + "/thor/init", null, {
		get_nic:{method:"GET",url: $Domain + "/thor/init/get_nic"},
		post_nic: { method:"POST",url: $Domain + "/thor/init/select_nic"},
		init: { method: "GET" },
        test: { method: "GET", url: $Domain + "/thor/init/test"},
        set_language:{ method: "POST", url: $Domain + "/thor/init/language"},
        get_language:{ method: "GET", url: $Domain + "/thor/init/record_lang"},
		check: { method: "GET", url: $Domain + "/thor/init/check"},
		init_data: { method: "GET", url: $Domain + "/thor/init/data" },
		init_storage: { method: "GET", url: $Domain + "/thor/init/storage" },
		init_network: { method: "POST", url: $Domain + "/thor/init/network" },
		init_password: { method: "POST", url: $Domain + "/thor/init/password" },
        init_classes_setting: { method: "POST", url: $Domain + "/thor/init/classes" },
        init_complete:{ method: "POST",url: $Domain + "/thor/init/complete" },
        _add_network:{ method: "GET",url: $Domain + "/thor/init/network" }


	});
}])

.factory("loginResource", ["$resource", function($resource){
            return $resource($Domain + "/thor/version", null, {
                query: { method: "GET"}
            })
        }])