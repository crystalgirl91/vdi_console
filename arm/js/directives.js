angular.module('arm.directives', [])
.directive("myTab", [function(){
	return {
		restrict: "AE",
		link: function(scope, element, attrs){
			var nav = element.find(">ul");
			var tab_cont = element.find(">.tab-content");
			var arr_lis = [].slice.call(nav.find(">li"));
			var arr_conts = [].slice.call(tab_cont.find(">.tab-pane"));
			var is_exit = arr_lis.some(function(li){ return $(li).hasClass("active") });
			var show = function(idx){
				arr_lis.forEach(function(li,index){
					if(index === idx){
						$(li).addClass("active");
						arr_conts[index] && $(arr_conts[index]).addClass("active");
					}else{
						$(li).removeClass("active");
						arr_conts[index] && $(arr_conts[index]).removeClass("active");
					}
				});
			}
			nav.on("click",">li",function(e){
				var idx = arr_lis.indexOf(this);
				show(idx);
			});
			if(!is_exit){
				show(0);
			}else{
				var _idx;
				arr_lis.forEach(function(li,index){
					if($(li).hasClass("active")){
						_idx = index;
					}
				});
				show(_idx);
			};
		}
	};
}])
.directive("sysTimePicker", ["$interval","$timeout","$filter",function($interval,$timeout,$filter){
	return {
		restrict: "AE",
		require : "^sysDatePicker",
		replace:true,
		template:'<div class="number-picker">\
					<div class="numberInput"><input type="text" max="24" min="0" ng-model="hour"   ng-change="stopIntervalTime()"/><a class="arrow arrowUp" ng-mousedown="goAddInterval($event,1,'+"'hour'"+')"   ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a><a class="arrow arrowDown"  ng-mousedown="goAddInterval($event,-1,'+"'hour'"+')"   ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a></div>\
					<div class="numberInput"><input type="text" max="59" min="0" ng-model="minute" ng-change="stopIntervalTime()"/><a class="arrow arrowUp" ng-mousedown="goAddInterval($event,1,'+"'minute'"+')" ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a><a  class="arrow arrowDown" ng-mousedown="goAddInterval($event,-1,'+"'minute'"+')" ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a></div>\
					<div class="numberInput"><input type="text" max="59" min="0" ng-model="second" ng-change="stopIntervalTime()"/><a class="arrow arrowUp" ng-mousedown="goAddInterval($event,1,'+"'second'"+')" ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a><a class="arrow arrowDown"  ng-mousedown="goAddInterval($event,-1,'+"'second'"+')" ng-mouseup="cancelAddInterval($event)" ng-mouseout="cancelAddInterval($event)"></a></div>\
				</div>',

		link: function(scope, element, attrs,ctrl){

			var addTimeout,addInterval,is_pause;
			scope.selectTime = new Date();

			var setSelectTime = ctrl.setSelectTime;

			var getDate = function(){
				var timeDate = new Date();
				scope.hour = timeDate.getHours();
				scope.minute =timeDate.getMinutes();
				scope.second = timeDate.getSeconds();
				setSelectTime(scope.hour,scope.minute,scope.second);
			};

			var intervalTime = $interval(function(){
				getDate();
			},1000);
			
			scope.stopIntervalTime = function(e){
				if(!is_pause){
					$interval.cancel(intervalTime);
					is_pause = true;
				};
				setSelectTime(scope.hour,scope.minute,scope.second);
			};
			var updateValue = function(e,val,type){
				var max = $(e.target).siblings("input")[0].max;
				var min = $(e.target).siblings("input")[0].min;
				var nextVal = parseInt(scope[type]) ? parseInt(scope[type]) + val : val;
				if( nextVal > max){
					scope[type] = min.toString();
				}else if(nextVal < min){
					scope[type] = max.toString();
				}else{
					scope[type] = nextVal;
				}
				scope.stopIntervalTime();
			};
			scope.goAddInterval = function(event,pm,witch){
				updateValue(event,pm,witch);
				addTimeout = $timeout(function(){
					addInterval = $interval(function(){
						updateValue(event,pm,witch);
					},80)
				},200)
			};
			scope.cancelAddInterval = function(){
				$interval.cancel(addInterval);
				$timeout.cancel(addTimeout);
			};
			element.on("keypress","input",function(e){
				var code = e.keyCode;
				var cusor = this.selectionStart;
				var maxlength = 2;
				var max= this.max , min = this.min;
				if(code >= 48 && code <= 57){
					var _arr = this.value.split("");
					_arr.splice(cusor,0,String.fromCharCode(code));
					var val = _arr.join("");
					if(val.length > maxlength || parseInt(val) > max ||  parseInt(val) < min){
						e.preventDefault();
					}
				}else{
					e.preventDefault();
				}
			});

			getDate();
		}
	};
}])
.directive("sysDatePicker", [function(){
	return {
		restrict: "AE",
		transclude:true,
		replace:true,
		scope:{ 
		 	selectDate: "=" ,
		 	pickerOptions: "="
		},
		templateUrl:'views/template/datePicker.html',
		controller:function($scope){
			$scope.selectDate = new Date();

			this.getSelectTime = function(){
				return scope.selectDate;
			};
			this.setSelectTime = function(hour,minute,second){
				$scope.selectDate.setHours(hour);
				$scope.selectDate.setMinutes(minute);
				$scope.selectDate.setSeconds(second);
			};
		},
		link: function(scope, element, attrs){

			var ops = scope.pickerOptions;
			// var opsWeeks =  ops.weekNames || ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
			var opsMonths = ops.monthNames || ["Jan","Feb","Mar","April","May","June","July","Aug","Sep","Oct","Nov","Dec"];	
			// var opsMonths = ops.monthNames || ["January","February","March","April","May","June","July","August","September","October","November","December"];	
			var MonIdx = ops.MondayIdx && ops.weekNames ?  ops.MondayIdx :　1;
			var opsWeeks =  ops.MondayIdx && ops.weekNames ? ops.weekNames :  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

			var _curDate = new Date();
			var _curYear = _curDate.getFullYear();
			var _curMonth = _curDate.getMonth() + 1;
			var _curDay = _curDate.getDate();

			
			scope.weeks = opsWeeks;
			scope.years = getYearList(_curYear);
			scope.months = getMonthList();

			scope.year = _curYear;
			scope.month = _curMonth;
			scope.selectDate = _curDate;

			var _minMonth = 1;
			var _maxMonth = 12;
			var _minYear = scope.years[0];
			var _maxYear = scope.years[scope.years.length-1];
			var btnNext = element.find(".btn_next");
			var btnPre = element.find(".btn_pre");

			
			scope.updateMonth = function(num){
				var _mon = parseInt(scope.month) + parseInt(num);
				if(_mon > _maxMonth){
					scope.year++;
					scope.month = _minMonth;
				}else if(_mon < _minMonth){
					scope.year--;
					scope.month = _maxMonth;
				}else{
					scope.month = parseInt(scope.month) + num;
				}
			};
			scope._isOn = function(d){
				var is_match = ((d == _curDay) && (scope.year == _curYear) && (scope.month == _curMonth));
				if(is_match)
					return true;
			};
			scope._isChecked = function(d){
				var is_match = ((d == scope.selectDate.getDate()) && (scope.selectDate.getFullYear() == scope.year) && (scope.selectDate.getMonth() == scope.month-1));
				if(is_match)
					return true;
			};	
			function getYearList(nowYear){
				var _arr =[];
				for(var i = nowYear - 10;i < nowYear + 10;i++){
					_arr.push(i);
				};
				return _arr;
			};
			function getMonthList(){
				var _arr = [1,2,3,4,5,6,7,8,9,10,11,12].map(function(item,index){
					return {
						val:item,
						name:opsMonths[index]
					};
				});
				return _arr;
			};
			var _getDayNum = function(){
				var objDate = new Date(scope.year,scope.month);
				objDate.setDate(0);
				return objDate.getDate();
			};
			var _getBeginWeek = function(){
				var objDate = new Date(scope.year,scope.month-1);
				objDate.setDate(0);
				return objDate.getDay();
			};
			var updateCalendar = function(){
				var week = _getBeginWeek() + MonIdx;
				var dayNum = _getDayNum();
				scope.days = new Array(42);
				for(var i = 0;i < dayNum ; i ++){			
					scope.days[i+week] = i+1;
				};
			};
			var updateBtnState = function(){
			
				if(scope.year == _maxYear && scope.month == _maxMonth){
					btnNext.addClass("disabled");
				}else if(scope.year == _minYear && scope.month == _minMonth){

					btnPre.addClass("disabled");
				}else{
					btnNext.removeClass("disabled");
					btnPre.removeClass("disabled");
				}
			};
			scope.$watch("month",function(newValue){
				if(newValue){
					updateBtnState();
					updateCalendar();
				}
			});
			scope.$watch("year",function(newValue){
				if(newValue){
					updateBtnState();
					updateCalendar();
				}
			});
			element.find(".picker-body").on("click","li",function(){
				scope.selectDate = new Date(scope.year,scope.month-1,$(this).text());
				scope.$apply();
			})

		}
	};
}])


