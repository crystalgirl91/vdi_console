angular.module('vdi.filter', [])
    .filter('lun_name', function () {
        return function (lun) {
            if (!angular.isUndefined(lun)) {
                lun.map(function (item) {
                    item.value = item.vendor + " lun-" + item.lun + " " + item.size;
                });
            }
            return lun;
        };
    })
    .filter('storage_type', function () {
        var type2str = {
            local: "本地磁盘",
            iscsi: 'iscsi 磁盘',
            netfs: '网络文件系统',
            fc: 'FC 光纤存储'
        };
        return function (type) {
            return type2str[type]
        }
    })
    .filter('storage_status', function () {
        var stauts2str = {
            running: "正常",
            building:"准备中",
            error:'异常'
        };
        return function (stauts) {
            return stauts2str[stauts]
        }
    })
    .filter('unsafe', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val+"");
        };
    })
    .filter('join', function() {
    	return function(val,slash) {
    	  return val.filter(function(d){
    		return d;
    	  }).join(slash)
    	};
    })
    .filter('network_type', function () {
	var type2str = {
	  nat:'NAT',
	  bridge:'桥接',
	  vlan:'VLAN'
	};
	return function (val) {
	  return type2str[val];
	};
  })
    .filter('yesorno', function () {
	return function (val) {
	  return val ? '是' : '否';
	};
  })
    .filter('to_mb', function () {
	return function (val) {
	  return (val/1024/1024).toFixed(2);
	};
  });