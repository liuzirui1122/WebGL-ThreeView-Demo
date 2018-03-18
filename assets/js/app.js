//全局设定
var App = function(aCanvas) {
    var app = this;
    this.time = 0;
    
    window.initEnter = 0; //处理Enter事件和聊天框focus
    var model, canvas, context, messageHandler, mouse = {
        x: 0,
        y: 0,
        worldx: 0,
        worldy: 0,
        tadpole: null
    },

    messageQuota = 5; //消息限制数量(最高5个，每50帧回复1个)



    app.update = function() {
        
        app.time++;
        //更新UI！！
        $("#hpBar").css("width",Math.floor(197*model.userTadpole.hp/model.userTadpole.hpmx)+"px");
        $("#hpBarText").text("Hp: "+model.userTadpole.hp.toFixed(1)+" / "+model.userTadpole.hpmx);
        $("#expBar").css("width",Math.floor(197*model.userTadpole.exp/tadpoleExp[model.userTadpole.level+1])+"px");
        $("#expBarText").text("Exp: "+model.userTadpole.exp+" / "+tadpoleExp[model.userTadpole.level+1]);
        
        var statusText = "";
        statusText += "<i class=\"fa fa-fw\"></i>Level: "+model.userTadpole.level+"<br>";
        statusText += "<i class=\"fa fa-fw\"></i>Position:  ("+model.userTadpole.x.toFixed(1)+",";
        statusText += model.userTadpole.y.toFixed(1)+")<br>";
        statusText += "<i class=\"fa fa-fw\"></i>Speed: "+model.userTadpole.speed.toFixed(1)+"<br>";
        statusText += "<i class=\"fa fa-fw\"></i>Shield: "+model.userTadpole.shield.hp+"<br>";
        
        $("#selfStatusText").html(statusText);
        
        
        
        //----
        //每隔50帧能发个消息
        if (messageQuota < 5 && model.userTadpole.age % 50 == 0) {
            messageQuota++;
        }

        // 更新主机位置
        var mvp = getMouseWorldPosition();
        mouse.worldx = mvp.x;
        mouse.worldy = mvp.y;
        model.mousex = mvp.x;
        model.mousey = mvp.y;
        model.userTadpole.userUpdate(mouse.worldx, mouse.worldy,null);
        
        if (model.userTadpole.age % 6 == 0 && model.userTadpole.changed > 1) {
            model.userTadpole.changed = 0;
        }
        
        //找出最近物品
        var hasInsight = false;
        if (model.items.length>0) {
            for (var i = model.items.length-1;i>=0;i--) 
                if (getDistance(model.items[i].x,model.items[i].y,mvp.x,mvp.y)<model.items[i].size*2) {
                    hasInsight = true;
                    if (model.insightItem == null) model.insightItem = model.items[i];
                    else if (getDistance(model.items[i].x,model.items[i].y,mvp.x,mvp.y)<getDistance(model.insightItem.x,model.insightItem.y,mvp.x,mvp.y)) model.insightItem = model.items[i];
                }             
        }
        console.log(model.items.length);
        if (!hasInsight) model.insightItem = null; 

        //更新镜头
        model.camera.update(model);

        //更新主机
        model.userTadpole.update(mouse,model);
        
        //更新箭头
        for (i in model.arrows) {
            var cameraBounds = model.camera.getBounds();
            var arrow = model.arrows[i];
            arrow.update();
        }
        
        //更新其他机体
        for (var i = model.tadpoles.length-1;i>=0;i--) {
            model.tadpoles[i].update(mouse,model);
            if(model.tadpoles[i].die) {
                model.tadpoles.splice(i,1);
                model.arrows.splice(i,1);
            }
        }
        
        //更新特效
        for (var i = model.effects.length-1;i>=0;i--) {          
            model.effects[i].update();
            if(model.effects[i].die) model.effects.splice(i,1);
        }
        
         //更新物品
        for (var i = model.items.length-1;i>=0;i--) {
            model.items[i].update(model);
            if(model.items[i].die) model.items.splice(i,1);
        }
        
        //更新水粒子
        for (i in model.decoStars) {
            model.decoStars[i].update(model.camera.getOuterBounds(), model.camera.zoom);
        }
        
        //更新弹出消息
        model.noticeHandler.update();
        
        //更新敌人生成器
        model.enemyGenerator.update(model,app.time);
        //武器在tadpole.update中更新
    };

    //全局绘制
    app.draw = function() {
        
        //开始画全局物体------------------------
        model.camera.setupContext();

        //绘制水粒子
        for (i in model.decoStars) {
            model.decoStars[i].draw(context);
        }
        
        //绘制特效
        for (i in model.effects) {
            model.effects[i].draw(context);
        }
        
        //绘制物品
        for (i in model.items) {
            model.items[i].draw(context);
        }

        //绘制主机
        for (id in model.tadpoles) {
            model.tadpoles[id].draw(context);
        }

        //开始UI层级布置(重置变换矩阵) 将transfrom归为正常以绘制UI
        model.camera.startUILayer();
        
        //开始画UI------------------------------
        
        //绘制箭头
        for (i in model.arrows) {
            model.arrows[i].draw(context, canvas);
        }
        
        /*
        context.save();
        context.font="14px FontAwesome";
        context.fillStyle="rgba(255,255,255,.9)";
        var txt = "\uf036"  
        context.fillText(txt,100,100);
        context.restore();     
        
        */
    };
    


    //单击
    app.mousedown = function(e) {
        

    };

    //如果是松开左键,设动量为0
    app.mouseup = function(e) {
       
    };

    //监控鼠标位置
    app.mousemove = function(e) {
       
    };

    //按键
    app.keydown = function(e) {
       
       
    };

    //松开按键
    app.keyup = function(e) {
       
    };
    

    //浏览器窗口变化
    app.resize = function(e) {
        resizeCanvas();
    };
    
    var resizeCanvas = function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    /* 
    //设置性别
	app.setsex = function(sex){
		model.userTadpole.sex = sex;
		$.cookie('sex', sex, {expires:14});
	}
	
    
    //设置头像
	app.seticon = function(icon){
		model.userTadpole.icon = icon;
		$.cookie('icon', icon, {expires:14});
	}
    */

    //返回鼠标的全局位置
    var getMouseWorldPosition = function() {
        return {
            x: (mouse.x + (model.camera.x * model.camera.zoom - canvas.width / 2)) / model.camera.zoom,
            y: (mouse.y + (model.camera.y * model.camera.zoom - canvas.height / 2)) / model.camera.zoom
        }
    };
    
    
    // 主初始化
    (function() {
        canvas = aCanvas;
        context = canvas.getContext('2d');
        resizeCanvas();

        
    
    })();
}