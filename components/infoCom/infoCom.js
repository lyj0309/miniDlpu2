const API = require("../../script/API");
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Component({
    styleIsolation: 'shared', //解除组件样式隔离
    properties: { //传过来的值
        title: {
            type: String,
            value: '',
        },
    },
    data: {
        replay: "paused",
        actions: [],
        show: false,
        semester: '',
    },
    methods: {
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
            this.getScore(event.detail.name)
            console.log(event.detail)
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
            API.getUserData((d) => {
                API.request(
                    API.GET_EMPTY_CLASS,
                    {
                        success: (d) => {
                            let cla = []
                            for (let i = 0; i < 8; i++) {
                                cla.push([])
                            }
                            //console.log(d.data)
                            // 1、整理时间数组
                            // 2、整理几楼（每一楼一个数组）
                            for (let i = 0; i < d.data.data.length; i++) {
                                let time = [0, 0, 0, 0, 0, 0]
                                let floor
                                for (let f = 0; f < d.data.data[i].Time.length; f++) {
                                    time[d.data.data[i].Time[f] - 1] = 1
                                }
                                if (this.data.epHouse === '综合楼') {
                                    floor = d.data.data[i].Room.slice(2, 3) //获取在几楼
                                } else {
                                    floor = d.data.data[i].Room.slice(1, 2) //获取在几楼
                                }

                                //console.log(floor)
                                if (!isNaN(floor)) {
                                    cla[floor - 1].push({Room: d.data.data[i].Room, Time: time})
                                } else {
                                    cla[7].push({Room: d.data.data[i].Room, Time: time})
                                }
                                //console.log(d.data.data[i].Room,d.data.data[i].Room.slice(2,3))
                            }
                            this.setData({empClaArr: cla})
                            // console.log(cla)
                            wx.hideLoading()
                            Notify({background: '#77C182', message: '查询成功', context: this,})
                        }
                    }, {
                        time: time,//第几节
                        week: this.data.epWeek.match(/\d.?/)[0],//第几周
                        house: this.data.epHouse,//哪一栋
                        day: day,//周几
                    },
                    "session=" + d.session
                )
            })
        },
        getScoreDetail(e) {
            if (this.data.scoreData[e.detail].Final !== undefined) { //防止多次请求
                return
            }
            API.getUserData((d) => {
                API.request(API.GET_EXAM_SCORE, {
                        success: (d) => {
                            if (d.data.data === null || d.data.data.Total === "？？？？？？") {
                                this.setData({['scoreData[' + e.detail + '].Final']: "x"})
                                this.setData({['opc0[' + e.detail + ']']: 1, ['opc1[' + e.detail + ']']: 0})
                                return
                            }
                            this.setData({
                                ['scoreData[' + e.detail + ']']:
                                    Object.assign(this.data.scoreData[e.detail], d.data.data),
                            })
                            this.setData({['opc0[' + e.detail + ']']: 1, ['opc1[' + e.detail + ']']: 0})
                        }
                    }, {
                        data: encodeURI(this.data.scoreData[e.detail].Detail)
                    },
                    "session=" + d.session
                )
            })
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
        getScore(semester) {//获取成绩
            if (semester === undefined || semester === '全部学期') {
                semester = ''
            } else {
                semester = semester.slice(0, 11)
            }
            let that = this
            API.getUserData((d) => {
                API.request(
                    API.GET_EXAM_SCORE,
                    {
                        success: (d) => {
                            Notify({
                                background: '#77C182',
                                message: '获取成功',
                                context: this,
                            })
                            let set = function () {
                                that.setData({
                                    replay: "paused",
                                    scoreData: d.data.data.Scores,
                                    GPA: d.data.data.GPA,
                                    opc0: new Array(d.data.data.Scores === null ? 0 : d.data.data.Scores).fill(0),
                                    opc1: new Array(d.data.data.Scores === null ? 0 : d.data.data.Scores).fill(1)
                                })
                            }
                            if (d.data.data.GPA.indexOf('.') !== 1) API.reLogin(e => {
                                set()
                            }, getApp())
                            else set()

                            wx.hideLoading()
                        }
                    }, {
                        data: semester
                    },
                    "session=" + d.session
                )
            })
        },
        getExamDate() {
            let that = this
            API.getUserData((d) => {
                // console.log(d.session)
                API.request(
                    API.GET_EXAM_DATE,
                    {
                        success: (d) => {
                            //console.log('成功', d.data.data)
                            that.setData({examDateData: d.data.data, replay: "paused"})
                            wx.hideLoading()
                            Notify({
                                background: '#77C182',
                                message: '获取成功',
                                context: this,
                            })
                        }
                    }, {},
                    "session=" + d.session
                )
            })
        },
        getPYFA() { //培养方案
            let that = this
            this.setData({
                pyfaSemester: [['第一学期', '大一上'], ['第二学期', '大一下'], ['第三学期', '大二上'], ['第四学期', '大二下'],
                    ['第五学期', '大三上'], ['第六学期', '大三下'], ['第七学期', '大四上'], ['第八学期', '大四下'],]
            })
            API.getUserData((d) => {
                //console.log(d.session)
                API.request(
                    API.GET_CULTIVATE_SCHEME,
                    {
                        success: (d) => {
                            let pyfaData = [[], [], [], [], [], [], [], []]
                            that.setData({pyfaCount: d.data.data.length})
                            for (let i = 0; i < d.data.data.length; i++) {
                                for (let j = 0; j < d.data.data[i].Semester.length; j++) {
                                    if (d.data.data[i].Semester[j] === ",") {
                                        continue
                                    }
                                    pyfaData[d.data.data[i].Semester[j] - 1].push(d.data.data[i])
                                }
                            }
                            that.setData({pyfaData: pyfaData})
                            wx.hideLoading()
                            Notify({
                                background: '#77C182',
                                message: '获取成功',
                                context: this,
                            })
                            this.setData({replay: "paused"})
                        }
                    }, {},
                    "session=" + d.session
                )
            })
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
            this.checkWaterLogin()
            console.log(token)
            if (token !== '') {
                this.setWaterInfo()
            } else {
                this.waterAutoLogin()
            }
            wx.hideLoading()
        },
        waterAutoLogin() {
            API.getUserData(
                e => {
                    let pwd
                    if (e.user.substring(0, 2) === "20") { //判断是19还是20级
                        console.log("20级")
                        pwd = e.user.substring(e.user.length - 6)
                    } else {
                        pwd = API.get(`idCard`)
                    }
                    this.loginWaterCard(e.name, e.user, pwd)
                }
            )
        },
        checkWaterLogin() {
            //console.log(this.data.token)
            API.request( //请求水卡图片地址
                API.LOGIN_WATERCARD,
                {
                    success: (d) => {
                        if (d.data.errcode === 0) {
                            console.log('获取图片成功', d.data)
                            this.setData({imgUrl: d.data.errmsg.codeUrl, replay: "paused"})
                        } else {
                            wx.setStorageSync('waterToken', '')
                        }
                        wx.hideLoading()
                    }
                }, {
                    i: "2", j: "3", c: "entry", m: "water", do: "appapi", op: "user.getPrcode", time: "1607400092",
                    sign: "dffddefeb30cc01984f00ee8038e0793",
                    token: this.data.token
                },
            )
        },
        setWaterInfo() {
            API.request( //请求用户数据
                API.LOGIN_WATERCARD,
                {
                    success: (d) => {
                        console.log('成功', d.data)
                        if (d.data.errcode === 0) {
                            this.setData({
                                balance: d.data.errmsg.YskBalance,
                                userName: d.data.errmsg.realname,
                                stuId: d.data.errmsg.student
                            })
                            Notify({
                                background: '#77C182',
                                message: '获取成功',
                                context: this,
                            })
                            console.log(d.data)
                        } else {
                            Notify({
                                background: '#CC5983',
                                message: d.data.errmsg,
                                context: this,
                            })
                        }
                        wx.hideLoading()
                    }
                }, {
                    i: "2", j: "3", c: "entry", m: "water", do: "appapi", op: "user.getIndex", time: "1607424790",
                    sign: "243e317a29b4f8f180df5047ec39cd56", token: this.data.token
                },
            )
        },
        logout() {
            wx.removeStorageSync('waterToken')
            this.setData({token: ''})

        },
        loginWaterCard(name, stuNum, pwd) {
            API.request(
                API.LOGIN_WATERCARD,
                {
                    success: (d) => {
                        //console.log('成功', d.data)
                        if (d.data.errcode === '0') {
                            wx.setStorageSync('waterToken', d.data.errmsg.token)
                            this.setData({token: d.data.errmsg.token})
                            this.checkWaterLogin()
                            this.setWaterInfo()
                            Notify({
                                background: '#77C182',
                                message: '登录成功',
                                context: this,
                            })
                        } else {
                            Notify({background: '#CC5983', message: d.data.errmsg, context: this,})
                        }
                        wx.hideLoading()
                    }
                }, {
                    i: "2", j: "3", c: "entry", m: "water", do: "appapi", op: "user.login",
                    realname: this.data.name ? this.data.name : name,
                    studentID: this.data.stuNum ? this.data.stuNum : stuNum,
                    password: this.data.pwd ? this.data.pwd : pwd,
                    time: "1607400092", sign: "dffddefeb30cc01984f00ee8038e0793",
                    style: "2", schoolID: "7"
                },
            )
        },
        getEmptyClass() {
            let week, weekValue = [], dayValue = []
            API.getStaticData((s) => {
                week = s.weekNow
            })
            for (let i = 0; i < 7; i++) {
                dayValue.push("周" + "一二三四五六日".charAt(i))
            }
            for (let i = 1; i <= 20; i++) {
                weekValue.push(i + "周")
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
                epWeek: week + '周',
                epTime: [0, 1, 0, 0, 0, 0],
                epHouse: '综合楼',
            })
            wx.hideLoading()
        },
        evaluation(data, url) {
            wx.showLoading({title: '加载中'})
            console.log('data', data)
            let query = ''
            if (data !== undefined) {
                query = this.data.Urls[data.currentTarget.id]
            }
            if (url !== undefined) {
                query = url
            }
            console.log("query", query)
            console.log("url", url)
            this.setData({
                showDetail: false,
                callbackUrl: query
            })
            API.getUserData((d) => {
                API.request(
                    API.EVALUATION_LIST,
                    {
                        success: (d) => {
                            if (d.data.data === null) {
                                Notify({background: '#CC5983', message: "此项暂时没有评教", context: this,})
                                wx.hideLoading()
                                return
                            }
                            if (d.data.data.EndTime !== undefined) {
                                this.setData(d.data.data)
                            } else if (d.data.data.length >= 1) {
                                this.setData({
                                    evaArr: d.data.data,
                                })
                            }
                            //console.log(d.data.data)
                            wx.hideLoading()
                        },
                    }, {
                        listData: query
                    },
                    "session=" + d.session
                )
            })
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
        }
    },
    lifetimes: { //组件生命周期
        attached: function () {
            this.page = getCurrentPages()[0];//获取页面页面实例对象
            // 在组件实例进入页面节点树时执行=
            switch (this.properties.title) {
                case '成绩查询':
                    let arr = API.geneSemesterArr()
                    for (let i = 0; i < arr[0].length; i++) {
                        arr[0][i].color = "black"
                    }
                    console.log(arr[0])
                    this.setData({actions: arr[0], semester: arr[1]})
                    this.getScore(arr[1])
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
            }
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
        },
    }
})
