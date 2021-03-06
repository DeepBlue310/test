//葛世恒
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    menuList: {},//菜单集合
    animationData: {},
    startPoint: {},//触摸开始
    dotPoint: {},//圆点坐标
    startAngle: 0,//开始角度
    tempAngle: 0,//移动角度
    downTime: 0,//按下时间
    upTime: 0,//抬起时间
   // isRunning: false,//正在滚动
  },
  showName: function (e) {
    var name = e.currentTarget.dataset.name;
    console.log(name);
    if(name=="计算器"){
      wx.navigateTo({
        url: '../cal/cal',
      })
    }
    if(name=="进制转换"){
      wx.navigateTo({
        url: '../number-conversion/number-conversion',
      })
    }
    if(name=="定积分"){
      wx.navigateTo({
        url: '../di/di',
      })
    }
    if(name=="小游戏"){
      wx.navigateTo({
        url: '../game/game',
      })
    }
    if (name == "函数绘制") {
      wx.navigateTo({
        url: '../map/map',
      })
    }
    if (name == "问题与帮助") {
      wx.navigateTo({
        url: '../help/help',
      })
    }
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
      })
    })
    wx.getSystemInfo({
      success: function (res) {
        var windowWidth = res.windowWidth * 0.5;
        that.setData({
          //圆点坐标,x为屏幕一半,y为半径与margin-top之和,px
          //后面获取的触摸坐标是px,所以这里直接用px.
          dotPoint: { clientX: windowWidth, clientY: 250 }
        })
      }
    })
  },
  
  onReady: function (e) {
    var that = this;
    app.menuConfig = {
      menu: [
        { 'index': 0, 'menu': '计算器', 'src': '../images/account.png' },
        { 'index': 1, 'menu': '进制转换', 'src': '../images/card.png' },
        { 'index': 2, 'menu': '定积分', 'src': '../images/transfer.png' },
        { 'index': 3, 'menu': '函数绘制', 'src': '../images/loan.png' },
        { 'index': 4, 'menu': '小游戏', 'src': '../images/service.png' },
        { 'index': 5, 'menu': '问题与帮助', 'src': '../images/transfer.png' }
      ]
    }
    // 绘制转盘
    var menuConfig = app.menuConfig.menu,
      len = menuConfig.length,
      menuList = [],
      degNum = 360 / len  // 文字旋转 turn 值
    for (var i = 0; i < len; i++) {
      menuList.push({ deg: i * degNum, menu: menuConfig[i].menu, src: menuConfig[i].src });
      console.log("menu:" + menuConfig[i].menu)
    }
    that.setData({
      menuList: menuList
    });
  },
  // 菜单拖动的三个方法
  buttonStart: function (e) {
    this.setData({
      startPoint: e.touches[0]
    })
    var x = this.data.startPoint.clientX - this.data.dotPoint.clientX;
    var y = this.data.startPoint.clientY - this.data.dotPoint.clientY;
    var startAngle = Math.asin(y / Math.hypot(x, y)) * 180 / Math.PI;
    this.setData({
      startAngle: startAngle
    })

  },
  buttonMove: function (e) {
    //获取滑动时的时间
    var downTime = Date.now();
    this.setData({
      downTime: downTime
    })
    var that = this;
    var endPoint = e.touches[e.touches.length - 1]
    //根据触摸位置计算角度
    var x = endPoint.clientX - this.data.dotPoint.clientX;
    var y = endPoint.clientY - this.data.dotPoint.clientY;
    var moveAngle = Math.asin(y / Math.hypot(x, y)) * 180 / Math.PI
    var quadrant = 1;
    if (x >= 0) {
      quadrant = y >= 0 ? 4 : 1;
    } else {
      quadrant = y >= 0 ? 3 : 2;
    }
    var tempAngle = 0;
    // 如果是一、四象限，则直接end角度-start角度，角度值都是正值  
    if (quadrant == 1 || quadrant == 4) {
      tempAngle += moveAngle - this.data.startAngle;
    } else
    // 二、三象限，色角度值是负值  
    {
      tempAngle += this.data.startAngle - moveAngle;
    }
    var menuConfig = app.menuConfig.menu;
    var menuList = [];
    for (var i = 0; i < this.data.menuList.length; i++) {
      menuList.push({ deg: this.data.menuList[i].deg + tempAngle, menu: menuConfig[i].menu, src: menuConfig[i].src });
    }
    this.setData({
      menuList: menuList
    })
    //重置开始角度
    this.setData({
      startPoint: e.touches[e.touches.length - 1]
    })
    var endX = this.data.startPoint.clientX - this.data.dotPoint.clientX;
    var endY = this.data.startPoint.clientY - this.data.dotPoint.clientY;
    var startAngle = Math.asin(endY / Math.hypot(endX, endY)) * 180 / Math.PI;
    this.setData({
      startAngle: startAngle,
      tempAngle: tempAngle
    })
  },
  buttonEnd: function (e) {
    // 计算，每秒移动的角度 
    var that = this;
    var upTime = Date.now();
    var angleSpeed = this.data.tempAngle * 1000 / (upTime - this.data.downTime);
    if (Math.abs(angleSpeed) < 100) {
      //速度小于100时,停止滚动
      return
    } else {
      //速度大于100时,自动滚动
      if (angleSpeed > 0) {
        if (angleSpeed > 500) angleSpeed = 500
        var animationRun = wx.createAnimation({
          duration: 2000,
          //ease-out结束时减速
          timingFunction: 'ease-out'
        })
        that.animationRun = animationRun
        animationRun.rotate(angleSpeed).step()
        that.setData({
          animationData: animationRun.export(),
        })
      }
      else {
        if (angleSpeed < -500) angleSpeed = -500
        angleSpeed = Math.abs(angleSpeed);
        var animationRun = wx.createAnimation({
          duration: 2000,
          // ease-out结束时减速
          timingFunction: 'ease-out'
        })
        that.animationRun = animationRun
        animationRun.rotate(-angleSpeed).step()
        that.setData({
          animationData: animationRun.export(),
        })
      }
    }
  }
})


