/* context_menu */
(function($, $$){

var wrapper = $("<div id='ContextMenuWrapper' class='show'></div>").on("mousedown", function(e){
	if(e.target === this){
		clearMenu();
	}
}, false);

var _pool = {};

function clearMenu(){
	wrapper.removeClass("show");
	$(".hover", wrapper).removeClass("hover");
	wrapper.html("");
	$(commandTarget).removeClass("contextmenu_selected");
};


function getPosition(e, ele){
	var st = Math.max(
		document.documentElement.scrollTop,
		document.body.scrollTop
	);
	var sl = Math.max(
		document.documentElement.scrollLeft,
		document.body.scrollLeft
	);
	var cw = document.documentElement.clientWidth;
	var ch = document.documentElement.clientHeight;
	var sw = Math.max(
		document.documentElement.scrollWidth,
		document.body.scrollWidth
	);
	var sh = Math.max(
		document.documentElement.scrollHeight,
		document.body.scrollHeight
	);
	var ow = ele.offsetWidth;
	var oh = ele.offsetHeight;
	return {
		x : Math.max(0, e.pageX + ow > sl + cw ? sl + cw - ow : e.pageX),
		y : Math.max(0, e.pageY + oh > st + ch ? st + ch - oh : e.pageY)
	}
}

var commandTarget = null;

var contextmenu = {
	create : function(id, conf){
		var data = _pool[id];
		if(!data){
			_pool[id] = data = [].concat(conf);

			var fn_build_menu = function(data, is_submenu){
				var w = $('<div class="menu_wrapper"><ul class="menu_item_list"></ul></li>');
				if(is_submenu){
					w.addClass("sub_menu");
				}
				data.forEach(fn_each_menu_data, $(".menu_item_list", w)[0]);
				return w;
			};


			var fn_each_menu_data = function(item){
				if(item && typeof item === "object"){
					var dom = $('<li class="menu_item"><a class="menu_label" href="javascript:" onclick="return false;">' + item.text + '</a></li>');
					dom.on("mouseover", function(){
						dom.addClass("hover");
					}).on("mouseout", function(){
						dom.removeClass("hover");
					}).on("click", function(e){
						if(typeof item.command === "function"){
							if(!item.command.call(data.commandTarget, e)){
								clearMenu();
							}
						}
					});
					if(item.submenu && item.submenu.length){
						$("a.menu_label", dom)[0].appendChild(document.createElement("i"));
						dom[0].appendChild(fn_build_menu(item.submenu, true)[0]);
					}
					this.appendChild(dom[0]);
				}
				else{
					this.appendChild($('<li class="menu_split"></li>')[0]);
				}
			};

			data.$dom = fn_build_menu(data);
			data.show = function(e){
				wrapper[0].appendChild(data.$dom[0]);
				if(wrapper[0].parentNode !== document.body){
					document.body.appendChild(wrapper[0]);
				}
				wrapper.addClass("show");
				var offset = getPosition(e, data.$dom[0]);
				data.$dom[0].style.cssText += ["",
					"top:" + offset.y + "px",
					"left:" + offset.x + "px"
				].join(";");
			};
			$("html").oncmd(id, "contextmenu", function(e){
				e.preventDefault();
				commandTarget = data.commandTarget = this;
				$(commandTarget).addClass("contextmenu_selected");
				data.show.call(this, e);
			}, true);
		}
	},
	clear : function(){
		clearMenu();
	}
};
window.$ContextMenu = contextmenu;


})(window.jtfx, window.jQuery || window.Zepto);