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
  setrepo: function () {
    wx.setClipboardData({
      data: 'https://github.com/Patrick-Jun/miniDLPU',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功！',
              duration: 1000
            });
          }
        })
      }
    })
  },
  setemail: function () {
    wx.setClipboardData({
      data: 'PatrickJun@xy.dlpu.edu.cn',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '邮箱复制成功！',
              duration: 1000
            });
          }
        })
      }
    })
  },
  setwx: function () {
    wx.setClipboardData({
      data: 'Kmitle',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '微信复制成功！',
              duration: 1000
            });
          }
        })
      }
    })
  },
  setqq: function () {
    wx.setClipboardData({
      data: '583195863',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: 'QQ复制成功！',
              duration: 1000
            });
          }
        })
      }
    })
  },
  setgz: function () {
    wx.setClipboardData({
      data: 'dlpurunner',
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '公众号复制成功！',
              duration: 1000
            });
          }
        })
      }
    })
  }
})