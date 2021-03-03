// pages/setting-detail/AboutUs.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onShow: function(){
  },
  onLoad: function(){
  },
  openImg(){
  wx.previewImage({
    urls:["http://cdn.nogg.cn/myqrcode.jpg"],
    current:"http://cdn.nogg.cn/myqrcode.jpg"
  })
  }
})