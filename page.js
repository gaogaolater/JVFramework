(function(){
    JV = {};
    JV.View = function(opt){
    	//页面流程控制init start resume stop destory
    	console.log(typeof opt);
    	//opt.call(this);
    }
    JV.History = {
    	list:[],
    	push:function(page){
    		this.list.push(page);
    	}
    };
    JV.Router = function(opt){
		//每次路由返回页面对象，存储到History对象中
		_extend(this,opt);
		this.currentHash = '';
		//[0] regexp [1] function
		this.routerArr = [];
		this.start = function(){
			var _this = this;
			for(var route in this.routes){
				var funcName = this.routes[route];
				if(funcName){
					var func = this[funcName];
					if(func && typeof func == "function"){
						var reg = _routeToRegExp(route);
						this.routerArr.push({reg:reg,func:func,origin:route});
					}
				}
			}
			console.log(this.routerArr);
			
			setInterval(function(){
				_checkHash(_this);
			},100);
			window.onhashchange = function(){
				_checkHash(_this);
			}
		}
    }
	
    var _checkHash = function(router){
		var hash = location.hash;
		if(hash && hash.length>1 && hash != router.currentHash){
			router.currentHash = hash;
			hash = hash.substring(1);
			var methodstr = router.routes[hash];
			if(methodstr && typeof router[methodstr] == "function"){
				router[methodstr]();
			}
			else{
				var routerArr = router.routerArr;
				var matchs = null;
				for(var i=0;i<routerArr.length;i++){
					var reg = routerArr[i].reg;
					matchs = reg.exec(hash);
					if(matchs){
						var args = matchs.slice(1);
						routerArr[i].func.apply(this,args);
						break;
					}
				}
			}
		}
    }
	
	
	var optionalParam = /\((.*?)\)/g;
	var namedParam    = /(\(\?)?:\w+/g;
	var splatParam    = /\*\w+/g;
	var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
	
	var _routeToRegExp = function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    }

    var _extend = function(self,sup){
    	for(var item in sup){
    		self[item] = sup[item];
    	}
    }
})();
