//依赖arttemplate
;(function(){
	//需要渲染的div的id
	meishijia.page.renderId = "page";
	//上一个页面。用途：执行本次页面init需要销毁上一个页面
	meishijia.page._previous = null;
	//根据模板和json数据 生成html  
	//tplName 模板名称 data 数据
	//可以在这里设置 默认的数据
	meishijia.page.createHtml = function(tplName,data){
		data = data || {};
		var html = template(tplName, data);
		return html;
	}

	//tplName 模板名称 data 数据 animateType 转场类型
	meishijia.page.render = function(tplName,data){
		if(!tplName){return};
		var html = meishijia.page.createHtml(tplName,data);
		var renderDom = $("#"+meishijia.page.renderId);
		renderDom.html(html);
	};

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
		if(hash && hash.length>1 && hash != router.currentHash){
			router.currentHash = hash;
			hash = hash.substring(1);
			var routerArr = router.routerArr;
			var matchs = null;
			for(var i=0;i<routerArr.length;i++){
				var reg = routerArr[i].reg;
				var pageName = routerArr[i].pageName;
				matchs = reg.exec(hash);
				if(matchs){
					var args = matchs.slice(1);
					var currentPage = meishijia.page[pageName];
					if(currentPage){
						if(typeof currentPage[init] === "function"){
							console.log(pageName+' not have init method');
						}
						else{
							//销毁上一个页面后 执行当前页面init方法
							if(meishijia.page._previous 
								&& typeof meishijia.page._previous['dispose'] === "function"){
								meishijia.page._previous['dispose'].call(meishijia.page._previous);
							}
							currentPage[init].apply(currentPage,args);
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
})();
