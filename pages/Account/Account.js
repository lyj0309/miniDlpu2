// pages/Account/Account.js
const API = require("../../script/API");

const pageUrl = [
    "/pages/Subpages/StudentId/StudentId",
    "/pages/Subpages/FAQ/FAQ",
    "/pages/Subpages/Storage/Storage",
    "/pages/Subpages/Setting/Setting",
    "/pages/Subpages/AboutUs/AboutUs",
    "/pages/Information/simple/index?name=off_count"
];

Page({

    /**
     * 页面的初始数据
     */
    data: {
        clickOff:true,
        pages: ['FAQ', '缓存管理', '课表设置', '关于我们'],
    },

    /**
     * @function jump
     * @description 链接点击事件 跳转到相应页面
     * @param e 事件
     */
    jump: function (e) {
        const id = e.currentTarget.dataset.id
        if (id === 5){
            wx.setStorageSync("clickOff", true)
            this.setData({
                clickOff:true
            })
        }
        wx.navigateTo({
            url: pageUrl[id],
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
        let clickOff = wx.getStorageSync("clickOff")
        if (clickOff === undefined || clickOff === null || clickOff === "") {
            clickOff = false
            wx.setStorageSync("clickOff", clickOff)
        }
        this.setData({
            clickOff: clickOff
        })

        API.getUserData(e => {
            this.setData(e)
        })

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
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    onShareTimeline(){}

})