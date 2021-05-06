//app.js

const KCB = require("./script/KCB");
const API = require("./script/API");
const CONFIG = require("./package.js")
App({
    onLaunch: function () {
        wx.cloud.init()

        let ver = wx.getStorageSync(`version`)

        if (ver !== CONFIG["version"]) {
            wx.showModal({
                title: '掌上教务处v' + CONFIG["version"],
                content: '更新内容：\r\n' + CONFIG["info"],
                confirmText: '好的',
                showCancel: false,
            })
            wx.setStorageSync("version", CONFIG["version"])
        }


        //API.request(API.GET_STATIC_DATA, {})
    },
    onShow(options) {

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