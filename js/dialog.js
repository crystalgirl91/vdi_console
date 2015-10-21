(function($, $$){
	var floater = $('<div id="BaseFloater"><div id="BaseFloaterMasker" data-cmd="DialogMaskerLayer"></div><div id="BaseFloaterDialog" class="dialog"></div></div>');
	var masker = $("#BaseFloaterMasker", floater);
	var dialog = $("#BaseFloaterDialog", floater);
	var dialog_tmpl = '\
		<div class="dialog_titlebar">\
			<h3 class="dialog_title">xxx</h3>\
		</div>\
		<div class="dialog_titlebar_commandbar">\
			<button data-cmd="DialogCloseButton" class="dialog_btn close"><i class="fa fa-times"></i></button>\
		</div>\
		<div class="dialog_content"></div>\
		<div class="dialog_commandbar">\
			<button data-cmd="DialogYESButton" class="dialog_btn btn btn-success btn-xs ok">确定</button>\
			<button data-cmd="DialogYESButton" class="dialog_btn btn btn-success btn-xs yes">是</button>\
			<button data-cmd="DialogNOButton" class="dialog_btn btn btn-danger btn-xs no">否</button>\
			<button data-cmd="DialogNOButton" class="dialog_btn btn btn-danger btn-xs cancel">取消</button>\
		</div>';
	var dialog_title, dialog_content, dialog_yes_btn, dialog_no_btn, dialog_close_btn;
	var fn_build_dialog = function(tmpl){
		dialog.html(tmpl);
		dialog_title = $(".dialog_title", dialog);
		dialog_content = $(".dialog_content", dialog);
		dialog_yes_btn = $(".dialog_btn.yes, .dialog_btn.ok", dialog);
		dialog_no_btn = $(".dialog_btn.no, .dialog_btn.cancal", dialog);
		dialog_close_btn = $(".dialog_btn.close", dialog);
	};

	var fn_some_button_callback = function(cb){
		return cb.call(this);
	};

	floater
		.oncmd("DialogMaskerLayer", "click", function(e){
			if(instace.options.modal){
				instace.hide();
			}
		}, false)
		.oncmd("DialogYESButton", "click", function(e){
			if(!instace.yes_cb.some(fn_some_button_callback, dialog)){
				instace.hide();
			}
		}, false)
		.oncmd("DialogNOButton", "click", function(e){
			if(!instace.no_cb.some(fn_some_button_callback, dialog)){
				instace.hide();
			}
		}, false)
		.oncmd("DialogCloseButton", "click", function(e){
			instace.hide();
		}, false);
	fn_build_dialog(dialog_tmpl);

	function DialogOptions(opts){
		for(var n in opts){
			this[n] = opts[n];
		}
	}
	DialogOptions.prototype = {
		type : "alert",
		modal : false,
		width : 600,
		height : 200,
		showTitlebar : true,
		showCommandbar : true,
		title : "Default Title",
		content : "Default Content",
		url : null,
		allowHTMLTitle : false,
		allowHTMLContent : false,
		allowHTML : false,
		tmpl : dialog_tmpl,
		onshow : function(){}
	}

	function Dialog(){
		this.$dom = floater;
		this.yes_cb = [];
		this.no_cb = [];
		this.done_cb = [];
	}
	var prop = Dialog.prototype;
	prop.options = new DialogOptions();
	prop.setOptions = function(opts){
		var _ = this;
		opts = this.options = new DialogOptions(opts);
		if(opts.hasOwnProperty("tmpl")){
			fn_build_dialog(opts.tmpl);
		}
		dialog.removeClass("alert prompt confim box").addClass(opts.type);
		dialog[opts.showTitlebar ? "addClass" : "removeClass"]("show_titlebar");
		dialog[opts.showCommandbar ? "addClass" : "removeClass"]("show_commandbar");
		dialog_title[opts.allowHTMLTitle || opts.allowHTML ? "html" : "text"](opts.title);
		this.yes_cb.splice(0, Number.MAX_VALUE);
		this.no_cb.splice(0, Number.MAX_VALUE);
		this.done_cb.splice(0, Number.MAX_VALUE);

		dialog[0].style.cssText += ["",
			"width:" + (typeof opts.width === "string" ? opts.width : opts.width + "px"),
			"height:" + (typeof opts.height === "string" ? opts.height : opts.height + "px")
		].join(";");

		if(opts.url){
			$$.get(opts.url).success(function(con){
				dialog_content.html(con);
				setTimeout(function(){
					_.show();
				}, 10);
			});
		}
		else{
			dialog_content[opts.allowHTMLContent || opts.allowHTML ? "html" : "text"](opts.content);

			setTimeout(function(){
				_.show();
			}, 10);
		}

	};
	prop.show = function(){
		if(floater[0].parentNode !== document.body){
			document.body.appendChild(floater[0]);
		}
		floater.addClass("show");
		instace.options.onshow.call(dialog_content[0]);
		dialog[0].style.cssText += ["",
			"top:" + Math.max(0, ((document.documentElement.clientHeight - dialog[0].clientHeight) / 2)) + "px",
			"left:" + Math.max(0, ((document.documentElement.clientWidth - dialog[0].clientWidth) / 2)) + "px",
		].join(";");
		return this;
	};
	prop.hide = function(){
		if(!this.done_cb.some(fn_some_button_callback, dialog)){
			floater.removeClass("show");
		}
		return this;
	};
	prop.done = function(){
		this.done_cb.push.apply(this.done_cb, arguments);
		return this;
	};
	prop.yes = prop.ok = function(){
		this.yes_cb.push.apply(this.yes_cb, arguments);
		return this;
	};
	prop.no = prop.cancel = function(){
		this.no_cb.push.apply(this.no_cb, arguments);
		return this;
	};

	var instace = new Dialog();

	window.$Dialog = exports = {};
	exports.alert = function(msg){
		var opts = typeof msg === "string"
			? { content : msg }
			: msg || {};
		opts.type = "alert";
		instace.setOptions(opts);
		return instace;
	};
	exports.confirm = function(title, msg){
		var opts = typeof title === "string"
			? { title : title, content : msg }
			: title || {};
		opts.type = "confim";
		instace.setOptions(opts);
		return instace;
	};
	exports.prompt = function(title, msg){
		var opts = typeof title === "string"
			? { title : title, content : msg }
			: title || {};
		opts.type = "prompt";
		instace.setOptions(opts);
		return instace;
	};
	exports.dialog = exports.box = function(title, msg){
		var opts = typeof title === "string"
			? { title : title, content : msg }
			: title || {};
		opts.type = "box";
		instace.setOptions(opts);
		return instace;
	};
	exports.hide = function(){
		return instace.hide();
	};
})(window.jtfx, window.jQuery || window.Zepto);

/*
{
$.validator.messages.required: "This field is required",
$.validator.messages.remote: "Please fix this field",
$.validator.messages.email: "Please enter a valid email address",
$.validator.messages.url: "Please enter a valid URL",
$.validator.messages.date: "Please enter a valid date",
$.validator.messages.dateISO: "Please enter a valid date (ISO)",
$.validator.messages.number: "Please enter a valid number",
$.validator.messages.digits: "Please enter only digits",
$.validator.messages.creditcard: "Please enter a valid credit card number",
$.validator.messages.equalTo: "Please enter the same value again",
$.validator.messages.maxlength: a.validator.format("Please enter no more than {0} characters"),
$.validator.messages.minlength: a.validator.format("Please enter at least {0} characters"),
$.validator.messages.rangelength: a.validator.format("Please enter a value between {0} and {1} characters long"),
$.validator.messages.range: a.validator.format("Please enter a value between {0} and {1}"),
$.validator.messages.max: a.validator.format("Please enter a value less than or equal to {0}"),
$.validator.messages.min: a.validator.format("Please enter a value greater than or equal to {0}")
}
*/

