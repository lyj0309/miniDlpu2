import Notify from "../../miniprogram_npm/@vant/weapp/notify/notify";

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
            imgSrc: '../../image/information/search.png',
            id: "exam_score"
        }, {
            imgSrc: '../../image/information/ksrc.png',
            text: '考试日程',
            id: "exam_date"
        }, {
            text: '校历',
            imgSrc: '../../image/information/date.png',
            id: "school_calendar"
        }, {
            text: '培养方案',
            imgSrc: '../../image/information/edu.png',
            id: "pyfa"
        }, {
            text: '空教室',
            imgSrc: '../../image/information/room2.png',
            id: "empty_class"
        }, {
            text: '水卡',
            imgSrc: '../../image/information/qr_code.png',
            id: "water_card"
        }, {
            text: '评教',
            imgSrc: '../../image/information/pingjiao.png',
            id: "evaluation"
        }/*, {
            text: '四六级(beta)',
            imgSrc: '../../image/information/CET.png'
        }*//*, {
            text: '统一支付',
            imgSrc: '../../image/pay.png'
        }*/
        ],
        slides: [{type: 'img', src: '../../image/morebg.png'},
            {type: 'ad', appId:'wxde8ac0a21135c07d',path:'/index/pages/h5/h5?weburl=https%3A%2F%2Fclick.meituan.com%2Ft%3Ft%3D1%26c%3D1%26p%3DOWMpZ-uzIFOVe6JyOONs3dXuqV0qcAf-r-KCvHdXiNfjxCYyPaUVAwZmPr8KocAZmJ-B6nKXPPRQdH-k2oX1SKrfJ9Q1ssPaktUC0lkRVT5unD5UU8CxHJm5zOdlxCP0gy3Z1o7HimSj-nxcrK08uIgxcaFy4Kyv80pSl1_Ekhh2V8yZI0e35D5R2gHPsIf0z6d2LTHBMRziDrFB9fcrfRMEIK2iu257LPRKIRVWecI8x8AI17wdS58WCL-Rb7shJbKnT5a6zdXejlu63p6Zsa1PfwJsPU98Eu2L73g0fxVXOBiY1XJf-fkeNdMX9ABfFHfQvxu002xyjWJW3WaV4em7g_esh2h25xwK4pOA9E-6oD4cfKB7yBdE8rPjS-M3fYn528TnJDsKyOTdSZuUD7IrZhYqqr_LAQfwI0WfROIK0yctMI-iFafC00GukvPDfYWUY70gTiwakhiLHPiFMBmCAC58WILhPsXbgjV7SzmqClg3DXAtyG2vTjiqpHMDkBknYFtu5Q_zzXV7DSpyeYYx47E4PUidDZTWnpv-HzzsGa3Mb3Tw8xh68q2xIt3NK_90rZymxkGYgvcaUOPp8dsykzEi7WsO6OpNkE93UVXW7NBg767ECk5NFqxeRvuuAGCjehm3huMBfI59UWJmAjYQHMSVz-17L7cyJmUnAYU&lch=cps:waimai:5:975580a039d49dc4e47c9235b36c8599:lbt&f_token=1&f_userId=1',src: '../../image/slides/mtad.jpg'},
            {type: 'ad',appId:'wxece3a9a4c82f58c9',path:'taoke/pages/shopping-guide/index?scene=KCSkKou', src: '../../image/slides/elad.jpg'}
        ],
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
    onPyfaChange(event) {
        const {picker, value, index} = event.detail;
        // console.log(value,index,this.data.pyfa[value[0]][Object.keys(this.data.pyfa[value[0]])[0]])
        picker.setColumnValues(1, Object.keys(this.data.pyfa[value[0]]));
        if (index === 0) {
            picker.setColumnValues(2, this.data.pyfa[value[0]][Object.keys(this.data.pyfa[value[0]])[0]]);
        } else {
            picker.setColumnValues(2, this.data.pyfa[value[0]][value[1]]);
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
    pyfaConfirm(e) {
        wx.showLoading({title: `加载中`})
        this.infoCom.getPYFA(e.detail.value)
        this.setData({empClaShow0: false})
    },
    propTap: function (prop) {
        wx.showLoading({title: '加载中···'})
        //console.log(prop.currentTarget.id)
        wx.reportAnalytics(this.data.array[parseInt(prop.currentTarget.id)].id, {});
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
    openAd(e) {
        wx.navigateToMiniProgram({
            appId: this.data.slides[e.currentTarget.id].appId,
            path: this.data.slides[e.currentTarget.id].path,
            success(res) {
                // 打开成功
            }
        })
    },
    showPyfaSelect() {//显示培养方案选择框
        if (this.data.pyfa !== undefined) {
            wx.hideLoading()
            this.setData({
                empClaShow0: true
            })
            return
        }

        API.getUserData(
            d => {
                API.request(API.GET_CULTIVATE_SCHEME_LIST, {
                    ok: r => {
                        this.setData({
                            columns: [
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
                            pyfa: r,
                            empClaShow0: true
                        })
                        wx.hideLoading()
                    }
                }, {}, "session=" + d.session)
            }
        )
    },
    onLoad(query) {

        wx.showShareMenu({

            withShareTicket: true,

            menus: ['shareAppMessage', 'shareTimeline']

        })
        if (query.id !== undefined) {
            let prop = {
                currentTarget: {
                    id: 1
                }
            }
            this.propTap(prop)
        }

        wx.request({
            url: "https://v0.api.upyun.com/dpujwc/sideshow/",
            header: {
                'content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Basic Zm9udDpuTHZIRVNDZ3JpOFJXa3FnWXM2RGRnblV1S1pCcjU4eg=='
            },
            success: result => {
                for (const file of result.data.files) {
                    this.data.slides.push({src: 'https://cdn.nogg.cn/sideshow/' + file.name,type:'ad'})
                }
                this.setData({slides: this.data.slides})
            }
        })
        if (wx.getSystemInfoSync().theme !== 'light') {
            this.setData({
                overlayStyle: "background-color: rgba(255,255,255,0.7)"
            })
        }
    },
})
