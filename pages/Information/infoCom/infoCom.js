const API = require("../../../script/API");
import Notify from '../../../miniprogram_npm/@vant/weapp/notify/notify';
import API1 from "../../../script/API/API" ;
import User from "../../../script/API/User";
import WaterCard from "../../../script/API/WaterCard";

Component({
    styleIsolation: 'shared', //解除组件样式隔离
    properties: { //传过来的值
        title: {
            type: String,
            value: '',
        },
        data: {
            type: Object,
            value: {},
        }
    },
    data: {
        CETSelectShow: true,
        CETSelectActions: [{name: "四级", id: 1}, {name: "六级", id: 2}],
        replay: "paused",
        actions: [],
        show: false,
        semester: '',
    },
    methods: {
        onCETSelect(e) {
            this.setData({
                CETSelectShow: false
            })
            wx.showLoading({title: "加载中"})
            this.cetMark(e.detail.id)
        },
        openPyfaDetail(e) { //打开培养方案弹窗
            this.page.setData({
                minShow: true,
                showData: e.currentTarget.dataset.item
            })
            //console.log(e.currentTarget.dataset.item)
        },
        openEmpDetail(e) {

            // console.log(e.currentTarget.dataset.item)
            this.page.setData({
                minShow: true,
                showData: e.currentTarget.dataset.item,
                epClaTimeList: this.data.epClaTimeList
            })
        },
        onActionSelect(event) { //查成绩选择学期
            wx.showLoading({title: "加载中"})
            this.setData({semester: event.detail.name, activeName: ""})
            API.set(`lastSemester`, event.detail.name)
            this.getScore(event.detail.name)
            //console.log(event.detail)
        },
        onScoreChange(event) {
            this.setData({
                activeName: event.detail,
            })
        },

        searchEmpCla() {
            wx.showLoading({title: '查询中'})
            let day, dayStr = "一二三四五六日", time = ''
            for (let i = 0; i < 7; i++) { //处理周
                if ('周' + dayStr[i] === this.data.epDay) {
                    day = i + 1
                    break
                }
            }
            console.log(this.data.epTime)
            for (let i = 0; i < 6; i++) { //处理时间段
                if (this.data.epTime[i] === 1) {
                    time += (i + 1).toString()
                }
            }
            let week = this.data.epWeek.substr(1).match(/\d*/)[0]
            console.log(week)
            API.request(
                API.GET_EMPTY_CLASS,
                {
                    ok: (d) => {
                        let cla = []
                        for (let i = 0; i < 8; i++) {
                            cla.push([])
                        }
                        //console.log(d.data)
                        // 1、整理时间数组
                        // 2、整理几楼（每一楼一个数组）
                        for (let i = 0; i < d.length; i++) {
                            let time = [0, 0, 0, 0, 0, 0]
                            let floor
                            for (let f = 0; f < d[i].Time.length; f++) {
                                time[d[i].Time[f] - 1] = 1
                            }
                            if (this.data.epHouse === '综合楼') {
                                floor = d[i].Room.slice(2, 3) //获取在几楼
                            } else {
                                floor = d[i].Room.slice(1, 2) //获取在几楼
                            }

                            //console.log(floor)
                            if (!isNaN(floor)) {
                                cla[floor - 1].push({Room: d[i].Room, Time: time})
                            } else {
                                cla[7].push({Room: d[i].Room, Time: time})
                            }
                            //console.log(d[i].Room,d[i].Room.slice(2,3))
                        }
                        this.setData({empClaArr: cla})
                        // console.log(cla)
                        wx.hideLoading()
                        Notify({background: '#77C182', message: '查询成功', context: this,})
                    }
                }, {
                    time: time,//第几节
                    week: week,//第几周
                    house: this.data.epHouse,//哪一栋
                    day: day,//周几
                },
                "session=" + this.session
            )
        },
        getScoreDetail(e) {
            if (this.data.scoreData[e.detail].Final !== undefined) { //防止多次请求
                return
            }
            API.request(API.GET_EXAM_SCORE, {
                    ok: (d) => {
                        if (d === null || d.Total === "？？？？？？") {
                            this.setData({['scoreData[' + e.detail + '].Final']: "x"})
                            this.setData({['opc0[' + e.detail + ']']: 1, ['opc1[' + e.detail + ']']: 0})
                            return
                        }
                        this.setData({
                            ['scoreData[' + e.detail + ']']:
                                Object.assign(this.data.scoreData[e.detail], d),
                        })
                        this.setData({['opc0[' + e.detail + ']']: 1, ['opc1[' + e.detail + ']']: 0})
                    }
                }, {
                    data: encodeURI(this.data.scoreData[e.detail].Detail)
                },
                "session=" + this.session
            )
        },
        showAction() {
            this.setData({show: true})
        },

        onClose() {
            this.setData({show: false})
        },
        onChange(event) {
            this.setData({activeName: event.detail,})
        },
        showEmpCla(e) {
            //console.log(e.currentTarget.dataset.idx)


            if (e.currentTarget.dataset.idx === '0') {
                this.page.setData({
                    empClaShow0: true
                })
            } else {
                this.page.setData({
                    empClaShow1: true
                })
            }
        },
        showPyfaSelect() {
            wx.showLoading({title: "加载中"})
            this.page.showPyfaSelect()
        },
        getScore(semester) {//获取成绩
            if (semester === undefined || semester === '全部学期') {
                semester = ''
            } else {
                semester = semester.slice(0, 11)
            }
            let that = this
            API.request(
                API.GET_EXAM_SCORE,
                {
                    ok: (d) => {
                        Notify({
                            background: '#77C182',
                            message: '获取成功',
                            context: this,
                        })
                        that.setData({
                            replay: "paused",
                            scoreData: d.Scores,
                            GPA: d.GPA.slice(0, 2) === '0 ' ? "暂无" : d.GPA, //大一无绩点
                            opc0: new Array(d.Scores === null ? 0 : d.Scores).fill(0),
                            opc1: new Array(d.Scores === null ? 0 : d.Scores).fill(1)
                        })
                        wx.hideLoading()
                    }
                }, {
                    data: semester
                },
                "session=" + this.session
            )
        },
        // 考试日程
        getExamDate() {
            let examAlarm = wx.getStorageSync(`examAlarm`)
            if (examAlarm === null || examAlarm === "" || examAlarm === 0 || examAlarm === undefined) {
                this.setData({examAlarm: true})
                wx.setStorageSync(`examAlarm`, true)
            } else if (examAlarm === true) {
                this.setData({examAlarm: examAlarm})
                this.reqAlarm(1)
                if (!wx.getStorageSync("official")) {
                    wx.requestSubscribeMessage({
                        tmplIds: ['ev2cvXp8X8sMDzLB-BJnwVszlS6Zm7pMQHxcTd1D8wA'],
                    })
                }
            } else {
                this.setData({examAlarm: examAlarm})
                this.reqAlarm(0)
            }
            // console.log(this.session)
        },
        switchExamAlarm() { //考试提醒那个开关
            if (this.data.examAlarm === true) {
                this.reqAlarm(0)
                wx.setStorageSync(`examAlarm`, false)
                this.setData({examAlarm: false})
                return
            }
            this.setData({examAlarm: true})
            wx.setStorageSync(`examAlarm`, true)
        },
        reqAlarm(alarm) {
            API.request(
                API.GET_EXAM_DATE,
                {
                    ok: (d) => {
                        console.log('成功', d)
                        wx.hideLoading()
                        Notify({
                            background: '#77C182',
                            message: '获取成功',
                            context: this,
                        })
                        if (d === null) {
                            return
                        }
                        for (let dElement of d) {
                            console.log(dElement.Time.substring(0, dElement.Time.indexOf(`~`)).replace(' ', 'T'))
                            dElement.cdtime = new Date(dElement.Time.substring(0, dElement.Time.indexOf(`~`)).replace(' ', 'T')) - new Date()
                        }

                        this.setData({
                            examDateData: d,
                            replay: "paused",
                        })

                    }
                }, {alarm: alarm}, "session=" + this.session
            )
        },
        getPYFA(data) { //培养方案
            // console.log(data)
            let that = this
            if (data !== undefined) {
                this.setData({
                    department: data[0],
                    major: data[1],
                    grade: data[2],
                })
            }

            this.setData({
                pyfaSemester: [['第一学期', '大一上'], ['第二学期', '大一下'], ['第三学期', '大二上'], ['第四学期', '大二下'],
                    ['第五学期', '大三上'], ['第六学期', '大三下'], ['第七学期', '大四上'], ['第八学期', '大四下'],]
            })
            //console.log(this.session)
            API.request(
                API.GET_CULTIVATE_SCHEME,
                {
                    ok: (d) => {
                        let pyfaData = [[], [], [], [], [], [], [], []]
                        that.setData({pyfaCount: d.length})
                        for (let i = 0; i < d.length; i++) {
                            for (let j = 0; j < d[i].Semester.length; j++) {
                                if (d[i].Semester[j] === ",") {
                                    continue
                                }
                                pyfaData[d[i].Semester[j] - 1].push(d[i])
                            }
                        }
                        console.log(pyfaData[0])
                        that.setData({pyfaData: pyfaData})
                        wx.hideLoading()
                        Notify({
                            background: '#77C182',
                            message: '获取成功',
                            context: this,
                        })
                        this.setData({replay: "paused"})
                    }
                }, {
                    department: data ? data[0] : "",
                    major: data ? data[1] : "",
                    grade: data ? data[2].substr(0, data[2].length - 1) : "",
                },
                "session=" + this.session
            )
        },
        waterCard() {
            let token = wx.getStorageSync('waterToken')
            //console.log(token)
            this.setData({
                token: token,
                pwd: '',
                stuNum: '',
                name: '',
            })
            this.checkToken()
            // console.log(token)
            if (token !== '') {
                this.setWaterInfo()
            } else {
                this.waterAutoLogin()
            }
        },
        waterAutoLogin() {
            API.getUserData(
                e => {
                    let pwd
                    if (parseInt(e.user.substring(0, 2)) >= 20) { //判断是19还是20级
                        console.log("20级")
                        pwd = e.user.substring(e.user.length - 6)
                    } else {
                        pwd = API.get(`idCard`)
                    }
                    this.loginWaterCard(e.name, e.user, pwd)
                }
            )
        },
        checkToken() {
            if (this.data.token === "") return
            API1.run(WaterCard.Img, {
                token: this.data.token
            }).doAsync().then(d => {
                this.setData({
                    imgUrl: d.codeUrl.replace("app.gzblackcloud.com", API1.getDomain() + "/water_card"),
                    replay: "paused"
                })
                Notify({
                    background: '#77C182',
                    message: '获取成功',
                    context: this,
                })
            }).catch(() => {
                wx.setStorageSync('waterToken', '')
            })
        },
        setWaterInfo() {
            API1.run(WaterCard.UserInfo, {
                token: this.data.token
            }).doAsyncNc().then(d => {
                this.setData({
                    balance: d.YskBalance,
                    userName: d.realname,
                    stuId: d.student
                })
                wx.setScreenBrightness({
                    value: 1
                })
                Notify({
                    background: '#77C182',
                    message: '获取成功',
                    context: this,
                })
            })
        },
        logout() {
            wx.removeStorageSync('waterToken')
            this.setData({token: ''})
        },
        loginWaterCard(name, stuNum, pwd) {
            API1.run(WaterCard.Login, {
                realname: this.data.name ? this.data.name : name,
                studentID: this.data.stuNum ? this.data.stuNum : stuNum,
                password: this.data.pwd ? this.data.pwd : pwd,
            }).doAsyncNc().then(d => {
                wx.setStorageSync('waterToken', d.token)
                this.setData({token: d.token})
                this.checkToken()
                this.setWaterInfo()

                Notify({
                    background: '#77C182',
                    message: '登录成功',
                    context: this,
                })
            }).catch(e => {
                console.log("获取水卡出错", e)
            })
        },
        getEmptyClass() {
            let week, weekValue = [], dayValue = []
            API.getStaticData((s) => {
                week = s.weekNow
            })
            if (week <= 0) week = 1
            for (let i = 0; i < 7; i++) {
                dayValue.push("周" + "一二三四五六日".charAt(i))
            }
            for (let i = 1; i <= 20; i++) {
                weekValue.push("第" + i + "周")
            }
            this.page.setData({
                columns: [
                    {
                        values: ['综合楼', '艺院', '服院', '其他'],
                        defaultIndex: 0
                    },
                    {
                        values: weekValue,
                        defaultIndex: week - 1
                    },
                    {
                        values: dayValue,
                        defaultIndex: new Date().getDay() - 1
                    }
                ],
                empClaShow0: false,
                empClaShow1: false,
                epClaTimeList: ['一二节 8:00-9:40', '三四节 10:05-11:45', '五六节 13:20-14:55', '七八节 15:15-16:50', '九十节 18:00-19:40', '十一二节 19:50-21:40'],
                result: ['三四节 10:05-11:45'],
            })
            this.setData({
                epDay: "周" + "日一二三四五六".charAt(new Date().getDay()),
                epWeek: "第" + week + '周',
                epTime: [0, 1, 0, 0, 0, 0],
                epHouse: '综合楼',
            })
            wx.hideLoading()
        },
        evaluation(data, url) {
            wx.hideLoading()
            wx.showLoading({title: '加载中'})
            // console.log('data', data)
            let query = ''
            if (this.data.Urls !== undefined && data !== undefined && data.currentTarget.id !== undefined) {
                query = this.data.Urls[data.currentTarget.id]
            }
            // console.log("urls",this.data.Urls)
            if (url !== undefined) {
                query = url
            }
            //console.log("query", query)
            //console.log("url", url)
            this.setData({
                showDetail: false,
                callbackUrl: query
            })
            API.request(
                API.EVALUATION_LIST,
                {
                    ok: (d) => {
                        if (d === null) {
                            Notify({background: '#CC5983', message: "此项暂时没有评教", context: this,})
                            wx.hideLoading()
                            return
                        }
                        if (d.EndTime !== undefined) {
                            this.setData(d)
                        } else if (d.length >= 1) {
                            this.setData({
                                evaArr: d,
                            })
                        }
                        //console.log(d)
                        wx.hideLoading()
                    },
                }, {
                    listData: query
                },
                "session=" + this.session
            )
        },
        toEvaluationPage(e) {
            wx.navigateTo({
                url: './evaluation/evaluation?query=' + encodeURIComponent(this.data.evaArr[e.currentTarget.id].Url) +
                    '&callbackUrl=' + encodeURIComponent(this.data.callbackUrl)
            })
        },
        replay() { //刷新
            if (this.data.replay === "running") {
                return
            }
            this.setData({replay: "running"})
            switch (this.data.title) {
                case "成绩查询":
                    this.setData({activeName: ""})
                    this.getScore(this.data.semester)
                    break
                case "考试日程":
                    this.getExamDate()
                    break
                case "培养方案":
                    this.getPYFA()
                    break
                case "水卡":
                    this.waterCard()
                    break
            }
        },
        openModel(e) {
            getApp().openModel(e.currentTarget.dataset.text)
        },
        cetMark(id) {
            API.getUserData(
                d => {
                    API.request(API.CET_MARK, {
                            ok: d => {
                                if (d.code === 200) {
                                    console.log(d)
                                    this.setData({data: d});
                                    wx.hideLoading()
                                } else {
                                    wx.showModal({
                                        title: d.msg
                                    })
                                    wx.hideLoading()
                                }

                            },
                            no: (c, d) => {
                                console.log(d.err_msg)
                                wx.showToast({
                                    icon: 'none',
                                    title: d.err_msg
                                })
                            }
                        }, {
                            km: id
                        },
                        "session=" + d.session
                    )
                }
            )
        },
        wxlogin() {
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
        },
    },

    lifetimes: { //组件生命周期
        attached: function () {
            API.getUserData(d => {
                getApp().globalData.firstin = false
                //console.log(`userdata`, d)
                this.session = d.session
                this.page = getCurrentPages()[0];//获取页面页面实例对象
                // 在组件实例进入页面节点树时执行
                switch (this.properties.title) {
                    case '成绩查询':
                        let arr = API.geneSemesterArr()
                        let semester = API.get(`lastSemester`)
                        if (semester === undefined || semester === "" || semester === null) {
                            semester = arr[1]
                            API.set(`lastSemester`, arr[1])
                        }
                        for (let i = 0; i < arr[0].length; i++) {
                            arr[0][i].color = "black"
                        }
                        //console.log(arr[0])
                        this.setData({actions: arr[0], semester: semester})
                        this.getScore(semester)
                        break
                    case '考试日程':
                        this.getExamDate()
                        break
                    case '培养方案':
                        this.getPYFA()
                        break
                    case '空教室':
                        this.getEmptyClass()
                        break
                    case '水卡':
                        this.waterCard()
                        break
                    case '评教':
                        this.evaluation()
                        break
                    case '四六级成绩查询':
                        wx.hideLoading()
                        // this.cetMark()
                        break
                }
            })

        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    }
})
