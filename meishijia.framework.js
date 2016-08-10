//依赖arttemplate
;(function(){
	if(typeof meishijia === "undefined") meishijia={};
	if(typeof meishijia.db === "undefined") meishijia.db={};
	if(typeof meishijia.view === "undefined") meishijia.view={};

	//需要渲染的div的id
	meishijia.view.renderId = "page";
	//根据模板和json数据 生成html  
	//tplName 模板名称 data 数据
	//可以在这里设置 默认的数据
	meishijia.view.createHtml = function(tplName,data){
		data = data || {};
		var html = template(tplName, data);
		return html;
	}

	//tplName 模板名称 data 数据 animateType 转场类型
	meishijia.view.render = function(tplName,data){
		if(!tplName){return};
		var html = meishijia.page.createHtml(tplName,data);
		var renderDom = $("#"+meishijia.page.renderId);
		renderDom.html(html);
	};

	/*
	//cache的格式
	meishijia.page.cache = {
		html:'',
		disposeTime:'',
		scrollTop:0,
		instance:{}
	}
	*/

	meishijia.page = function(opt){
		_extend(this,opt);
		this._cache = null;
		this._cacheKey = "";
		//调度器调用base方法
		this._baseInit = function(){
			console.log(this);
			this._cacheKey = location.hash || location.href;
			//检查是否有缓存
			this._cache = sessionStorage[this._cacheKey];
			if(this._cache){
				this._cache = JSON.parse(this._cache);
				this._cache.instance = JSON.parse(this._cache.instance);
				this._baseResume();
			}
			else{
				this.init();
			}
		}
		this._baseResume = function(){
			//恢复
			var cache = this._cache;
			$("#"+meishijia.view.renderId).html(cache.html);
			$("body").scrollTop(cache.scrollTop);
			//还原各个属性
			for(var key in cache.instance){
				this[key] = cache.instance[key];
			}
			this.resume(cache.disposeTime);
			this.bindEvent();
		}
		this._baseDispose = function(){
			//添加或更新缓存
			var cache = {
				html:$("#"+meishijia.view.renderId).html(),
				disposeTime:+new Date,
				scrollTop:$("body").scrollTop(),
				instance:JSON.stringify(this)
			}
			sessionStorage[this._cacheKey] = JSON.stringify(cache);
			this.dispose();
		}
	}

	/*
	路由，用法：
	var appRouter = new meishijia.router({
		routes : {
			"index" : "index",
			"product/:id" : "product"
		}
	});
	appRouter.start();
	*/
    meishijia.router = function(opt){
		_extend(this,opt);
		this.currentHash = '';
		this.routerArr = [];
		this.start = function(){
			var _this = this;
			for(var route in this.routes){
				var pageName = this.routes[route];
				var reg = _routeToRegExp(route);
				this.routerArr.push({reg:reg,pageName:pageName,origin:route});
			}
			_checkHash(_this);
			window.onhashchange = function(){
				_checkHash(_this);
			}
		}
    }
	
    var _checkHash = function(router){
		var hash = location.hash;
		if(hash && hash.length > 1 && hash != router.currentHash){
			router.currentHash = hash;
			hash = hash.substring(1);
			var routerArr = router.routerArr;
			var matchs = null;
			for(var i=0;i<routerArr.length;i++){
				var reg = routerArr[i].reg;
				var pageName = routerArr[i].pageName;
				matchs = reg.exec(hash);
				if(matchs){
					//从hash中获取参数
					var args = matchs.slice(1);
					//页面对象
					var currentPage = meishijia.view[pageName];
					if(currentPage){
						if(typeof currentPage['_baseInit'] !== "function"){
							console.log(pageName+' not have init method');
						}
						else{
							//销毁上一个页面后 执行当前页面init方法
							if(meishijia.page._previous
								&& typeof meishijia.page._previous['_baseDispose'] === "function"){
								meishijia.page._previous['_baseDispose'].call(meishijia.page._previous);
							}
							currentPage['_baseInit'].apply(currentPage,args);
							meishijia.page._previous = currentPage;
						}
					}
					else{
						console.log('no page matches');
					}
					break;
				}
			}
			if(matchs==null){
				console.log('no router matches');
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

    var _getParam = function(name) {
		var hash = location.hash.substr(location.hash.indexOf('?'))
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = hash.substr(1).match(reg);
		if (r != null) {
			return unescape(r[2]);
		}
		return "";
	}
})();
