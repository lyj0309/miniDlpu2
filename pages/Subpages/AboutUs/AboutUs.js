// pages/setting-detail/AboutUs.js

const CONFIG = require("../../../package")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CONFIG
  },
  onShow: function(){
  },
  onLoad: function(){
    console.log(CONFIG)
  },
  openImg(){
  wx.previewImage({
    urls:["http://cdn.nogg.cn/myqrcode.jpg"],
    current:"http://cdn.nogg.cn/myqrcode.jpg"
  })
  }
})