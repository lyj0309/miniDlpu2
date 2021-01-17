//app.js

const KCB = require("./script/KCB");
const API = require("./script/API");
const CONFIG = require("./package.js")
App({
    onLaunch: function () {
        let ver = wx.getStorageSync(`version`)
        if (ver !== CONFIG["version"]) {
            let user = wx.getStorageSync(`userid`)
            let pwd = wx.getStorageSync(`userpwd`)
            console .log(user,pwd)
            wx.clearStorageSync()
            wx.setStorageSync("version", CONFIG["version"])
            wx.setStorageSync("user", user)
            wx.setStorageSync("pwd", pwd)
            console.log(`更新成功`)
        }
        API.request(API.GET_STATIC_DATA, {})
    },
    globalData: {

        // 静态数据
        StaticData: {},

        // 用户数据
        UserData: {},

        // 学期数据列表
        TermList: {},

        // 学期数据列表
        TermData: [],

        // 弹窗
        Pooping: {},

    },

    /**
     * @function getTermList
     * @description 获取学期列表
     * @returns list
     */
    getTermList: function () {

        // 如果当前全局数据存在 直接返回
        if (
            this.globalData.TermList &&
            this.globalData.TermList.length > 0
        )
            return this.globalData.TermList;

        // 去缓存中寻找
        let TermList = null;
        let storageList = Storage.get();
        if (
            storageList.TermList &&
            storageList.length > 0
        )
            return this.globalData.TermList = storageList;
        else if (!storageList) TermList = [];
        else if (storageList.length === 0) TermList = storageList;

        //
    },

    /**
     * @function getTermData
     * @description 获取学期课表数据
     * @param term 学期
     */
})