const API = require("../../script/API");
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Component({
    styleIsolation: 'shared', //解除组件样式隔离
    properties: { //传过来的值
        title: {
            type: String,
            value: '',
        }
    },
    data: {
        option1: [
            { text: '全部商品', value: 0 },
            { text: '新款商品', value: 1 },
            { text: '活动商品', value: 2 },
        ],
        replay: "paused",
        actions: [],
        value1: 0,
        show: false,
        semester: '',
    },
    methods: {

        onActionSelect(event) { //查成绩选择学期
            wx.showLoading({title:"加载中"})
            this.setData({semester: event.detail.name, activeName: ""})
            this.getScore(event.detail.name)
            console.log(event.detail)
        },

        empClaConfirm0(event) {
            const {picker, value, index} = event.detail
            console.log(value)
            this.setData({empClaShow0: false, epHouse: value[0], epWeek: value[1], epDay: value[2]})
        },
        empClaConfirm1() { //第几节确认
            if (this.data.result.length === 0) {
                Notify({
                    background: '#CC5983',
                    message: '至少选择一个哦',
                    context: this,
                })
                return
            }
            let time = [0, 0, 0, 0, 0, 0]
            for (let i = 0; i < this.data.result.length; i++) {
                for (let j = 0; j < this.data.epClaTimeList.length; j++) {
                    if (this.data.epClaTimeList[j] === this.data.result[i]) {
                        time[j] = 1
                        break
                    }
                }

            }
            console.log(this.data.result)
            this.setData({empClaShow1: false, epTime: time})
        },
        onScoreChange(event) {
            this.setData({
                activeName: event.detail,
            })
        },
        onPickerChange(event) {//星期几选择
            this.setData({
                result: event.detail
            })
        },
        toggle(event) {
            const {index} = event.currentTarget.dataset
            const checkbox = this.selectComponent(`.checkboxes-${index}`)
            checkbox.toggle()
        },
        noop() {
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
                            Notify({background: '#77C182', message: '查询成功', context: this,duration: 933,})
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
        empClaClose0() {
            this.setData({empClaShow0: false})
        },
        empClaClose1() {
            this.setData({empClaShow1: false})
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
                this.setData({empClaShow0: true})
            } else {
                this.setData({empClaShow1: true})
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
                                duration: 933,
                                background: '#77C182',
                                message: '获取成功',
                                context: this,
                            })
                            that.setData({
                                replay: "paused",
                                scoreData: d.data.data.Scores,
                                GPA: d.data.data.GPA,
                                opc0: new Array(d.data.data.Scores.length).fill(0),
                                opc1: new Array(d.data.data.Scores.length).fill(1)
                            })
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
                            that.setData({examDateData: d.data.data,replay: "paused"})
                            wx.hideLoading()
                            Notify({
                                duration: 933,
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
            API.getUserData((d) => {
                //console.log(d.session)
                API.request(
                    API.GET_CULTIVATE_SCHEME,
                    {
                        success: (d) => {
                            //console.log('成功', d.data.data)
                            that.setData({pyfaData: d.data.data})
                            wx.hideLoading()
                            Notify({
                                duration: 933,
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
            if (token !== '') {
                this.setWaterInfo()
            }
            wx.hideLoading()
        },
        checkWaterLogin() {
            //console.log(this.data.token)
            API.request( //请求水卡图片地址
                API.LOGIN_WATERCARD,
                {
                    success: (d) => {
                        if (d.data.errcode === 0) {
                            console.log('获取图片成功', d.data)
                            this.setData({imgUrl: d.data.errmsg.codeUrl,replay: "paused"})
                        } else {
                            wx.setStorageSync('waterToken', '')
                        }
                        wx.hideLoading()
                    }
                }, {
                    i: "2",
                    j: "3",
                    c: "entry",
                    m: "water",
                    do: "appapi",
                    op: "user.getPrcode",
                    time: "1607400092",
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
                            this.setData({balance: d.data.errmsg.YskBalance})
                            Notify({
                                duration: 933,
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
                    i: "2",
                    j: "3",
                    c: "entry",
                    m: "water",
                    do: "appapi",
                    op: "user.getIndex",
                    time: "1607424790",
                    sign: "243e317a29b4f8f180df5047ec39cd56",
                    token: this.data.token
                },
            )
        },
        logout() {
            wx.removeStorageSync('waterToken')
            this.setData({token: ''})

        },
        loginWaterCard() {
            API.request(
                API.LOGIN_WATERCARD,
                {
                    success: (d) => {
                        //console.log('成功', d.data)
                        if (d.data.errcode === '0') {
                            wx.setStorageSync('waterToken', d.data.errmsg.token)
                            this.setData({token: d.data.errmsg.token})
                            this.checkWaterLogin()
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
                    i: "2",
                    j: "3",
                    c: "entry",
                    m: "water",
                    do: "appapi",
                    op: "user.login",
                    realname: this.data.name,
                    studentID: this.data.stuNum,
                    password: this.data.pwd,
                    time: "1607400092",
                    sign: "dffddefeb30cc01984f00ee8038e0793",
                    style: "2",
                    schoolID: "7"
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
            this.setData({
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
                epDay: "周" + "日一二三四五六".charAt(new Date().getDay()),
                epWeek: week + '周',
                epTime: [0, 1, 0, 0, 0, 0],
                epHouse: '综合楼',
                epClaTimeList: ['一二节 8:00-9:40', '三四节 10:05-11:45', '五六节 13:20-14:55', '七八节 15:15-16:50', '九十节 18:00-19:40', '十一二节 19:50-21:40'],
                result: ['三四节 10:05-11:45'],
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
            if (this.data.replay === "running"){
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
        ready(){
            console.log(wx.createSelectorQuery().select('#com'))
            console.log(wx.createSelectorQuery().select('#com1s'))
            this.setData({
                container: () => wx.createSelectorQuery().select('#com'),
            });
        },
        attached: function () {

            // 在组件实例进入页面节点树时执行=
            switch (this.properties.title) {
                case '成绩查询':
                    let rage = []
                    let xueQi = [['大一上', '大一下'], ['大二上', '大二下'], ['大三上', '大三下'], ['大四上', '大四下']]
                    let user = API.get("user")
                    let semester = API.get("semester")
                    user = '20' + user.slice(0, 2)
                    let nowYear = new Date().getFullYear()
                    for (let i = 8; i >= -1; i--) {
                        for (let k = 1; k <= 2; k++) {
                            let currXQ = (nowYear - (i + 1)) + "-" + (nowYear - i) + "-" + k
                            let idx = nowYear - (i + 1) - user
                            if (semester === currXQ) {
                                let a = currXQ + '  ' + xueQi[idx][k - 1]
                                rage.unshift({name: a})
                                rage.unshift({name: '全部学期'})
                                this.setData({actions: rage, semester: a})
                                this.getScore(a)
                                return
                            }
                            if (idx >= 0 && idx <= 3) {
                                rage.unshift({name: currXQ + '  ' + xueQi[idx][k - 1]})
                            }
                        }
                    }
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