.directive("mycarousel", [function(){
	return {
		restrict: "AE",
		transclude: true,

		link: function(scope, element, attrs){
			var container = element.find(".list_container");
			//var item_width = element.width();

			var handLeft = element.find(".list_hand.left");
			var handRight = element.find(".list_hand.right");

			var item_num;
			var i = 1;
			var num = 0;
			handRight.on("click", function(){
				if(scope.scens)
					item_num = scope.scens.length%6==0? scope.scens.length/6:parseInt(scope.scens.length/6)+1;
				else
					item_num = scope.vms.length%6==0? scope.vms.length/6:parseInt(scope.vms.length/6)+1;
				if(i<item_num){
					num = -100*i;
					container.css("-webkit-transform","translateY("+ num +"%)");
					i++;
				}
			})
			handLeft.on("click", function(){
				if(i > 1){ 	
					num = num+100;
					container.css("-webkit-transform","translateY("+ num +"%)")
					i--;
				}
			})
		},
		template: 	'<div class="list_hidden" data-ng-transclude></div>\
					<a class="left list_hand"><span class="icon-arm-back hand"></span><span class="sr-only">Previous</span></a>\
					<a class="right list_hand"><span class="icon-arm-Next hand"></span><span class="sr-only">Next</span></a>'
	};
}])


