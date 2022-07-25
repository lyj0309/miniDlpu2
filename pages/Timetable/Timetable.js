// pages/Timetable/Timetable.js
import Notify from "../../miniprogram_npm/@vant/weapp/notify/notify";

const KCB = require("../../script/KCB");
const API = require("../../script/API");

const WEEK = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const TIME = [
    ["08:00", "08:45"], ["08:55", "09:40"], ["10:05", "10:50"], ["11:00", "11:45"],
    ["13:20", "14:05"], ["14:10", "14:55"], ["15:15", "16:00"], ["16:05", "16:50"],
    ["18:00", "18:45"], ["18:55", "19:40"], ["19:50", "20:40"], ["20:50", "21:40"]
];


Page({

    /**
     * 页面的初始数据
     */
    data: {
        canvasShow: false,
        defBgColor: "rgba(222,222,222,0.55)",
        defontColor: "707070",
        //天气弹出层
        show: false,

        // 选取当前数据
        selection: {
            show: false, width: 0, height: 0, x: 0, y: 0, len: 0
        },

        // 展开周选择
        showWeekSelect: false,

        // 展开学期先择
        showSemesterSelect: false,

        // 展位展开
        showBlank: false,

        // 蒙版
        maskClass: "Hide",

        // 课程列表
        cListClass: "Hide",
        cListData: [],

        // 课程细节
        cDetailClass: "Hide",
        cDetailData: [],
        cDetailTime: {}
    },
    // 标尺数据 不要修改 使用initRuler()生成
    ruler: {},

    /**
     * @function clist
     */
    clist: function (mode) {

    },

    /**
     * @static POOP_LIST
     * @description 弹窗对象
     */
    POOP_LIST: [
        "mask",
        "cList",
        "cDetail"
    ],

    /**
     * @function poop
     * @description 控制页面弹窗显示与隐藏
     * @param who 要弹窗的对象 id
     * @param mode 模式 1：显示 0：关闭 auto：自动
     */
    poop: function (who, mode) {

        let show = this.POOP_LIST[who] + "Show";
        let clas = this.POOP_LIST[who] + "Class";

        // 自动模式
        if (mode === "auto") mode = this.data[show] ? 0 : 1;

        // 显示
        let sData = {};
        if (mode === 1) {
            sData[clas] = "Show";
            this.setData(sData);
        }

        // 隐藏
        else if (mode === 0) {
            sData[clas] = "Hide";
            this.setData(sData);
        }
    },

    /**
     * @function clickMask
     * @description 用户点击蒙版
     */
    clickMask: function (e) {

        // 隐藏全部弹窗 和蒙版
        for (let i = 0; i < this.POOP_LIST.length; i++) {
            this.poop(i, 0);
        }
    },

    /**
     * @function clickCList
     * @description 点击课程列表
     * @param e 标准事件参数
     * @returns void
     */
    clickCList: function (e) {
        let id = e.currentTarget.dataset.id;
        this.setData({
            cDetailData: this.data.cListData[id]
        });
        this.poop(1, 0);
        this.poop(2, 1);
    },

    /**
     * @function setWeek
     * @description 设置UI中的日期标题
     * @param date(Array(7)) 日期数组
     */
    setWeek: function (date = new Array(7).fill("00.00")) {
        let now = new Date().getDay();
        this.setData({
            date: WEEK.map((v, i) => {
                return { week: v, date: date[i], today: (i + 1) % 7 === now ? 1 : 0 }
            })
        });
    },

    /**
     * @function initRuler
     * @description 初始化全局标尺 用来进行后续的坐标计算
     */
    initRuler: function () {
        let ww = this.ruler.ww = this.sysinfo.windowWidth;

        let blank = this.data.showBlank === 1 ? false : this.data.showBlank;

        // 底板数据
        this.ruler.bt = (83.2 + (blank ? 80 : 0) / 1);
        // console.log(this.ruler.bt);
        this.ruler.bl = ww * .1;
        this.ruler.bw = ww - ww * .1;
        this.ruler.bh = 60. * 12.;
        // 单元数据
        this.ruler.uw = (ww - ww * .1) / 7.;
        this.ruler.uh = 60.;
    },

    /**
     * @function showClassDetail
     * @description 点击课程触发 显示课程详情
     * @param e 事件
     */
    showClassDetail: function (e) {
        console.log("课程");
    },

    /**
     * @function calcPos
     * @description 计算点击区域坐标
     * @param x(float) 点击点X坐标
     * @param y(float) 点击点Y坐标
     * @returns pos(Array) [周, 时间]
     */
    calcPos: function (x, y) {
        return [
            parseInt((x - this.ruler.bl) / this.ruler.uw),
            parseInt((y - this.ruler.bt) / this.ruler.uh)
        ];
    },

    /**
     * @function renderSelect
     * @description 渲染选择框
     */
    renderSelect: function (week, start, end) {

        // 计算添加课程区域的坐标和长宽
        this.data.selection.width = this.ruler.uw - 4;
        this.data.selection.height = this.ruler.uh * (end + 1 - start) - 3.5;
        this.data.selection.x = this.ruler.bl + week * this.ruler.uw;
        this.data.selection.y = this.ruler.bt + start * this.ruler.uh + 3.5;

        // 更新轴向数据
        this.setData({ selection: this.data.selection });
    },

    /**
     * @function catchtap
     * @description 这个函数不做任何事情
     * 仅仅为了捕获事件传递
     */
    catchtap: function () {
    },

    /**
     * @function selectClassStart
     * @description 点击底板触发 开始选择添加课程区域
     * @param e 事件
     */
    selectClassStart: function (e) {

        // 如果课表还没加载 禁用点击
        if (!this.data.kcb) return;

        // 计算点击坐标
        const clickPos = this.calcPos(e.detail.x, e.detail.y);

        // 判断是否有课
        let clist = KCB.searchClass(
            this.data.kcb, this.data.class, this.data.user, this.data.week - 1,
            clickPos[0], clickPos[1], API.getSetting(), true
        );
        if (clist.length) {

            // 如果非本周渲染被禁用
            // if(!){
            //   if(!clist[0].o) return;
            // }
            // 如果只有一个 直接显示细节
            if (clist.length === 1) {
                this.setData({
                    cDetailData: clist[0]
                });
                this.poop(0, 1);
                this.poop(2, 1);
            }

            // 如果有多条 显示课程列表
            else {
                this.setData({
                    cListData: clist
                });
                this.poop(0, 1);
                this.poop(1, 1);
            }

            // 阻止框选
            return;
        }

        this.dragData.start = (this.dragData.end = clickPos[1]);
        this.dragData.week = clickPos[0];
        this.dragData.cl = 0;

        // 初始化当前点
        this.dragData.st = this.dragData.start;
        this.dragData.se = this.dragData.start;
        this.dragData.yt = this.dragData.start;
        this.dragData.ye = this.dragData.start;

        this.data.selection.show = !this.data.selection.show;
        this.data.selection.len = 1;

        // 清空课程搜索缓存
        this.dragData.cbufer = new Array(25).fill(0);

        this.renderSelect(clickPos[0], clickPos[1], clickPos[1]);
    },

    // 记录拖拽事件
    dragData: { week: 0, start: 0, end: 0, st: 0, se: 0, cl: 0, cbufer: [] },

    /**
     * @function dragMove
     * @description 拖拽点击结束事件
     * @param e 事件
     */
    dragMove: function (e) {
        let clickPos = this.calcPos(
            e.changedTouches[0].pageX,
            e.changedTouches[0].pageY
        );

        // 记录变动 减少页面重绘
        let cl = this.dragData.start - clickPos[1];
        if (this.dragData.cl !== cl) {
            this.dragData.cl = cl;
            this.dragData.st = cl < 0 ? this.dragData.start : this.dragData.start - cl;
            this.dragData.se = cl < 0 ? this.dragData.start - cl : this.dragData.start;

            // 拦截超出底板范围的框选
            if (this.dragData.st > 11 || this.dragData.st < 0) return;
            if (this.dragData.se > 11 || this.dragData.se < 0) return;

            // 如果课表还没有加载 禁用拖拽
            if (!this.data.kcb) return;

            // 搜索课程表数据
            let ind = 12 + cl;

            // 这里设置了忽略细节 节省性能
            if (!this.dragData.cbufer[ind]) this.dragData.cbufer[ind] =
                KCB.searchClass(
                    this.data.kcb, this.data.class, this.data.user,
                    this.data.week - 1, this.dragData.week, clickPos[1],
                    API.getSetting(), false
                ).length
                    ? 2 : 1;

            // 判断路径上的所有位置是否有课程
            let pluser = cl / Math.abs(cl);
            for (let i = 0; i != cl; i += pluser) {

                // 死循环保护
                if (i > 25 || i < -25) break;
                if (this.dragData.cbufer[12 + i + pluser] == 2) return;
            }

            this.renderSelect(this.dragData.week, this.dragData.st, this.dragData.se);
            this.dragData.yt = this.dragData.st;
            this.dragData.ye = this.dragData.se;
        }
    },

    /**
     * @function editClass
     * @description 编辑自定课程
     * @param e 自定事件
     */
    editClass: function (e) {
        let id = e.currentTarget.dataset.id;

        // 跳转到课表编辑界面
        wx.navigateTo({
            url: '/pages/Subpages/EditClass/EditClass?' +
                'id=' + id +
                '&semester=' + this.data.semester
        })
    },

    /**
     * @function dragEnd
     * @description 拖拽点击结束事件
     * @param e 事件
     */
    dragEnd: function (e) {

        // 清除当前选取
        this.data.selection.show = false;
        this.setData({
            selection: this.data.selection
        });


        // 跳转到课表编辑界面
        wx.navigateTo({
            url: '/pages/Subpages/EditClass/EditClass?' +
                'semester=' + this.data.semester +
                '&week=' + (this.data.week - 1) +
                '&day=' + this.dragData.week +
                '&start=' + this.dragData.yt +
                '&end=' + this.dragData.ye
        })
    },

    /**
     * @function headerSelecter
     * @description 控制头部选择区域动画
     * @param e 事件
     */
    headerSelecter: function (e) {

        let mode = e.currentTarget.dataset.doing;
        let omode = e.currentTarget.dataset.odoing;
        let d = {
            showBlank: this.data.showBlank,
            showWeekSelect: this.data.showWeekSelect,
            showSemesterSelect: this.data.showSemesterSelect
        };

        // 关闭已经选择的框框
        if (this.data.selection.show) {
            this.data.selection.show = false;
            this.setData({ selection: this.data.selection });
        }

        // 开启
        if (!d.showBlank && !d.showSemesterSelect && !d.showWeekSelect) {
            d[mode] = true;
            d[omode] = this.data[omode] === 1 ? 1 : false;
            d.showBlank = true;
            this.setData(d);
            return this.initRuler();
        }

        // 关闭
        if (d.showBlank && d[mode] && !d[omode]) {
            d[mode] = this.data[mode] === 1 ? 1 : false;
            d[omode] = this.data[omode] === 1 ? 1 : false;
            d.showBlank = this.data.showBlank === 1 ? 1 : false;
            this.setData(d);
            return this.initRuler();
        }

        // 交替
        if (d.showBlank && !d[mode] && d[omode]) {
            d[mode] = true;
            d[omode] = this.data[omode] === 1 ? 1 : false;
            d.showBlank = true;
            this.setData(d);
            return this.initRuler();
        }

    },

    /**
     * @function changeWeek
     * @description 用户切换周的事件
     * @param e 事件
     */
    changeWeek: function (e) {
        let id = e.currentTarget.dataset.id;
        this.setData({ week: id + 1 });
        this.setDayList(this.data.weekNow, this.data.week);
        const f = this.data.week
        for (let i = 0; i < this.data.class[f - 1].length; i++) {
            for (let j = 0; j < this.data.class[f - 1][i].length; j++) {
                if (!this.data.bgImg) {
                    this.data.class[f - 1][i][j].c = this.data.class[f - 1][i][j].c.substr(0, 17) + "0.95)"
                } else {
                    this.data.class[f - 1][i][j].c = this.data.class[f - 1][i][j].c.substr(0, 17) + "0.7)"
                }
            }
        }
        this.setData({
            class: this.data.class
        })

    },

    /**
     * @function changeSemester
     * @description 用户切换学期的事件
     * @param e 事件
     */
    changeSemester: function (e) {
        let id = e.currentTarget.dataset.id;

        this.timeTable((d) => {
            this.setData(d);
            this.setDayList(this.data.weekNow, this.data.week);
        }, id);
    },

    /**
     * @function setDayList
     * @description 设置日期列表
     */
    setDayList: function (nowWeek, seleckWeek) {
        if (nowWeek <= 0 && seleckWeek > 0) nowWeek++
        let date = new Date();
        if (seleckWeek < 0) {
            let cday = date.getDay() === 0 ? 0 : 7 - date.getDay()
            this.setData({ countdownTime: ((Math.abs(nowWeek) - 1) * 7 * 24 * 60 + ((24 - date.getHours()) * 60) + (60 - date.getMinutes()) + cday * 24 * 60) * 60 * 1000 })
        }
        let oneDay = 1000 * 60 * 60 * 24 * 1;
        let pd = new Date(date.getTime() + (seleckWeek / 1 - nowWeek / 1) * oneDay * 7);
        let f = false;
        let ii = 0;
        let M = [];
        // console.log(pd);

        let test = (d) => {
            for (let i = 0; i < 7; i++) if (!d[i]) return false;
            return true;
        };

        while (1) {
            ii++;
            let day = pd.getDay();

            M[day == 0 ? 6 : day - 1] = (pd.getMonth() + 1) + "." + pd.getDate();

            // 遍历到周日
            if (day == 0) {
                pd = new Date(date.getTime() + (seleckWeek / 1 - nowWeek / 1) * oneDay * 7);
                f = true;
            }

            pd = f ? new Date(pd.getTime() - oneDay) : new Date(pd.getTime() + oneDay);

            if (test(M) || ii > 64) break;
        }
        //  console.log(nowWeek, seleckWeek, M, pd);
        this.setWeek(M);
    },

    /**
     * @function timeTable
     * @description 获取 课程表
     */
    timeTable: function (then, semester) {

        // 获取学期列表
        let TermList = API.getTermList();
        // 获取静态数据
        API.getStaticData((s) => {
            // 获取当前应该显示的学期
            let whichKCB = {
                semester: TermList.select == "default" ? s.semester : TermList.select,
                week: TermList.week == "default" ? s.weekNow : TermList.week
            };

            let timeTableCallBack = (d) => {
                wx.stopPullDownRefresh();
                console.log("课程表", d)
                const f = this.data.week ? this.data.week : whichKCB.week
                if (f > 0) {
                    for (let i = 0; i < d.pre[f - 1].length; i++) {
                        for (let j = 0; j < d.pre[f - 1][i].length; j++) {
                            if (!this.data.bgImg) {
                                d.pre[f - 1][i][j].c = d.pre[f - 1][i][j].c.substr(0, 17) + "0.95)"
                            } else {
                                d.pre[f - 1][i][j].c = d.pre[f - 1][i][j].c.substr(0, 17) + "0.7)"
                            }
                        }
                    }
                }
                return then({
                    class: d.pre,
                    weekImg: d.img,
                    kcb: d.kcb,
                    user: d.user,
                    week: this.data.week ? this.data.week : whichKCB.week,
                    weekNow: whichKCB.week,
                    semesterList: TermList.List,
                    semester: semester ? semester : whichKCB.semester,
                    semesterNow: whichKCB.semester
                });
            }

            // 先尝试获取课表数据
            let now = API.getTimeTable((d) => {
                timeTableCallBack(d);
            }, semester ? semester : whichKCB.semester);

            // 没获取到 尝试从服务器请求
            if (now === "none") API.getUserData((d) => {

                // 获取课表
                API.getTimeTable((d) => {
                    timeTableCallBack(d);
                }, semester ? semester : whichKCB.semester, d.session);


            });
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //
        const tKey = "GetTimeTableTime"
        const t = wx.getStorageSync(tKey)
        // console.log("过期时间",t, Date.now())
        if (typeof t !== "object" || t.getTime() < Date.now()) {
            API.getStaticData(r => {
                API.reCatchTable(r.semester, true).then(r => {
                    this.onLoad()
                })
            })
            const expTime = new Date()
            expTime.setDate(expTime.getDate() + 7)
            wx.setStorageSync(tKey, expTime)
        }


        this.initBgImg()
        let remind = wx.getStorageSync("remind")
        if (remind === "") {
            remind = {};
        }

        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
        this.sysinfo = wx.getSystemInfoSync()

        // 初始化静态数据
        this.initWeather()


        this.setData({ time: TIME, remind: remind });
        this.initRuler();

        this.timeTable((d) => {
            // console.log(d)
            this.setData(d);
            this.setDayList(this.data.weekNow, this.data.week);
            this.setData({
                scrollLeft: (this.data.weekNow - 1) * 45
            })
        }, this.data.semester);

        this.setData(options)

    },

    backPresent() {
        this.setData({ week: this.data.weekNow });
        this.setDayList(this.data.weekNow, this.data.week);

    },

    initWeather() {
        let weather = API.get(`weather`)
        //console.log(weather)
        let now = new Date()
        let icon = weather === "" ? "" : weather[1].conditionIdDay
        if (now.getHours() > 19 || now.getHours() < 5) {
            icon = weather === "" ? "" : weather[1].conditionIdNight
        }
        this.setData({
            highest: weather[15] ? weather[15].max : "",
            lowest: weather[15] ? weather[15].min : "",
            weather: weather.slice(0, 15),
            weatherImg: icon,
            temperature: weather === "" ? "" : weather[1].tempDay + '°/' + weather[1].tempNight + '°'
        })
    },
    onClose() {
        this.setData({ show: false });
    },
    showWeather() {
        if (this.data.srcs === undefined) this.drawWeatherImg()
        this.setData({ show: true });
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        if (this.sysinfo.theme !== 'light') {
            this.setData({
                defontColor: "aaaaaa",
                defBgColor: "rgba(66,66,66,0.6)",
                weatherPopStyle: "filter: invert(1) hue-rotate(.5turn);"
            })
        }
    },


    /**
     *  获取用户图片
     */
    initBgImg() {
        this.setData({ bgImg: wx.getStorageSync("bgImg"), bgImgHeight: wx.getStorageSync(`bgImgHeight`) })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        wx.checkSession({
            fail() {
                wx.login(
                    {
                        success: res => {
                            API.getUserData(d => {
                                wx.request({
                                    url: 'https://jwc.nogg.cn/wx_login?id=' + d.user + '&code=' + res.code
                                })
                            })
                        }
                    }
                )
            }
        })

        if (this.data.onshow) this.onPullDownRefresh(true);
        this.setData({ onshow: true })
        this.clickMask();
        this.initBgImg()
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
    onPullDownRefresh: function (e) {
        console.log(e)
        if (e === undefined) {
            API.getStaticData(r => {
                API.reCatchTable(r.semester, true).then(r => {
                    this.onLoad()
                })
            })
        } else {
            this.timeTable((d) => {
                this.setData(d);
                this.setDayList(this.data.weekNow, this.data.week);
            }, this.data.semester);
        }

    },
    /**
     * 上课提醒
     * */
    onRemindChange({ detail }) {
        wx.showLoading({ title: "加载中···", mask: true })

        // 第几周+星期几+第几节(开始到结束) this.data.week + this.data.cDetailData.w + this.data.cDetailData.s + this.data.cDetailData.e
        if (detail.value === true) {
            if (wx.getStorageSync("official")) {
                this.sendRemind(detail.value)
                return
            }
            wx.requestSubscribeMessage({
                tmplIds: ['5R2_Fuz8T01yJJLhPBKGzFjq77UaVpwP154sLXsVu-4'],
                success: res => {
                    if (res["5R2_Fuz8T01yJJLhPBKGzFjq77UaVpwP154sLXsVu-4"] === "reject") {
                        this.setData({
                            ['remind.' + this.data.week + this.data.cDetailData.w + this.data.cDetailData.s + this.data.cDetailData.e]: !detail.value
                        })
                        return
                    }
                    this.sendRemind(detail.value)
                }
            })
        } else {
            this.sendRemind(detail.value)
        }
    },
    sendRemind(value) {
        API.getUserData(d => {
            let k = API.ADD_TIME_TABLE_REMIND
            if (value === false) k = API.DELETE_TIME_TABLE_REMIND
            API.request(k,
                {
                    ok: r => {
                        console.log(`订阅成功`, r)
                        this.setData({
                            ['remind.' + this.data.week + this.data.cDetailData.w + this.data.cDetailData.s + this.data.cDetailData.e]: value
                        })
                        wx.setStorageSync("remind", this.data.remind)
                        wx.hideLoading()
                    }
                }, {
                week: this.data.week.toString(),
                day: this.data.cDetailData.w.toString(),
                start: (this.data.cDetailData.s + 1).toString(),
                end: (this.data.cDetailData.e + 1).toString(),
                name: this.data.cDetailData.n,
                teacher: this.data.cDetailData.t,
                class: this.data.cDetailData.l,
            },
                "session=" + d.session
            )
        })
    },
    drawWeatherImg() {

        if (this.data.weather === "") return
        this.setData({
            canvasShow: true
        })
        let p = []
        for (let k = 0; k < 15; k++) p.push(new Object({ x: 0.0, y1: 0.0, y2: 0.0 }));

        for (let index = 0; index < 3; index++) {
            this.drawNew(index, p)
        }
        this.setData({
            canvasShow: false
        })
        //console.log(this.data.srcs)

    },
    drawNew(v, p) {
        //console.log(this.sysinfo)
        const width = this.sysinfo.screenWidth, height = this.sysinfo.screenWidth * 400 / 750
        //console.log(width, height)
        // 创建离屏 2D canvas 实例
        const canvas = wx.createOffscreenCanvas({ type: '2d', width: width, height: height })
        // 获取 context。注意这里必须要与创建时的 type 一致
        const ctx = canvas.getContext('2d')

        //console.log("天气", weather)
        let unitY = (height - 90) / (this.data.highest - this.data.lowest) //单位高度 (改这里变斜率)
        let unitX = width / 5
        //console.log("单位：", unitY)

        for (let i = v * 5; i < v * 5 + 6; i++) {
            if (i === 15) {
                break
            }
            let high = this.data.weather[i].tempDay
            let low = this.data.weather[i].tempNight
            p[i].y1 = 35 + unitY * (this.data.highest - high) //改这里变间距
            p[i].y2 = height - 35 - unitY * (low - this.data.lowest)
            p[i].x = Math.round((unitX * ((2 * (i - 5 * v) + 1)) / 2))

            let draw = function (y, yl, k) {
                if ((i === 5 && v === 1) || (i === 10 && v === 2)) {
                    ctx.lineWidth = 2
                    ctx.strokeStyle = "#D2D2D2";
                    ctx.beginPath();
                    //计算三角函数
                    let long = Math.sqrt(unitX * unitX + (y - yl) * (y - yl))  //计算长边
                    //console.log((Math.round((unitX * -1 / 2))) + 5.1 * (unitX / long), yl + 5.1 * ((y - yl) / long))
                    ctx.moveTo((Math.round((unitX * -1 / 2))) + 5.1 * (unitX / long), yl + 5.1 * ((y - yl) / long));
                    ctx.lineTo(p[i].x - +5.1 * (unitX / long), y - +5.1 * ((y - yl) / long));
                    ctx.stroke();
                } else if (i >= 1) { //画线
                    ctx.lineWidth = 2
                    ctx.strokeStyle = "#D2D2D2";
                    ctx.beginPath();
                    //计算三角函数
                    let long = Math.sqrt(unitX * unitX + (y - yl) * (y - yl))  //计算长边
                    ctx.moveTo(p[i - 1].x + 5.1 * (unitX / long), yl + 5.1 * ((y - yl) / long));
                    ctx.lineTo(p[i].x - +5.1 * (unitX / long), y - +5.1 * ((y - yl) / long));
                    ctx.stroke();
                }
                //画圆
                ctx.lineWidth = 1
                ctx.strokeStyle = "#B5B5B5";
                ctx.beginPath();
                ctx.arc(p[i].x, y, 4, 0, 2 * Math.PI);
                ctx.arc(p[i].x, y, 3, 0, 2 * Math.PI);
                ctx.stroke();

                //写字
                ctx.font = "18px Arial";
                ctx.fillText((k === 0 ? high : low) + '°', p[i].x - 9, k === 0 ? y - 10 : y + 25);
            }
            draw(p[i].y1, p[i - 1] ? p[i - 1].y1 : 0, 0)
            draw(p[i].y2, p[i - 1] ? p[i - 1].y2 : 0, 1)
        }
        //console.log("Test")
        const b64 = ctx.canvas.toDataURL('image/png')
        //console.log(b64)
        this.setData({
            ['srcs[' + v + ']']: b64,
        })
    },
    select(str) {
        return new Promise(
            (resolve) => {
                const query = wx.createSelectorQuery()
                query.select(str).boundingClientRect(rect => {
                    resolve(rect)
                }).exec()
            }
        )
    },
    openModel(e) {
        getApp().openModel(e.currentTarget.dataset.text)
    },
    //添加自定义课程按钮
    addCourse() {
        // 跳转到课表编辑界面
        wx.navigateTo({
            url: '/pages/Subpages/EditClass/EditClass?' +
                'semester=' + this.data.semester +
                '&week=' + (this.data.week - 1) +
                '&day=' + this.data.cDetailData.w +
                '&start=' + this.data.cDetailData.s +
                '&end=' + this.data.cDetailData.e
        })
    }


})