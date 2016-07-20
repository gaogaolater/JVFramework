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
		this.start = function(){
			var _this = this;
			setInterval(function(){
				_checkHash(_this,1);
			},100);
			window.onhashchange = function(){
				console.log(arguments);
				_checkHash(_this,2);
			}
		}
    }

    var _checkHash = function(router,flag){
		var hash = location.hash;
		if(hash && hash.length>1 && hash != router.currentHash){
			console.log(flag);
			router.currentHash = hash;
			hash = hash.substring(1);
			var methodstr = router.routes[hash];
			if(methodstr && typeof router[methodstr] == "function"){
				router[methodstr]();
			}
		}
    }

    var _extend = function(self,sup){
    	for(var item in sup){
    		self[item] = sup[item];
    	}
    }
})();