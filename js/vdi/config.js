var $Domain = location.protocol + "//" + location.hostname + ":8081";
var $$$os_types =[
	{
		"key": "other",
		"value": "其它"
	},
	{
		"key": "package",
		"value": "软件包"
	},
	{
		"key": "ArchLinux",
		"icon": "linux.png",
		"value": "Arch Linux"
	
	},
	{
		"key": "ArchLinux_64",
		"icon": "linux.png",
		"value": "Arch Linux (64 bit)"
	
	},
	{
		"key": "Debian",
		"icon": "linux.png",
		"value": "Debian"
	
	},
	{
		"key": "Debian_64",
		"icon": "linux.png",
		"value": "Debian (64 bit)"
	
	},
	{
		"key": "Fedora",
		"icon": "linux.png",
		"value": "Fedora"
	
	},
	{
		"key": "Fedora_64",
		"icon": "linux.png",
		"value": "Fedora (64 bit)"
	
	},
	{
		"key": "FreeBSD",
		"icon": "linux.png",
		"value": "FreeBSD"
	
	},
	{
		"key": "FreeBSD_64",
		"icon": "linux.png",
		"value": "FreeBSD (64 bit)"
	
	},
	{
		"key": "Gentoo",
		"icon": "linux.png",
		"value": "Gentoo"
	
	},
	{
		"key": "Gentoo_64",
		"icon": "linux.png",
		"value": "Gentoo (64 bit)"
	
	},
	{
		"key": "Linux",
		"icon": "linux.png",
		"value": "Other Linux"
	
	},
	{
		"key": "MacOS",
		"icon": "linux.png",
		"value": "Mac OS X Server"
	
	},
	{
		"key": "MacOS_64",
		"icon": "linux.png",
		"value": "Mac OS X Server (64 bit)"
	
	},
	{
		"key": "OpenBSD",
		"icon": "linux.png",
		"value": "OpenBSD"
	
	},
	{
		"key": "OpenBSD_64",
		"icon": "linux.png",
		"value": "OpenBSD (64 bit)"
	
	},
	{
		"key": "OpenSUSE",
		"icon": "linux.png",
		"value": "openSUSE"
	
	},
	{
		"key": "OpenSUSE_64",
		"icon": "linux.png",
		"value": "openSUSE (64 bit)"
	
	},
	{
		"key": "OpenSolaris",
		"icon": "linux.png",
		"value": "Oracle Solaris 10 10/09 and later"
	
	},
	{
		"key": "OpenSolaris_64",
		"icon": "linux.png",
		"value": "Oracle Solaris 10 10/09 and later (64 bit)"
	
	},
	{
		"key": "Oracle",
		"icon": "linux.png",
		"value": "Oracle"
	
	},
	{
		"key": "Oracle_64",
		"icon": "linux.png",
		"value": "Oracle (64 bit)"
	
	},
	{
		"key": "Other",
		"icon": "unknown.png",
		"value": "Other/Unknown"
	
	},
	{
		"key": "RedHat",
		"icon": "linux.png",
		"value": "Red Hat"
	
	},
	{
		"key": "RedHat_64",
		"icon": "linux.png",
		"value": "Red Hat (64 bit)"
	
	},
	{
		"key": "Solaris",
		"icon": "linux.png",
		"value": "Oracle Solaris 10 5/09 and earlier"
	
	},
	{
		"key": "Solaris_64",
		"icon": "linux.png",
		"value": "Oracle Solaris 10 5/09 and earlier (64 bit)"
	
	},
	{
		"key": "Ubuntu",
		"icon": "linux.png",
		"value": "Ubuntu"
	
	},
	{
		"key": "Ubuntu_64",
		"icon": "linux.png",
		"value": "Ubuntu (64 bit)"
	
	},
	{
		"key": "Windows2000",
		"icon": "win7.png",
		"value": "Windows 2000"
	
	},
	{
		"key": "Windows2003",
		"icon": "win2003.png",
		"value": "Windows 2003"
	
	},
	{
		"key": "Windows2003_64",
		"icon": "win2003.png",
		"value": "Windows 2003 (64 bit)"
	
	},
	{
		"key": "Windows2008",
		"icon": "win2008.png",
		"value": "Windows 2008"
	
	},
	{
		"key": "Windows2008_64",
		"icon": "win2008.png",
		"value": "Windows 2008 (64 bit)"
	
	},
	{
		"key": "Windows7",
		"icon": "win7.png",
		"value": "Windows 7"
	
	},
	{
		"key": "Windows7_64",
		"icon": "win7.png",
		"value": "Windows 7 (64 bit)"
	
	},
	{
		"key": "Windows8",
		"icon": "win8.png",
		"value": "Windows 8"
	
	},
	{
		"key": "Windows8_64",
		"icon": "win8.png",
		"value": "Windows 8 (64 bit)"
	
	},
	{
		"key": "WindowsNT",
		"icon": "win7.png",
		"value": "Other Windows"
	
	},
	{
		"key": "WindowsNT4",
		"icon": "win7.png",
		"value": "Windows NT 4"
	
	},
	{
		"key": "WindowsVista",
		"icon": "win7.png",
		"value": "Windows Vista"
	
	},
	{
		"key": "WindowsVista_64",
		"icon": "win7.png",
		"value": "Windows Vista (64 bit)"
	
	},
	{
		"key": "Windowsxp",
		"icon": "winxp.png",
		"value": "Windows XP"
	
	},
	{
		"key": "Windowsxp_64",
		"icon": "winxp.png",
		"value": "Windows XP (64 bit)"
	
	},
	{
		"key": "WindowsXP",
		"icon": "winxp.png",
		"value": "Windows XP"
	
	},
	{
		"key": "WindowsXP_64",
		"icon": "winxp.png",
		"value": "Windows XP (64 bit)"
	
	},
	{
		"key": "Windows 7",
		"icon": "win7.png",
		"value": "Windows 7 series"
	}
];