.directive("href", [function(){
	return {
		restrict: "A",
		link: function(scope, element, attrs){
			if(element[0].nodeName.toUpperCase() === "A"){
				element.on("click",function(e){
					e.preventDefault();
					location.replace(attrs.href)
				})
			}
		}
	};
}])
.directive("ipInput", ["$compile",function($compile){
	return {
		restrict:"EA",
		require:"ngModel",
		scope:{},
		link:function(scope,element,attrs,ctrl){
			var ngModelCtrl = ctrl;

			if(!ngModelCtrl){
				return;
			};

			var popEl = angular.element("<div ip-input-wrap></div>");
			var $input = $compile(popEl)(scope);
			element.addClass("ng-hide");
			element.after($input);

			// model -- ui
			ngModelCtrl.$render = function(){
				var modelVal = ngModelCtrl.$modelValue;
				try{
					var modelValArr = modelVal.split(".");
					[1,2,3,4].forEach(function(i,idx){
						scope["seg" + i] = modelValArr[idx] || "";
					});
				}catch(err){
				}
				setValidate();
			};
			function setValidate(){
				var reg = /^(((\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5]))|(\s*))$/;
				var isValid = reg.test(ngModelCtrl.$modelValue);
				if(ngModelCtrl.$modelValue){
					ngModelCtrl.$setValidity("ip",isValid);
				}else{
					ngModelCtrl.$setValidity("ip",true);
				}
			};

			// ui -- model
			$input.on("input",function(e){
				scope.$apply(function(){
					var val = [1,2,3,4].map(function(i){ return scope["seg" + i] || ""; }).join(".");
					var isNull = val.split(".").every(function(item){ return item.length===0 });
					if(isNull){
						ngModelCtrl.$setViewValue("");
					}else{
						ngModelCtrl.$setViewValue(val);
					}
					ngModelCtrl.$render();
				})
			});
		}
	}
}])
.directive("ipInputWrap",function(){
	return {
		restrict: "AE",
		replace: true,
		template: '<span role="ipgroup"><input type="text" ng-model="seg1">.<input type="text" ng-model="seg2">.<input type="text" ng-model="seg3">.<input type="text" ng-model="seg4"></span>',
		link: function(scope,element,attrs){
			element.on("keydown","input",function(event){
				
					var code = event.keyCode;
	       			switch(true){
	       				case code === 110 || code === 190: {
							var nextEle = $(this).next("input");
					    	nextEle && nextEle.focus();
					        event.preventDefault();
					        break;
	       				};
	       				case code === 8: {
	       					if(!$(this).val()){
					            $(this).prev("input") && $(this).prev("input").focus();
					        }
					        break;
	       				};
	       				case code === 32 || code === 229: {
	       					event.preventDefault();
	       					event.stopPropagation();
	       					break;
	       				};
	       			}
			});
			element.on("keypress","input",function(e){
			    if(e.keyCode < 48 || e.keyCode > 57){
			        e.preventDefault();
			    }
			    if($(this).val().length > 2 && this.selectionStart === this.selectionEnd){
			    	e.preventDefault();
			    }
			});
		}
	}
})
.directive("controlAutofocus", [function(){
	return {
		restrict: "AE",
		link: function(scope, element, attrs){
			setTimeout(function(){
				element[0].focus();
			},10);
			
		}
	};
}])
// directives for localization
angular.module('app.localize', [])

	.factory('localize', ['$http', '$rootScope', '$window', function($http, $rootScope, $window){
		var localize = {
			currentLocaleData: {},
			currentLang: {},
			setLang: function(lang) {
				if(!lang){
					lang={language: "production version", translation: "产品版本", langCode: "production", flagCode: "pro"};
				}
				$http({method: 'GET', url: localize.getLangUrl(lang), cache: false})
				.success(function(data) {
					localize.currentLocaleData = JSON.parse(data.data);
					localize.currentLang = lang;
					$rootScope.$broadcast('localizeLanguageChanged');
				}).error(function(data) {
					console.log(data,'Error updating language!');
				});
			},
			getLangUrl: function(lang) {
				return $Domain + "/thor/toolkit/lang_" + lang.langCode + ".js"
			},

			localizeText: function(sourceText) {
				return localize.currentLocaleData[sourceText];
			}
		};

		return localize;
	}])

	.directive('localize', ['localize', function(localize) {
		var encodeHTML = function(txt, con){
			con = con || document.createElement("div");
			while(con.firstChild){
				con.removeChild(con.firstChild);
			}
			return con.appendChild(con.ownerDocument.createTextNode(txt)).parentNode.innerHTML;
		}
		var re_params = /\{\{([^\}]+)?\}\}/g;
		var re_param_attr = /^(?:data-)?param/;
		var fn_check_params = function(element, e, attrs){
			if(typeof e === "undefined"){
				return true;
			}
			if(e.name === "localizeLanguageChanged"){
				return true;
			}
			if(e.length){
				return e.some(function(c){
					return re_param_attr.test(c.attributeName);
				});
			}
			else if(e.type === "DOMAttrModified"){
				return re_param_attr.test(e.attrName);
			}
		};
		return {
			restrict: "A",
			link: function(scope, element, attrs){
				var con = document.createElement("div");
				var ev = function(e){
					if(fn_check_params(element, e, attrs)){
						var tmpl = localize.localizeText(attrs.localize);
						if(tmpl){
							tmpl = tmpl.replace(re_params, function(match, param){
								if(param && attrs["param" + param]){
									return encodeHTML(attrs["param" + param], con);
								}
								return match;
							});
							if(element.is("input, textarea")){
								element.attr("placeholder", tmpl);
							}
							else{
								element.html(tmpl);
							}
						}
					}
				};
				if(typeof window["MutationObserver"] === "function"){
					new MutationObserver(ev).observe(element[0], { attributes: true })
				}
				else{
					element.on("DOMAttrModified", ev);
				}
				scope.$on("localizeLanguageChanged", ev);
				ev();
			}
		};
	}])
	.directive("localizeTitle", ["localize", function(localize){
		var re_params = /\{\{([^\}]+)?\}\}/g;
		return {
			restrict: "A",
			link: function(scope, element, attrs){
				var ev = function(){
					var tmpl = localize.localizeText(attrs.localizeTitle);
					tmpl && element.attr("title", tmpl.replace(re_params, function(match, param){
						if(param && attrs["param" + param]){
							return encodeHTML(attrs["param" + param], con);
						}
						return match;
					}));
				};
				scope.$on("localizeLanguageChanged", ev);
				ev();
			}
		};
	}])
;

