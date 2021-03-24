import Notify from "../../miniprogram_npm/@vant/weapp/notify/notify";
const DEBUG = new (require("../../script/Debug"))();

const API = require("../../script/API");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        verShow: false,
        verCode: '',
        title: '',
        show: false,
        array: [{
            text: '成绩查询',
            imgSrc: '../../image/information/search.png'
        }, {
            imgSrc: '../../image/information/ksrc.png',
            text: '考试日程'
        }, {
            text: '校历',
            imgSrc: '../../image/information/date.png'
        }, {
            text: '培养方案',
            imgSrc: '../../image/information/edu.png'
        }, {
            text: '空教室',
            imgSrc: '../../image/information/room2.png'
        }, {
            text: '水卡',
            imgSrc: '../../image/information/qr_code.png'
        }, {
            text: '评教',
            imgSrc: '../../image/information/pingjiao.png'
        }/*, {
            text: '四六级(beta)',
            imgSrc: '../../image/information/CET.png'
        }*//*, {
            text: '统一支付',
            imgSrc: '../../image/pay.png'
        }*/
        ],
        slides:[{src:'../../image/morebg.png'}],
        container: null,
        minShow: false,
        empClaShow0: false
    },
    empClaConfirm0(event) { //空教室确认
        const {picker, value, index} = event.detail
        //console.log(value)
        this.setData({empClaShow0: false,})
        this.infoCom.setData({epHouse: value[0], epWeek: value[1], epDay: value[2]})
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
        //console.log(this.data.result)
        this.infoCom.setData({epTime: time})
        this.setData({empClaShow1: false, epClaTimeList: this.data.epClaTimeList})

    },
    onPickerChange(event) {//星期几选择
        this.setData({
            result: event.detail
        })
    },
    onPyfaChange(event){
        const { picker, value, index } = event.detail;
        console.log(value,index,this.data.pyfa[value[0]][Object.keys(this.data.pyfa[value[0]])[0]])
        picker.setColumnValues(1,Object.keys(this.data.pyfa[value[0]]));
        if (index === 0){
              picker.setColumnValues(2,this.data.pyfa[value[0]][Object.keys(this.data.pyfa[value[0]])[0]]);
        }else {
            picker.setColumnValues(2,this.data.pyfa[value[0]][value[1]]);
        }
    },
    toggle(event) {
        const {index} = event.currentTarget.dataset
        const checkbox = this.selectComponent(`.checkboxes-${index}`)
        checkbox.toggle()
    },
    noop() {
    },
    empClaClose0() {
        this.setData({empClaShow0: false})
    },
    empClaClose1() {
        this.setData({empClaShow1: false})
    },
    refreshEva(data) {
        this.popup = this.selectComponent("#com"); //组件的id
        this.popup.evaluation(undefined, data); //组件里里面定义的方法
    },

    closeMinModel() {
        this.setData({minShow: false});
    },
    onClose() {
        this.setData({show: false, title: '', verShow: false});
    },
    pyfaConfirm(e){
        wx.showLoading({title:`加载中`})
        this.infoCom.getPYFA(e.detail.value)
        this.setData({empClaShow0: false})
    },
    propTap: function (prop) {
        wx.showLoading({title: '加载中···'})
        //console.log(prop.currentTarget.id)
        switch (prop.currentTarget.id) {
            case '2':
                wx.navigateTo({
                    url: './simple/index?name=xl'
                })
                wx.hideLoading()
                break
            case '7':
                this.getVerImg()
                /*                    wx.navigateToMiniProgram({
                                        appId: 'wx96401daae94c037c',
                                        path: 'pages/Subpages/StudentId/StudentId?id=' + 'dasfsadf' + '&pwd=' + 'asdfdsaf',
                                        envVersion: 'release',
                                        success(res) {
                                            // 打开成功
                                        }
                                    })*/


                /*                    wx.navigateTo({
                                        url: './simple/index'
                                    })*/
                break
            case '8': //意见反馈
                wx.hideLoading()
                break
            default:
                this.setData({show: true, title: this.data.array[parseInt(prop.currentTarget.id)].text});
                break
        }
        this.infoCom = this.selectComponent("#com");
    },

    getVerImg() {
        API.getUserData(
            data => {
                API.request(API.CET, {
                        ok: (d) => {
                            this.setData({
                                verImg: d.img,
                                verSession: d.session,
                                verShow: true
                            })
                            wx.hideLoading()
                            console.log(d)
                        }
                    }, {},
                    "session=" + data.session
                )
            }
        )
    },
    // 查询四级成绩
    queryCet() {
        wx.showLoading({title: "加载中"})
        if (this.data.verCode.length === 0) {
            this.getVerImg();
            return
        }
        API.getUserData(
            d => {
                API.request(API.CET, {
                        ok: d => {
                            wx.hideLoading()
                            const oriData = d.slice(16, d.length - 2)
                            console.log(oriData)
                            const verData = oriData.toString().replace(/{/g, '{"').replace(/:/g, '":').replace(/,/g, ',"').replace(/'/g, '"')
                            //const verData = oriData.toString().replace("'",'"')
                            console.log(verData)
                            this.setData({show: true, title: '四六级', verShow: false, verData: JSON.parse(verData)});
                        },
                        no: (c, d) => {
                            console.log(d.err_msg)
                            wx.showToast({
                                icon: 'none',
                                title: d.err_msg
                            })
                            this.getVerImg()
                        }
                    }, {
                        code: this.data.verCode,
                        session: this.data.verSession
                    },
                    "session=" + d.session
                )
            }
        )
    },
    preViewImg(e){
        if (e.currentTarget.id === "0") return
        wx.previewImage({
            urls:[this.data.slides[e.currentTarget.id].src]
        })
    },
    showPyfaSelect(){//显示培养方案选择框
        API.getUserData(
            d => {
                API.request(API.GET_CULTIVATE_SCHEME_LIST,{
                    ok :r=>{
                        this.setData({columns:[
                                {
                                    values: Object.keys(r),
                                    className: 'column1',
                                },
                                {
                                    values: Object.keys(r[Object.keys(r)[0]]),
                                    className: 'column2',
                                },
                                {
                                    values: r[Object.keys(r)[0]][Object.keys(r[Object.keys(r)[0]])[0]],
                                    className: 'column3',
                                },
                            ],
                            pyfa:r,
                            empClaShow0:true
                        })
                        wx.hideLoading()
                    }
                },{},"session=" + d.session)
            }
        )

    },
    onLoad(query) {
        wx.showShareMenu({

            withShareTicket:true,

            menus:['shareAppMessage','shareTimeline']

        })
        if (query.id !== undefined) {
        let prop = {
            currentTarget:{
                id :1
            }
        }
            this.propTap(prop)
        }

        wx.request({
            url :"https://v0.api.upyun.com/dpujwc/sideshow/",
            header: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic Zm9udDpuTHZIRVNDZ3JpOFJXa3FnWXM2RGRnblV1S1pCcjU4eg=='
            },
            success:result => {
                for (const file of result.data.files) {
                    this.data.slides.push({src:'https://cdn.nogg.cn/sideshow/'+file.name})
                }
                this.setData({slides:this.data.slides})
            }
        })
        if (wx.getSystemInfoSync().theme !== 'light') {
            this.setData({
                overlayStyle: "background-color: rgba(255,255,255,0.7)"
            })
        }
    },
})
