const {get} = require("../../../script/API");
// pages/Account_Subpages/Storage/Storage.js
const API = require("../../../script/API");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        list: [],
        selectRange: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        // 获取学期列表
        let TermList = API.getTermList();

        let then = (d, v) => {
            list.push({
                m: v,
                t: API.parseTime(new Date(d.time)),
                d: Math.floor(d.size * 100 / 1024) / 100,
                n: d.classNum,
                k: d.typeNum
            });

            // 全部获取到之后渲染数据
            if (TermList.List.length == list.length) {
                this.setData({
                    list: list
                });
            }

            wx.stopPullDownRefresh({
                success: (res) => {
                },
            });
        };

        // 获取每一学期数据
        let list = [];
        let app = getApp();
        TermList.List.map((v, i) => {

            // 尝试获取学期课表
            let now = API.getTimeTable((d) => {
                then(d, v);
            }, v);

            // 获取用户信息
            if (now === "none") API.getUserData((u) => {

                // 获取课表
                API.getTimeTable((d) => {
                    then(d, v);
                }, v, u.session);

            });
        });
    },

    /**
     * @function renderRange
     * @description 渲染picker范围
     */
    renderRange: function () {
        let objArr = API.geneSemesterArr()[0]
        let arr = []
        for (let i = 1; i < objArr.length; i++) {
            arr.push(objArr[i].name)
        }
        // 渲染
        this.setData({
            selectRange: arr
        });
        // console.log(selectRange);
    },

    /**
     * @function catch
     * @description 抓取课表
     * @param v 学期
     * @returns void
     */
    catch: function (v) {
        // 获取用户信息
        API.getUserData((d) => {

            // 获取课表
            API.request(
                API.GET_TIME_TABLE,
                {
                    loading: "正在抓取",
                    successMsg: "抓取成功",
                    failMsg: "api",
                    ok: (d) => {
                        // console.log(d);
                        this.onLoad();
                    }
                }, {
                    semester: v.slice(0, 11),
                    age: v.slice(11, v.length)
                },
                "session=" + d.session
            );
        });
    },

    /**
     * @function onValueChange
     * @description picker值改变
     * @param e
     */
    onValueChange: function (e) {
        let id = e.detail.value;
        this.catch(
            this.data.selectRange[id]
        );
    },

    /**
     * @function catchTerm
     * @description 抓取学期
     * @param e
     */
    catchTerm: function (e) {
        let id = e.currentTarget.dataset.id;
        // console.log("课表抓取：" + id);
        this.catch(id);
    },

    /**
     * @function deleTerm
     * @description 删除学期
     * @param e
     */
    deleTerm: function (e) {
        let id = e.currentTarget.dataset.id;

        wx.showModal({
            title: '删除学期',
            confirmText: '删除',
            cancelText: '手滑了',
            content: '学期数据删除后会释放对应缓存空间，同时，自定义课表也会被删除！！\n你确定要删除吗？',
            success: (res) => {
                if (!res.confirm) return;

                let app = getApp();
                app.globalData.TermData[id] = undefined;
                wx.removeStorageSync(id);

                let tlist = API.getTermList().List.filter((v) => {
                    if (v == id) return false;
                    else return true;
                });

                app.globalData.TermList.List = tlist;
                API.set("TermList", tlist);

                wx.showToast({
                    title: '删除成功',
                })

                this.onLoad();
            }
        });


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        this.renderRange();
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
        this.onLoad();
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