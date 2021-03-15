// pages/setting-detail/AboutUs.js

const CONFIG = require("../../../package")
const API = require("../../../script/API");
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
    API.request(API.ABOUTUS,{
      success:r=>{
        this.setData({data:r.data.split(/\s/)})
      }
    })
    console.log(CONFIG)
  },

  copyQQGroup: function(){
    wx.setClipboardData({
      //准备复制的数据内容
      data: "634740972",
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },

  openImg(){
  wx.previewImage({
    urls:["http://cdn.nogg.cn/myqrcode.jpg"],
    current:"http://cdn.nogg.cn/myqrcode.jpg"
  })
  }
})