angular.module("arm.resource", [
	"ngResource"
])
.factory("API", ["$resource", function(res){
	//var base = "http://127.0.0.1:81/request/business/";
	var base = "http://api_server/request/business/";
	var base2 = "http://api_server/request/";
	var api = res(base, null, {
		register: { method: "POST", url: base + "register" },
		loop: { method: "GET", url: base + "loop_data" },
		set_loop: { method: "POST", url: base + "set_order" },
		connect: { method: "POST", url: base + "vm_connect" }
	});
	
	api.system = res(base, null, {
		info: { method: "GET", url: base + "system_info" },
		restart: { method: "GET", url: base + "reboot" },
		shutdown: { method: "GET", url: base + "shutdown" },
		screen_list: { method: "GET", url: base + "get_resolution"},
		screen_size : { method: "POST", url: base + "set_resolution" },
		volume :{ method: "POST", url: base + "system_volume" },
		upgrate : { method: "GET", url: base + "upgrate" },
		logout : { method: "GET", url: base + "personal_logout" },
		client_type : { method: "GET", url: base + "get_client_type" }
	});
	api.desktop = res(base, null, {
		mode: { method: "GET", url: base + "desktop_mode" }
	});
	api.desktop.personal = res(base, null, {
		get_config: { method: "GET", url: base + "personal_config" },
		login: { method: "POST", url: base + "personal_login" },
		passwd: { method: "POST", url: base + "personal_modify_pwd" }
	});
	
	api.desktop.teaching = res(base, null, {
		list: { method: "GET", url: base + "teacher_login" },
		login: { method: "GET", url: base + "teacher_login" },
		get_teacher_vms: { method: "GET", url: base + "get_teacher_vms"}
	});
	api.network = res(base, { t: Date.now() }, {
		get_ip: { method: "GET", url: base2 + "Network/get_ip" },
		set_ip: { method: "POST", url: base2 + "Network/set_ip" },
		get_oss_ip: { method: "GET", url: base + "get_oss_ip" },
		get_wifi_list: { method: "GET", url: base + "get_wifi_list" },
		cancle_dhcp: { method: "GET", url: base + "cansel_dhcp"},
		begin_dhcp: {method: "GET", url: base + "start_dhcp"},
		get_server_ip: { method: "GET", url: base2 + "Network/get_server_ip" },
		set_server_ip: { method: "POST", url: base2 + "Network/set_server_ip" },
	});
	window.$api = api;
	return api;
}])

/*
Ui访问buss统一返回格式
code:int
result:json
message:str


注册
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/buiness/register
method：post
	business-client.
1. post 提供给ui
	无
	Code 返回值
1：连接mq-server失败
2 ：routing key 重复


获取桌面模式
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/ buiness /desktop_mode
method：post
	business-client.
1. post 提供给ui
	无
	Result:
0 混合模式
1 教学模式
2 个人模式


教学桌面登陆
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/ buiness /teacher_login
method：post
	business-client.
1. post 提供给ui
	无
	{"vms":[{'host':"虚拟机所在服务器地址",
           'id': "虚拟机id",                       'display_name': "虚拟机名",           'power_status': "虚拟机状态",
                            'mode_id':"虚拟机的教学id",                            'image': {'id': “image.id”,
                                      'os_type': “操作系统类型”}}],
                          “modes”:[{"id": "id" 
              "os_type":"操作系统类型"
              "name": "教学场景名"}],
"user_id":"user_id",   "client_trace“:1}


个人桌面配置信息获取
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/ buiness /personl_config
method：post	business-client.
1. post 提供给ui
	无
	auto_login:bool
save_pwd:bool
username:str
password:str


个人桌面登陆：
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/ buiness /personl_login
method：post	business-client.
1. post 提供给ui
	auto_login:bool
save_pwd:bool
username:str
password:str 
	{"vms":[{'host':"虚拟机所在服务器地址",
           'id': "虚拟机id",                       'display_name': "虚拟机名",           'power_status': "虚拟机状态",
                            'mode_id':"虚拟机的教学id",                            'image': {'id': “image.id”,
                                      'os_type': “操作系统类型”}}],
                          “modes”:[{"id": "id" 
              "os_type":"操作系统类型"
              "name": "教学场景名"}],
"user_id":"user_id",   "client_trace“:1}
业务异常：
1. 用户名密码错
2.客户端没有注册
3.没有教学场景
4. 客户端没有配置登陆序号
5 没有绑定虚拟机


个人桌面修改密码
Ui-buss
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/personl_modify_pwd
method：post	business-client.
1. post 提供给ui
	username:str
old_password:str 
new_password:str
	
业务异常：
用户名密码错误


客户端登陆后就可以开始连接桌面，服务端会开启桌面
ui-client --> business-client
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/request/ buiness /vm_connect
http 类型：post	本地客户端和pymq-client	vm_id: int	
业务异常：
启动超时


轮询接口
ui-client --> business-client
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/ request / buiness /loop_data
http 类型：post	本地客户端和pymq-client	无	Net_card_connected:bool
Mq_connected:bool
Begin_order:bool
End_order:bool
Refresh_order_id:int
Interval:int

轮询设置接口
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/ request / business /set_order

http 类型：post	本地客户端	order:str
	{order:order}

系统属性接口
ui-client --> business-client
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/ request / buiness /system_info
http 类型：post	本地客户端和pymq-client	无	
version:str
disk_size:str
memory_size:str
cpu_info:str
mac:str


关机：
ui-client --> business-client
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/ request / buiness /shutdown
http 类型：post	本地客户端和pymq-client	无	


重启：
ui-client --> business-client
url	提供者	参数: 类型	返回(json)
http://127.0.0.1:81/ request / buiness /reboot
http 类型：post	本地客户端和pymq-client	无	

*/


