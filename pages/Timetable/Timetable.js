// pages/Timetable/Timetable.js
const KCB = require("../../script/KCB");
const API = require("../../script/API");

const WEEK = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const TIME = [
    ["08:00", "08:45"], ["08:55", "09:40"], ["10:05", "10:50"], ["11:00", "11:45"],
    ["13:20", "14:05"], ["14:10", "14:55"], ["15:15", "16:00"], ["16:05", "16:50"],
    ["18:00", "18:45"], ["18:55", "19:40"], ["19:50", "20:40"], ["20:50", "21:40"]
];
const UNIT = 60;


Page({

    /**
     * 页面的初始数据
     */
    data: {
        canvas0Show: true,
        canvas1Show: true,
        canvas2Show: true,
        defBgColor:"rgba(222,222,222,0.7)",
        defontColor:"787878",
        //天气弹出层
        show: false,

        // 选取当前数据
        selection: {
            show: false, width: 0, height: 0, x: 0, y: 0, len: 0
        },

        // 展开周选择
        showWeekSelect: 1,

        // 展开学期先择
        showSemesterSelect: 1,

        // 展位展开
        showBlank: 1,

        // 蒙版
        maskShow: false,
        maskClass: "Hide",

        // 课程列表
        cListShow: false,
        cListClass: "Hide",
        cListData: [],

        // 课程细节
        cDetailShow: false,
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
            sData[show] = true;
            sData[clas] = "Show";
            this.setData(sData);
        }

        // 隐藏
        else if (mode === 0) {
            sData[clas] = "Hide";
            this.setData(sData);
            setTimeout(() => {
                sData[show] = false;
                this.setData(sData);
            }, 100)
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
                return {week: v, date: date[i], today: (i + 1) % 7 === now ? 1 : 0}
            })
        });
    },

    /**
     * @function initRuler
     * @description 初始化全局标尺 用来进行后续的坐标计算
     */
    initRuler: function () {
        let ww = this.ruler.ww = wx.getSystemInfoSync().windowWidth;

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
        this.setData({selection: this.data.selection});
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
    dragData: {week: 0, start: 0, end: 0, st: 0, se: 0, cl: 0, cbufer: []},

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

        // console.log(
        //   "周：" + (this.dragData.week + 1) +
        //   " 开始：" + (this.dragData.yt + 1) +
        //   " 结束：" + (this.dragData.ye + 1) +
        //   " 当前周：" + (this.data.week)
        // );

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
            showBlank: this.data.showBlank === 1 ? false : this.data.showBlank,
            showWeekSelect: this.data.showWeekSelect === 1 ? false : this.data.showWeekSelect,
            showSemesterSelect: this.data.showSemesterSelect === 1 ? false : this.data.showSemesterSelect
        };

        // 关闭已经选择的框框
        this.data.selection.show = false;
        this.setData({selection: this.data.selection});

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
        this.setData({week: id + 1});
        this.setDayList(this.data.weekNow, this.data.week);
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

        let date = new Date();
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
        // console.log(nowWeek, seleckWeek,M,pd);
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
        // 初始化静态数据
        this.initWeather()

        this.setData({time: TIME});
        this.initRuler();

        this.timeTable((d) => {
            this.setData(d);
            this.setDayList(this.data.weekNow, this.data.week);
            this.setData({
                scrollLeft: this.data.weekNow * 45
            })
        }, this.data.semester);

    },

    initWeather() {
        let weather = API.get(`weather`)
        //console.log(weather)
        let now = new Date()
        let icon = weather === ""?"":weather[1].conditionIdDay
        if (now.getHours() > 19 || now.getHours() < 5){
            icon = weather === ""?"":weather[1].conditionIdNight
        }
        this.setData({
            highest:  weather[15]?weather[15].max:"",
            lowest: weather[15]?weather[15].min:"",
            weather: weather.slice(0,15),
            weatherImg : icon,
            temperature: weather === ""?"":weather[1].tempDay + '°/' + weather[1].tempNight + '°'
        })
    },
    onClose() {
        this.setData({show: false});
    },
    showWeather() {
        this.setData({show: true});
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        const dpr = wx.getSystemInfoSync().pixelRatio
        if ( this.data.weather === "") return
        let p = []
        const query =  wx.createSelectorQuery()
        for (let k = 0; k < 15; k++) p.push(new Object({x: 0.0, y1: 0.0, y2: 0.0}));
        for (let v = 0; v < 3; v++) {
            query.select('#weatherCanvas' + v.toString())
                .fields({node: true, size: true})
                .exec((res) => {
                    if (res[0] === null) return
                    let canvas = res[0].node
                    let ctx = canvas.getContext('2d')
                    canvas.width = res[0].width * dpr
                    canvas.height = res[0].height * dpr
                    ctx.scale(dpr, dpr)
                    //console.log("宽度：", res[0].width)
                    //console.log("高度；", res[0].height)
                    //需要为字留40px

                    //console.log("天气", weather)
                    let unitY = (res[0].height - 90) / (this.data.highest - this.data.lowest) //单位高度 (改这里变斜率)
                    let unitX = res[0].width / 5
                    //console.log("单位：", unitY)

                    for (let i = v * 5; i < v * 5 + 6; i++) {
                        if (i === 15) {
                            break
                        }
                        let high = this.data.weather[i].tempDay
                        let low = this.data.weather[i].tempNight
                        p[i].y1 = 35 + unitY * (this.data.highest - high) //改这里变间距
                        p[i].y2 = res[0].height - 35 - unitY * (low - this.data.lowest)
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
                    wx.canvasToTempFilePath({
                        canvas: canvas,
                        canvasId: "weatherCanvas" + v.toString(),
                        success: res => {
                            //console.log(res.tempFilePath)
                            this.setData({['srcs[' + v + ']']: res.tempFilePath,['canvas'+v+'Show']:false})
                        },
                        fail: r => {
                            console.log(r)
                        }
                    })
                    //console.log(`画完一个`)
                })
        }

        if (wx.getSystemInfoSync().theme !== 'light') {
            this.setData({
                defontColor:"aaaaaa",
                defBgColor:"rgba(66,66,66,0.8)",
                weatherPopStyle: "filter: invert(1) hue-rotate(.5turn);"
            })
        }
    },


    /**
     *  获取用户图片
     */
    initBgImg() {
        this.setData({bgImg: wx.getStorageSync("bgImg"), bgImgHeight: wx.getStorageSync(`bgImgHeight`)})
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.onPullDownRefresh();
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
    onPullDownRefresh: function () {
        this.timeTable((d) => {
            this.setData(d);
            this.setDayList(this.data.weekNow, this.data.week);
        }, this.data.semester);
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