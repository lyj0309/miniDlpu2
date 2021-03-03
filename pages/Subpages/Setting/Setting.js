const {get, set} = require("../../../script/API");
// pages/Subpages/Setting/Setting.js
const API = require("../../../script/API");

Page({

    /**
     * 页面的初始数据
     */
    data: {

        // 学期选择范围
        selectRange: [],
        weekRange: [],

        // 基础设置
        setting: {},

        // 学期设置
        userTerm: "正在获取",

        // 周设置
        userWeek: "正在获取",

        // 显示周数
        weekNumList: new Array(6).fill(0).map((v, i) => (i + 1) * 5),

        weekNum: "正在获取"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        // 获取当前课表设置
        let setting = API.getSetting();
        // console.log(setting);
        this.setData({setting: setting, weekNum: setting.weekNum});

        // 设置学期选择器
        this.renderRange();

        // 渲染数据
        let renderData = {
            userTerm: API.get("userSelectTerm"),
            userWeek: API.get("userSelectWeek"),
            userTermId: 0,
        };

        // 搜索学期列表
        renderData.userWeekId = renderData.userWeek == 'default' ? 0 : renderData.userWeek;
        renderData.weekNumId = (setting.weekNum / 5) - 1;
        let termList = API.getTermList();
        termList.List.map((v, i) => {
            if (renderData.userTerm == v) renderData.userTermId = i + 1;
        });

        // 获取当前学期设置
        this.setData(renderData);


        //获取图片
        this.setData({bgImg: wx.getStorageSync("bgImg")})

    },

    /**`
     * @function renderRange
     * @description 渲染picker范围
     */
    renderRange: function () {
        let termList = API.getTermList();
        // console.log(termList);

        // 渲染
        this.setData({
            selectRange: ["自动获取"].concat(termList.List),
            weekRange: ["自动获取"].concat(new Array(20).fill(0).map((v, i) => i + 1))
        });
        // console.log(selectRange);
    },

    /**
     * @function onTermChange
     * @description 学期切换事件
     * @param e 标准事件
     */
    onTermChange: function (e) {
        let id = e.detail.value / 1;
        // return console.log(id);

        // 用户选择自动获取
        let userTerm = "default";
        if (id != 0) {
            userTerm = this.data.selectRange[id];
        }

        // 传递数据
        API.set("userSelectTerm", userTerm);
        getApp().globalData.TermList.select = userTerm;
        this.setData({
            userTerm: userTerm
        });
    },

    /**
     * @function onWeekChange
     * @description 周切换事件
     * @param e 标准事件
     */
    onWeekChange: function (e) {
        let id = e.detail.value / 1;
        // return console.log(id);

        // 用户选择自动获取
        let userWeek = "default";
        if (id != 0) {
            userWeek = this.data.weekRange[id];
        }

        // 传递数据
        API.set("userSelectWeek", userWeek);
        getApp().globalData.TermList.week = userWeek;
        this.setData({
            userWeek: userWeek
        });
    },

    /**
     * @function onWeekNumChange
     * @description 用户修改显示周数
     * @param e 标准事件
     */
    onWeekNumChange: function (e) {
        this.data.setting.weekNum = e.detail.value * 5 + 5;

        this.setData({
            setting: this.data.setting,
            weekNum: this.data.setting.weekNum
        });
        API.set("Setting", this.data.setting);
        this.reCalcKCB();
    },

    /**
     * @function settingChange
     * @param e 标准事件事件
     * @description 设置改变 保存到本地 并重新演算
     */
    settingChange: function (e) {
        this.data.setting[e.currentTarget.dataset.id] = e.detail.value;
        this.setData({
            setting: this.data.setting
        });
        API.set("Setting", this.data.setting);
        this.reCalcKCB();
    },

    /**
     * @function reCalcKCB
     * @description 重新演算课程表数据
     */
    reCalcKCB: function () {
        let termList = API.getTermList().List;
        let successNum = 0;
        for (let i = 0; i < termList.length; i++) {
            API.calcKCB(termList[i], false, () => {
                successNum++;
                if (successNum >= termList.length) wx.showToast({
                    title: '课表解析成功!',
                });
            }, this.data.setting);
        }
    },

    /**
     * @function deleteAll
     * @description 删除全部数据
     */
    deleteAll: function () {
        wx.showModal({
            title: '删除全部数据',
            confirmText: '删除',
            cancelText: '手滑了',
            content: '删除全部数据将会全部学期课表数据，用户设置，自定义课表也会被删除！！\n你确定要删除吗？',
            success: (res) => {
            }
        });
    },


    selectKCBbg: function () {
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success(res) {
/*                wx.compressImage({
                    src: res.tempFilePaths[0], // 图片路径
                    quality: 100, // 压缩质量
                    success:r=>{
                        console.log(r["tempFilePath"])
                        wx.navigateTo({
                            url: './cutInside/cutInside?src=' + r["tempFilePath"]
                        })
                    }
                })*/
                //  获取裁剪图片资源后，给data添加src属性及其值
                wx.navigateTo({
                    url: './cutInside/cutInside?src=' + res.tempFilePaths[0]
                })
            }
        })
    },
    deleteKCBbg: function () {
        wx.getFileSystemManager().removeSavedFile({
            filePath: this.data.bgImg,
            success: r => {
                wx.removeStorageSync(`bgImg`)
                this.setData({
                    bgImg: null
                })
                wx.showToast({
                    title: '移除成功!',
                });
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

    }
})