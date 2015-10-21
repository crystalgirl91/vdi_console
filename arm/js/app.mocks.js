angular.module('armApp')
.run(["$httpBackend", function(be){
	be.whenGET(/views|thor\//).passThrough();

	be.whenGET("http://127.0.0.1:81/request/Network/get_server_ip").respond({
		code: 0,
		result: {
			console_ip: "22.22.22.22",
			console_port: 8888,
			rabbitmq_ip: "66.66.66.66"
		}
	});

	be.whenPOST("http://127.0.0.1:81/request/Network/set_server_ip").respond({
		code:0,
		result:true
	});

	be.whenGET(/http:\/\/127\.0\.0\.1:81\/request\/desktop\/personal|teaching/).respond({
		code: 0,
		result: [
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-64",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-64",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-64",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件0",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件1",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件2",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件3",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件4",
				os_type: "win7-32",
				is_restore: false,
			},
					{
				name: "计算机基础教学软件",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件0",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件1",
				os_type: "win7-32",
				is_restore: true,
			},
			{
				name: "计算机基础教学软件2",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件3",
				os_type: "win7-32",
				is_restore: false,
			},
			{
				name: "计算机基础教学软件4",
				os_type: "win7-32",
				is_restore: false,
			}
		]
	});
	
	be.whenPOST("http://127.0.0.1:81/request/personal_login").respond({
		code: 0 ,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/personal_modify_pwd").respond({
		code: 0 ,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/system_info").respond({
		code: 0 ,
		result: {
			name: "噢易arm客户端",
			version: "4.1.0-dev",
			disk:"500G",
			memory:"8G(7.89G可用)",
			cpu:"Intel(R) Core(TM) i3-4105 CPU @ 3.5GHz 3.50GHz",
			broadcom:"",
			NIC:"",
			releaseTime:"2010年7月3日"
		}
	})
	be.whenGET("http://127.0.0.1:81/request/Network/get_ip").respond({
		code: 0,
		result: {
			dhcp:false,
			ip:"10.1.40.61",
			mask:"255.255.255.0",
			gateway:"10.1.40.1",
			dns1:"8.8.8.8",
			dns2:""
		}
	})
	be.whenPOST("http://127.0.0.1:81/request/Network/set_ip").respond({
		code: 0,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/system_restart").respond({
		code: 0,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/system_volume").respond({
		code: 0,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/system_screen").respond({
		code: 0,
		result: { msg: "true" }
	})
	be.whenPOST("http://127.0.0.1:81/request/client/sort").respond({
		code: 0,
		result :"10"
	})
	
}]);