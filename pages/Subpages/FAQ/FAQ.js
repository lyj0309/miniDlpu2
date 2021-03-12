// pages/Subpages/FAQ/FAQ.js
const API = require("../../../script/API");
Page({

    /**
     * 页面的初始数据
     */
    data: {
        focusIndex: -1,
        // 保存了所有FAQ的对象，三层嵌套
        FAQ: []

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        API.request(API.FAQ, {
            success: r => {
                this.setData({FAQ: r.data})
                console.log(r.data)
            }

        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },
    /**
     * 点击问题区域，一次性只会显示一个答案
     * @param {*} e
     */
    tapQuestion: function (e) {
        //console.log(e)
        if (e.currentTarget.dataset.faqindex == this.data.focusIndex) {
            this.setData({
                focusIndex: -1
            })
        } else {
            this.setData({
                focusIndex: e.currentTarget.dataset.faqindex
            })
        }

    },
    /**
     * 点击可跳转的文字链接
     * @param {*} e
     */
    jumpToPage: function (e) {
        // console.log(e)
        wx.navigateTo({
            url: e.target.dataset.url,
        })

    }
})