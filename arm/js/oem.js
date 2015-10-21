var $$$MSG = new function(){
	var _msgs = {};
	this.msgs = _msgs;
	this.getLangFlag = function(){
		return localStorage["i18n_code"] || "production";
	};
	this.getMsgs = function(flag){
		flag = flag || this.getLangFlag();
		var msg = _msgs[flag];
		if(!msg){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", $Domain + "/thor/toolkit/code_" + flag + ".js", false);
			xhr.send();
			try{
				msg = _msgs[flag] = JSON.parse(JSON.parse(xhr.responseText).data);
			}
			catch(e){ msg = {}; }
		}
		return msg;
		
	};
	this.get = function(code, flag){
		var map = this.getMsgs(flag);
		return map[code] || "";
	};
	this.getMsgs();
};

var $$$I18N = new function(){
	var _msgs = {};
	this.msgs = _msgs;
	this.getLangFlag = function(){
		return localStorage["i18n_code"] || "production";
	};
	this.getMsgs = function(flag){
		flag = flag || this.getLangFlag();
		var msg = _msgs[flag];
		if(!msg){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", $Domain + "/thor/toolkit/lang_" + flag + ".js", false);
			xhr.send();
			try{
				msg = _msgs[flag] = JSON.parse(JSON.parse(xhr.responseText).data);
			}
			catch(e){ msg = {}; }
		}
		return msg;
		
	};
	this.get = function(code, flag){
		var map = this.getMsgs(flag);
		return map[code] || "";
	};
	this.getMsgs();
};

var $$$version = $$$I18N.get("GOD_VERSION") || "dev";