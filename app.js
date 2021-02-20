//app.js

const KCB = require("./script/KCB");
const API = require("./script/API");
const CONFIG = require("./package.js")
App({
    onLaunch: function () {
/*        let ver = wx.getStorageSync(`version`)

        if (ver !== CONFIG["version"]) {
            wx.showModal({
                title: '掌上教务处v' + CONFIG["version"],
                content: '更新内容：\r\n1.校历改版，界面美化\r\n2.成绩默认查询根据上一次查询决定\r\n3.解决深色模式下无法添加自定义课程的bug',
                confirmText: '好的',
                showCancel: false,
            })
            wx.setStorageSync("version", CONFIG["version"])

            console.log(`更新成功`)
        }*/
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