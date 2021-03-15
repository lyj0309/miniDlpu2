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
  openImg(){
  wx.previewImage({
    urls:["http://cdn.nogg.cn/myqrcode.jpg"],
    current:"http://cdn.nogg.cn/myqrcode.jpg"
  })
  }
})