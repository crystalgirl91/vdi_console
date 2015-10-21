(function () {
    "use strict";

    function getPosition(e, ele) {
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
            x: Math.max(0, e.pageX + ow > sl + cw ? sl + cw - ow : e.pageX),
            y: Math.max(0, e.pageY + oh > st + ch ? st + ch - oh : e.pageY)
        }
    }


    angular.module("vdi.directives", [])
        .directive("dialog", ["$modal", "$rootScope", function ($modal, $rootScope) {
            return {
                restrict: "A",
                link: function ($scope, element, attrs) {
                    element.click(function () {
                        if(attrs.disabled){
                            $.bigBox({
                                title:$$$I18N.get("INFOR_TIP"),
                                content:attrs.error
                            });
                        }else{
                            var dialog = $modal.open({
                                templateUrl: "views/vdi/dialog/" + attrs.dialogUrl,
                                controller: attrs.dialog,
                                scope: $scope,
                                size: attrs.dialogSize
                            });
                            $scope.close = dialog.dismiss.bind(dialog);
                            window.___dialog = dialog;
                        }
                        
                    });
                }
            };
        }])
        .directive("widgetGrid", ["$filter", "$modal", function($filter, $modal){
            return {
                restrict: "A",
                controller: function($scope){
                    this.getCurrentPage = function(){
                        return Number($scope.currentPage) > 0 ? $scope.currentPage : 0;
                    };
                    this.getCurrentRows = function(){
                        return $scope.getCurrentRows();
                    }
                    this.getPageSize = function(){
                        return Number($scope.pagesize) > 0 ? Number($scope.pagesize) : 0;
                    };
                },
                link: function ($scope, element, attrs) {
                    var context_wrapper = element.find(".context_wrapper");
                    context_wrapper.on("mousedown", function (e) {
                        if (e.target === this) {
                            context_wrapper.hide();
                            element.find(".contextmenu_selected").removeClass("contextmenu_selected");
                        }
                    }).on("click", function () {
                        context_wrapper.hide();
                        element.find(".contextmenu_selected").removeClass("contextmenu_selected");
                    });
                    context_wrapper.hide();

                    $scope.searchText = "";
                    //$scope.pagesize = 5;
                    $scope.currentPage = 1;

                    $scope.getCurrentRows = function(){
                        return $filter("paging")(
                            $scope.getFilterRows(),
                            $scope.currentPage, $scope.pagesize
                        );
                    };
                    $scope.getFilterRows = function(){
                        return $filter("filter")($scope.rows, $scope.searchText);
                    };

                    $scope.checkAll = function(){
                        var rows = $scope.getCurrentRows();
                        var _all = rows.every(function (row) {
                            return row._selected;
                        }) && rows.length > 0;
                        $scope.checkedAll = _all;
                        return _all;
                    };
                    $scope.selectAllChange = function (checkAll) {
                        var rows = $scope.getCurrentRows();
                        rows.forEach(function (row) {
                            row._selected = checkAll;
                        });
                        $scope.checkedAll = checkAll;
                    };
                    $scope.checkOne = function () {
                        var rows = $scope.getCurrentRows();
                        return rows.some(function (row) {
                            return row._selected;
                        });
                    };
                    $scope.sort = function(name, asc){
                        $scope.rows.sort(function(a, b){
                            return (a[name] > b[name] ? 1 : -1) * (asc ? 1 : -1);
                        });
                    };
                    $scope.pageSizeChange =
                    $scope.pageChange = function(){
                        $scope.rows.forEach(function(item, i){
                            item._selected = false;
                        });
                    };
                    $scope.currentItem = null;
                    $scope.$on("contextmenu", function (e, item, de, handler) {
                        $scope.currentItem = item;
                        handler.addClass("contextmenu_selected");
                        $scope.rows.forEach(function (item) {
                            item._selected = false;
                        });
                        item._selected = true;
                        $scope.$apply();
                        context_wrapper.fadeIn(200);
                        var menu = element.find(".grid_context_menu");
                        var offset = context_wrapper.offset();
                        var pos = getPosition(de, menu[0]);
                        menu.css({
                            top: pos.y - offset.top + "px",
                            left: pos.x - offset.left + "px"
                        });
                        $scope.rows.forEach(function (item) {
                            item._selected = false;
                        });
                        item._selected = true;
                        $scope.$apply();
                        e.stopPropagation();
                        de.preventDefault();
                    });
                }
            };
        }])
        .directive("gridPagination", [function(){
            return {
                restrict: "A",
                require: ["^widgetGrid"],
                conroller: function($scope){

                },
                link: function($scope, element, attrs, ctrls){
                    var grid = ctrls[0];
                    $scope.getStart = function(){
                        var current = grid.getCurrentPage();
                        var pagesize = grid.getPageSize();
                        return pagesize > 0 ? (current - 1) * pagesize + 1 : 0;
                    };
                    $scope.getEnd = function(){
                        var current = $scope.currentPage;
                        var pagesize = grid.getPageSize();
                        var end = current * pagesize;
                        var currentCount = $scope.getFilterRows().length;
                        return end < currentCount ? end : currentCount;
                    };
                    $scope.getCurrentCount = function(){
                        return $scope.getCurrentRows().length;
                    };
                }
            }
        }])
        .directive("ribbonTips", ["localize", "$route", "$location", "$interval", function(localize, $route, $location, $interval){
            return {
                restrict: "A",
                link: function($scope, element, attrs){
                    var fn_update_help_info = function(){
                        var path = $location.$$path;
                        if(/^\/resource\/network\/\d+\/?$/.test(path)){
                            path = "/resource/network/:id";
                        }
                        if(/^\/desktop\/teach\/\d+\/?$/.test(path)){
                            path = "/desktop/teach/:id";
                        }
                        var help_text = localize.localizeText(path);
                        element.attr("data-content", help_text);
                        help_text ? element.parent().show() : element.parent().hide();
                    };
                    $interval(fn_update_help_info, 500);
                }
            };
        }])
        .directive("contextmenu", [function(){
            return {
                restrict: "A",
                link: function ($scope, element, attrs) {
                    if (attrs.contextmenuDisabled !== "true") {
                        element.bind("contextmenu", function (e) {
                            $scope.$emit(attrs.contextmenuEventName || "contextmenu", $scope.item, e, element);
                        });
                    }
                }
            };
        }])

        .directive("wizard", [function () {
            return {
                restrict: "A",
                transclude: true,
                scope: {
                    lastText: "@"
                },
                controller: function ($scope) {
                    
                    var steps = $scope.steps = [];
                    $scope.currentStep = null;
                    $scope.moveWth = 0;
                    $scope.select = function (step) {
                        steps.forEach(function (s) {
                            s.selected = false;
                        });
                        $scope.currentStep = step;
                        step.selected = true;
                    };
                    $scope.getCurrentIndex = function () {
                        return steps.indexOf($scope.currentStep);
                    };

                    $scope.prev = function () {
                        var index = $scope.getCurrentIndex();
                        //var e = $scope.$emit(($scope.stepEventName || "WizardStep"), $scope.currentStep);
                        var prev = steps[index - 1];
                        prev && $scope.select(prev);
                        $scope.moveWth = $scope.getMarginValue();

                    };
                    $scope.next = function () {
                        var index = $scope.getCurrentIndex();
                        $scope.currentStep.is_dirty = true;
                        var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling);
                        if ($scope.currentStep.done !== false) {
                            var next = steps[index + 1];
                            next && $scope.select(next);
                            $scope.moveWth = $scope.getMarginValue();
                        };

                    };
                    $scope.go = function(index){
                        $scope.select(steps[index]);
                        $scope.moveWth = $scope.getMarginValue();
                    }
                    $scope.showPrev = function () {
                        return steps.indexOf($scope.currentStep) > 0;
                    };
                    $scope.isLast = function () {
                        return steps.indexOf($scope.currentStep) >= steps.length - 1;
                    };
                    $scope.done = function () {
                        var index = $scope.getCurrentIndex();
                        $scope.currentStep.is_dirty = true;
                        var e = $scope.$emit(($scope.stepEventName || "WizardStep") + "_" + index, $scope.currentStep, $scope.currentStep.$$nextSibling); 
                        if ($scope.currentStep.done !== false) {
                            var next = steps[index + 1];
                            next && $scope.select(next);
                            $scope.$emit($scope.doneEventName || "WizardDone", steps, steps.map(function (step) {
                                return step.$$nextSibling
                            }));
                        }
                    };
                    this.addStep = function (step) {
                        if (steps.length === 0) {
                            $scope.select(step);
                        }
                        steps.push(step);
                    };
                    this.jumpStep = function (index) {

                    };
                    this.removeStep = function (index) {

                    };
                    this.insertStep = function (step) {

                    };
                },
                link : function($scope, element, attrs){

                   $scope.getMarginValue = function(){
                        var _idx = $scope.getCurrentIndex();
                        var wizardWth = element.find('.wizard').outerWidth();
                        var _wth = 60;
                        for(var i = 0; i<=_idx+1 ; i++){
                            _wth+=element.find(".steps>li").eq(i).outerWidth();
                        }
                        if(wizardWth - _wth < 0){
                            return (wizardWth - _wth) ;
                        }else{
                            return 0;
                        }
                   };
                   element.find(".steps").delegate("li.complete","click",function(e){
                        var _idx = $(this).index();
                        $scope.go(_idx);
                   })
                    
                },
                template: '<div class="wizard" style="margin-bottom:20px;">\
                <ul class="steps" style="margin-left:{{moveWth}}px">\
                    <li data-ng-repeat="step in steps" data-target="#step{{ $index }}" data-ng-class="{ active: getCurrentIndex() >= $index ,complete:getCurrentIndex() > $index }">\
                        <span class="badge badge-info">{{ $index + 1 }}</span><span localize="{{step.name}}"></span><span class="chevron"></span>\
                    </li>\
                </ul>\
                <div class="actions">\
                    <button type="button" data-ng-if="showPrev()" data-ng-click="prev()" class="btn btn-sm btn-primary btn-prev">\
                        <i class="fa fa-arrow-left"></i><span data-localize="上一步"></span>\
                    </button>\
                    <button type="button" data-ng-if="!isLast()" data-ng-click="next()" class="btn btn-sm btn-success btn-next"> \
                        <span data-localize="下一步"></span> <i class="fa fa-arrow-right"></i>\
                    </button>\
                    <button type="button" data-ng-if="isLast()" data-ng-click="done()" class="btn btn-sm btn-success btn-next">\
                         <span data-localize="完成"></span><i class="fa  fa-check" ></i>\
                    </button>\
                </div>\
            </div>\
            <div class="step-content">\
                <form data-ng-transclude class="form-horizontal" id="fuelux-wizard" method="post">\
                </form>\
            </div>'
            };
        }])
        .directive("wizardStep", [function () {
            return {
                restrict: "A",
                require: "^wizard",
                transclude: true,
                replace: true,
                scope: {
                    name: "@"
                },
                controller: function ($scope) {
                },
                link: function (scope, element, attrs, wizard) {
                    wizard.addStep(scope);
                },
                template: '<div class="step-pane" data-ng-class="{ active: selected }" data-ng-show="selected" data-ng-transclude></div>'
            };
        }])

        .directive('areaTraffic', function ($interval,$http) {
            return {
                restrict: 'EA',
                replace: true,
                scope:{
                    options : "="
                },
                link: function (scope, e, attrs) {
                    Highcharts.setOptions({    //disable utc time
                        global: {    
                            useUTC: false    
                        }    
                    }); 
                    function init_data(){
                        // generate init data
                        var data = [],
                            time = (new Date()).getTime(),
                            i;

                        for (i = -40; i <= 0; i += 1) {
                            data.push({
                                x: time + i * scope.$parent.refresh_time,
                                y: 0
                            });
                        }
                        return data;
                    }
                    var hc_options = scope.options.options;
                    hc_options.chart.renderTo = e[0];
                    hc_options.yAxis.min = 0;
                    angular.forEach(hc_options.series,function(s){
                        s.data = init_data();
                    });

                    var highcharts = new Highcharts.Chart(hc_options);

                    function drawPoint(data) {
                        var datetime = (new Date()).getTime();
                        var hc_series = highcharts.series;

                        scope.options.drawpoint(hc_series,data,datetime);

                    }

                    function reset_highcharts(){
                        //reset highcharts
                        highcharts.destroy();
                        angular.forEach(hc_options.series,function(s){
                            s.data = init_data();
                        });
                        highcharts = new Highcharts.Chart(hc_options);
                    }

                    scope.$watch('$parent.metric_data',function(newvalue){
                        if(newvalue){
                            drawPoint(newvalue);
                        }
                    });

                    scope.$watch('$parent.refresh_time',function(newvalue){
                        reset_highcharts();
                    });

                    scope.$watch('$parent.item',function(newvalue){
                        reset_highcharts();
                    });

                }
            }
        })
        .directive("monitorTree", [function(){
            return {
                restrict: "A",
                transclude:true,
                template:'  <div class="portlet-title clearfix padding-5">\
                                <div class="pull-left">\
                                    <a href="javascript:" id="collape" class="btn btn-default btn-xs"><i class="fa  icon-jj-Shrinkfrom"></i> </a>\
                                    <a href="javascript:" id="open" class="btn btn-default  btn-xs"><i class="fa icon-jj-Open"></i></a>\
                                </div>\
                                <div class="pull-right"><a href="javascript:"class="btn btn-default  btn-xs" ng-init="ishow=false" ng-click="ishow==true?ishow=false:ishow=true"><i class="fa fa-search"></i></a></div> \
                            </div>\
                            <div class="search" ng-show="ishow"><input type="search" localize="请输入搜索内容" ng-model="searchText"></div>\
                            <div class="portlet-body fuelux monitor-tree" data-ng-transclude></div>',
                link: function(scope, element, attrs){
                    element.delegate('#open', 'click', function(event) {
                        element.find(".parent").addClass('in');
                    });
                    element.delegate('#collape', 'click', function(event) {
                        element.find(".parent").removeClass('in');
                    });
                    element.delegate (".tree-toggle","click",function(event){
                        var parent =$(this).parent().parent(".parent");
                        if(parent.hasClass('in')){
                            parent.removeClass('in');
                        }else{
                            parent.addClass("in");
                        }
                    });
                    element.delegate(".tree-it","click",function(event){
                        element.find("li").removeClass('active');
                        $(this).parent("li").addClass('active');
                    });
                }
            };
        }])
        .directive('ipPattern',function (ip_pattern) {

    		return {
    		  require: ['ngModel','?ngRequired'],
    		  link: function (scope, elm, attrs, ctrls) {
    			var ngmodelctl = ctrls[0];
    			var ngrequiredctl = ctrls[1];

    			ngmodelctl.$parsers.push(function (viewValue) {

    			  if (ip_pattern.test(viewValue)||(!ngrequiredctl&&!viewValue)) {

    				ngmodelctl.$setValidity('ipcheck', true);
    				return viewValue;
    			  } else {

    				ngmodelctl.$setValidity('ipcheck', false);
    				return undefined;
    			  }
    			});
    		  }
    		}

        })
        .directive("preventSpace", [function(){
    		return {
    		  restrict: "A",
    		  link: function(scope, element, attrs){
    			element.on("keypress",function(e){
    			  if(e.keyCode === 32){
    				e.preventDefault();
    			  }
    			})
    		  }
    		};
    	  }])
        .directive("inputNumber", [function(){
            return {
                restrict: "AE",
                link: function(scope, element, attrs){
                    element.on("keypress",function(e){
                        if(e.keyCode < 48 || e.keyCode > 57){
                            e.preventDefault();
                        }
                    });
                    element.on("keydown",function(e){
                       if(e.keyCode === 229){
                            e.preventDefault();
                            e.stopPropagation();
                       }
                    });
                }
            };
        }])
        .directive("formatIp", ["$compile",function($compile){
            return {
                restrict:"EA",
                require:"ngModel",
                scope:{},
                link:function(scope,element,attrs,ctrl){
                    var ngModelCtrl = ctrl;

                    if(!ngModelCtrl){
                        return;
                    };

                    var popEl = angular.element("<div format-ip-wrap></div>");
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
        .directive("formatIpWrap",function(){
            return {
                restrict: "AE",
                replace: true,
                template: '<span role="ipgroup"><input type="text" ng-model="seg1"><span class="dot">.</span><input type="text" ng-model="seg2"><span class="dot">.</span><input type="text" ng-model="seg3"><span class="dot">.</span><input type="text" ng-model="seg4"></span>',
                link: function(scope,element,attrs){
                    element.on("keydown","input",function(event){
                            var code = event.keyCode;
                            switch(true){
                                case code === 110 || code === 190: {
                                    var nextEles = $(this).nextAll("input");
                                    nextEles.length && nextEles.eq(0).focus();
                                    event.preventDefault();
                                    break;
                                };
                                case code === 8: {
                                    if(!$(this).val()){
                                        $(this).prevAll("input").length && $(this).prevAll("input").eq(0).focus();
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
                    element.on("paste",function(e){
                        e.preventDefault();
                    });
                    element.on("focus", "input", function(e){
                        element.addClass("focus");
                    });
                    element.on("blur", "input", function(e){
                        element.removeClass("focus");
                    });
                }
            }
        })
        .directive("uiMenuList", ["Admin","User","Domain","$q",function(APIadmin,APIuser,APIdomain,$q){
            return {
                restrict: "AE",
                scope:{
                    selected: "=menuListData"
                },
                templateUrl: "includes/userMenu.html",
                controller: function($scope){
                    $scope._users = [];
                    $scope.selected = $scope.selected || [];
                    $scope.seRows = [];
                    $scope.rmRows = [];
                    function get_admin(){
                        var deferred = $q.defer();
                        APIadmin.query(function(res){
                            deferred.resolve(res);
                        });
                        return deferred.promise;
                    }
                    function get_user(){
                        var deferred = $q.defer();
                        APIuser.query(function(res){
                            deferred.resolve(res);
                        });
                        return deferred.promise;
                    }
                    function get_domain(){
                        var deferred = $q.defer();
                        APIdomain.list(function(res){
                            deferred.resolve(res);
                        });
                        return deferred.promise;
                    }
                    $q.all([get_admin(),get_user(),get_domain()]).then(function(arr){

                        $scope._users = [{
                            typeName: $$$I18N.get("管理用户"),
                            userData: arr[0].users
                        },{
                            typeName: $$$I18N.get("普通用户"),
                            userData: arr[1].users
                        },{
                            typeName: $$$I18N.get("域用户"),
                            userData: arr[2].result
                        }]
                        console.log($scope._users,arr)
                    });
                    $scope.add_selected = function(items){
                        var rows = items instanceof Array ? items : [items];
                        rows.forEach(function(i){
                            if($scope.selected.indexOf(i) === -1){
                                $scope.selected.push(i);
                            }
                        });
                    };

                    $scope.remove_selected = function(items){
                        var rows = items instanceof Array ? items : [items];
                        rows.forEach(function(i){
                            $scope.selected.splice($scope.selected.indexOf(i),1);
                        });
                        $scope.rmRows = [];
                    };
                    var lastRow2 = null;
                    $scope.add_select_rows = function(e,item,items){
                        var idx = $scope.seRows.indexOf(item);
                        if(e.ctrlKey){
                            idx === -1 ? $scope.seRows.push(item) : $scope.seRows.splice(idx,1);
                            lastRow2 = item;
                        }else if(e.shiftKey){
                            var begin_idx = items.indexOf(lastRow2);
                            var end_idx = items.indexOf(item);
                            if(begin_idx === -1){
                                lastRow2 = item;
                                $scope.seRows = [item];
                            }else{
                                $scope.seRows = items.slice(Math.min(begin_idx,end_idx),Math.max(begin_idx,end_idx)+1);
                            }
                        }else{
                            $scope.seRows.splice(0,$scope.seRows.length,item);
                            lastRow2 = item;
                        }
                    };
                    var lastRow = null;
                    $scope.add_remove_rows = function(e,item){
                        var idx = $scope.rmRows.indexOf(item);
                        if(e.ctrlKey){
                            idx === -1 ? $scope.rmRows.push(item) : $scope.rmRows.splice(idx,1);
                            lastRow = item;
                        }else if(e.shiftKey){
                            var begin_idx = $scope.selected.indexOf(lastRow);
                            var end_idx = $scope.selected.indexOf(item);
                            if(begin_idx !== -1 && end_idx !== -1){
                                $scope.rmRows = $scope.selected.slice(Math.min(begin_idx,end_idx),Math.max(begin_idx,end_idx)+1); 
                            }else{
                                $scope.rmRows = [item];
                                lastRow = item;
                            }
                        }
                        else{
                            $scope.rmRows.splice(0,$scope.rmRows.length,item);
                            lastRow = item;
                        }
                    };
                    $scope.ltor = function(){
                        $scope.add_selected($scope.seRows);
                    };
                    $scope.rtol = function(){
                        $scope.remove_selected($scope.rmRows);
                    }
                },
                link: function(scope, element, attrs){
                    var last = null;
                    element.on("click",".menu_header",function(e){
                        $(this).toggleClass("open");
                    });
                    element.on("click",".menuitem", function(e){
                        var ele = $(this);
                        var menuItems = ele.parent(".menu_body").find(".menuitem");
                        var allMenuItems = ele.parents(".menus").find(".menuitem");
                        if(e.ctrlKey){
                            ele.hasClass("itemActive") ? ele.removeClass("itemActive") : ele.addClass("itemActive");
                            last = ele;
                        }else if(e.shiftKey){
                            var begin_idx = [].indexOf.apply(menuItems,last);
                            var end_idx = [].indexOf.apply(menuItems,ele);
                            allMenuItems.removeClass("itemActive");
                            if(begin_idx !== -1 && end_idx !== -1){
                                for(var i = 0; i < menuItems.length; i++){
                                    if(i > Math.max(begin_idx,end_idx) || i < Math.min(begin_idx,end_idx)){
                                        menuItems.eq(i).removeClass("itemActive");
                                    }else{
                                        menuItems.eq(i).addClass("itemActive");
                                    }
                                }
                            }else{
                                ele.addClass("itemActive");
                                last = ele;
                            }
                        }else{
                            allMenuItems.removeClass("itemActive");
                            ele.addClass("itemActive");
                            last = ele;
                        }
                        
                    });
                }
            };
        }])
})();