var $$$power_lists_add =[
	{
		"key":"Summary",
		"value": "概要",
		"is_group": false,
		"nosublist": true
	},
	{
		"key":"Resource",
		"value": "资源池",
		"is_group": true
	},
	{
		"key":"Host",
		"value": "主机管理",
		"is_group": false,
		"belong": "Resource"
	},
	{
		"key":"Network",
		"value": "网络管理",
		"is_group": false,
		"belong": "Resource"
	},
	{
		"key":"Storage",
		"value": "存储管理",
		"is_group": false,
		"belong": "Resource"
	},
	{
		"key":"Desktop",
		"value": "桌面",
		"is_group": true
	},
	{
		"key":"Teaching_desktop",
		"value": "教学桌面",
		"is_group": false,
		"belong": "Desktop"
	},
	{
		"key":"Personal_desktop",
		"value": "个人桌面",
		"is_group": false,
		"belong": "Desktop"
	},
	{
		"key":"Template",
		"value": "模板",
		"is_group": true
	},
	{
		"key":"Teaching_template",
		"value": "教学模板",
		"is_group": false,
		"belong": "Template"
	},
	{
		"key":"Personal_template",
		"value": "个人模板",
		"is_group": false,
		"belong": "Template"
	},
	{
		"key":"Hardware_template",
		"value": "硬件模板",
		"is_group": false,
		"belong": "Template"
	},
	{
		"key":"Terminal",
		"value": "终端",
		"is_group": true
	},
	{
		"key":"Classroom",
		"value": "教室管理",
		"is_group": false,
		"belong": "Terminal"
	},
	{
		"key":"Terminal_Manage",
		"value": "终端管理",
		"is_group": false,
		"belong": "Terminal"
	},
	{
		"key":"User",
		"value": "用户",
		"is_group": true,
	},
	// {
	// 	"key":"Role_Manage",
	// 	"value": "角色管理",
	// 	"is_group": false,
	// 	"belong": "User"
	// },
	{
		"key":"Administrator",
		"value": "管理用户",
		"is_group": false,
		"belong": "User"
	},
	{
		"key":"Common_user",
		"value": "普通用户",
		"is_group": false,
		"belong": "User"
	},
	{
		"key":"Domain_user",
		"value": "域用户",
		"is_group": false,
		"belong": "User"
	},
	{
		"key":"Monitor",
		"value": "监控",
		"is_group": true
	},
	{
		"key":"Host_monitoring",
		"value": "主机监控",
		"is_group": false,
		"belong": "Monitor"
	},
	{
		"key":"Desktop_monitoring",
		"value": "桌面监控",
		"is_group": false,
		"belong": "Monitor"
	},
	{
		"key":"Alarm_information",
		"value": "告警信息",
		"is_group": false,
		"belong": "Monitor"
	},
	{
		"key":"Timetable",
		"value": "排课",
		"is_group": true
	},
	{
		"key":"Course_list",
		"value": "课程列表",
		"is_group": false,
		"belong": "Timetable"
	},
	{
		"key":"System",
		"value": "系统",
		"is_group": true
	},
	{
		"key":"System_backup",
		"value": "系统备份",
		"is_group": false,
		"belong": "System"
	},
	{
		"key":"System_ISO",
		"value": "系统 ISO",
		"is_group": false,
		"belong": "System"
	},
	{
		"key":"USB_redirection",
		"value": "USB 重定向",
		"is_group": false,
		"belong": "System"
	},
	{
		"key":"System_upgrade",
		"value": "系统升级",
		"is_group": false,
		"belong": "System"
	},
	{
		"key":"Operation_log",
		"value": "操作日志",
		"is_group": false,
		"belong": "System"
	},
	{
		"key":"About",
		"value": "关于",
		"is_group": false,
		"nosublist": true
	}

];
var $$$power_lists =[
	{
		"key":"Summary",
		"value": "概要",
		"url": "#/summary"
	},
	{
		"key":"Resource",
		"value": "资源池"
	},
	{
		"key":"Host",
		"value": "主机管理",
		"url": "#/resource/host"
	},
	{
		"key":"Network",
		"value": "网络管理",
		"url": "#/resource/network"
	},
	{
		"key":"Storage",
		"value": "存储管理",
		"url": "#/resource/storage"
	},
	{
		"key":"Desktop",
		"value": "桌面"
	},
	{
		"key":"Teaching_desktop",
		"value": "教学桌面",
		"url": "#/desktop/scene"
	},
	{
		"key":"Personal_desktop",
		"value": "个人桌面",
		"url": "#/desktop/personal"
	},
	{
		"key":"Template",
		"value": "模板"
	},
	{
		"key":"Teaching_template",
		"value": "教学模板",
		"url": "#/template/teach"
	},
	{
		"key":"Personal_template",
		"value": "个人模板",
		"url": "#/template/personal"
	},
	{
		"key":"Hardware_template",
		"value": "硬件模板",
		"url": "#/template/hardware"
	},
	{
		"key":"Terminal",
		"value": "终端"
	},
	{
		"key":"Classroom",
		"value": "教室管理",
		"url": "#/terminal/schoolroom"
	},
	{
		"key":"Terminal_Manage",
		"value": "终端管理",
		"url": "#/terminal/client"
	},
	{
		"key":"User",
		"value": "用户"
	},
	{
		"key":"Role_Manage",
		"value": "角色管理",
		"url": "#/user/role"
	},
	{
		"key":"Administrator",
		"value": "管理用户",
		"url": "#/user/admin"
	},
	{
		"key":"Common_user",
		"value": "普通用户",
		"url": "#/user/common"
	},
	{
		"key":"Domain_user",
		"value": "域用户",
		"url": "#/user/domain"
	},
	{
		"key":"Monitor",
		"value": "监控"
	},
	{
		"key":"Host_monitoring",
		"value": "主机监控",
		"url": "#/monitor/host"
	},
	{
		"key":"Desktop_monitoring",
		"value": "桌面监控",
		"url": "#/monitor/desktop"
	},
	{
		"key":"Alarm_information",
		"value": "告警信息",
		"url": "#/monitor/alarm"
	},
	{
		"key":"Timetable",
		"value": "排课"
	},
	{
		"key":"Course_list",
		"value": "课程列表",
		"url": "#/scheduler/view"
	},
	{
		"key":"System",
		"value": "系统"
	},
	{
		"key":"System_backup",
		"value": "系统备份",
		"url": "#/system/backup"
	},
	{
		"key":"System_ISO",
		"value": "系统 ISO",
		"url": "#/system/iso"
	},
	{
		"key":"USB_redirection",
		"value": "USB 重定向",
		"url": "#/system/usb"
	},
	{
		"key":"System_upgrade",
		"value": "系统升级",
		"url": "#/system/upgrade"
	},
	{
		"key":"Operation_log",
		"value": "操作日志",
		"url": "#/system/logs"
	},
	{
		"key":"About",
		"value": "关于",
		"url": "#/about"
	}

];


var $$$powers = "Summary,Resource,Host,Network,Storage,Desktop,Teaching_desktop,Personal_desktop,Template,Teaching_template,Personal_template,Hardware_template,Terminal,Classroom,Terminal_Manage,User,Role_Manage,Administrator,Common_user,Domain_user,Monitor,Host_monitoring,Desktop_monitoring,Alarm_information,Timetable,Course_list,System,System_backup,System_ISO,USB_redirection,System_upgrade,Operation_log,About";
