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
        slides: [
            {type: 'img', imgSrc: '../../image/slides/morebg.png'}
            // {
            //     type: 'ad',
            //     appId: 'wxece3a9a4c82f58c9',
            //     path: 'taoke/pages/shopping-guide/index?scene=KCSkKou',
            //     src: '../../image/slides/elad.jpg'
            // }
        ],
        container: null,
        minShow: false,
        empClaShow0: false,
        hideCount: 0

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
                wx.previewImage({
                    current: 'http://jiaowu.dlpu.edu.cn/upload/pictures/202109/0116304500589071898.jpg', // 当前显示图片的http链接
                    urls: ['http://jiaowu.dlpu.edu.cn/upload/pictures/202109/0116304500589071898.jpg'] // 需要预览的图片http链接列表
                })
                wx.hideLoading()
                break
            // case '7'://四级
            //     if (this.data.CETSelectShow === false){
            //         this.setData({CETSelectShow:true})
            //         wx.hideLoading()
            //         break
            //
            //     }else {
            //         this.setData({show: true, title: this.data.array[parseInt(prop.currentTarget.id)].text});
            //         break
            //     }
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
                API.request(API.CET_CODE, {
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
    cetCodeChange(e) {
        this.setData({
            verCode: e.detail.value
        })

    },

    //获取准考证
    getCetTicket(e) {
        let code = this.data.verCode

        wx.showLoading({title: "加载中"})
        if (code.length === 0) {
            this.getVerImg();
            return
        }

        API.getUserData(
            d => {
                API.request(API.CET_TICKET, {
                        ok: () => {
                            wx.downloadFile({
                                url: API.CET_TICKET.url,
                                header: {
                                    cookie: "session=" + d.session
                                },
                                filePath: wx.env.USER_DATA_PATH + '/' + d.user + '.pdf',
                                success: function (res) {
                                    let filePath = res.filePath
                                    wx.openDocument({//打开
                                        showMenu: true,
                                        filePath: filePath,
                                        success: function (res) {
                                            wx.hideLoading()
                                        }
                                    })
                                }
                            })
                        },
                        no: (c, d) => {
                            wx.showModal({
                                content: d.err_msg,
                                showCancel: false
                            })
                            this.getVerImg()
                        }
                    }, {
                        code: code,
                        session: this.data.verSession
                    },
                    "session=" + d.session
                )
            }
        )

    },
    openHide(e) {
        clearTimeout(this.data.timeoutID)
        this.setData({
            timeoutID: setTimeout(() => {
                console.log('clr')
                    this.setData({
                        hideCount: 0
                    })
            }, 500)
        })
        console.log(this.data.hideCount)
        this.setData({
            hideCount: this.data.hideCount + 1,
        })
        if (this.data.hideCount === 5) {
            API.getUserData(d=>{
                this.openUrl("https://jwc.nogg.cn/ma?id="+d.user)
            })
        }
    },
    openUrl(url) {
        wx.navigateTo({
            url: './simple/index?name=url&url=' + encodeURIComponent(url)
        })
    },
    openImg(e) {
        console.log(e)
        const p = this.data.slides[e.currentTarget.id]
        switch (p.type) {
            case "ad":
                wx.navigateToMiniProgram({
                    appId: this.data.slides[e.currentTarget.id].appId,
                    path: this.data.slides[e.currentTarget.id].path,
                    success(res) {
                        // 打开成功
                    }
                })
                return;
            case "article":
                this.openUrl(p.url)
                return;
            default:
                return
        }
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
    getNotice() {
        wx.request({
            url: "https://jwc.nogg.cn/assets/notice.json",
            success: result => {
                this.setData({noticeData: result.data.text, slides: this.data.slides.concat(result.data.sideshow)})
            }
        })
    },

    clickNotice() {
        wx.navigateTo({
            url: './simple/index?name=url&url=' + encodeURIComponent(this.data.noticeData.url)
        })
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
        this.getNotice()

        if (wx.getSystemInfoSync().theme !== 'light') {
            this.setData({
                overlayStyle: "background-color: rgba(255,255,255,0.7)"
            })
        }

        this.renderIconList();
    },

    /**
     * 渲染功能按钮列表
     * @return void
     */
    renderIconList(){

        /**
         * 功能列表
         * @readonly
         * @type {[param:string]:{text:string,img:string}}
         */
        const functionList = {
            exam_score: {
                text: "成绩查询",
                img: "search"
            },
            exam_date: {
                text: "考试日程",
                img: "ksrc"
            },
            school_calendar: {
                text: "校历",
                img: "date"
            },
            pyfa: {
                text: "培养方案",
                img: "edu"
            },
            empty_class: {
                text: "空教室",
                img: "room"
            },
            water_card: {
                text: "水卡",
                img: "water"
            },
            evaluation: {
                text: "评教",
                img: "pingjiao"
            },
            // cet: {
            //     text: "四六级",
            //     img: "cet"
            // }
        };

        // 生成渲染数据
        let data = [];
        for (let key in functionList) {
            data.push({
                text: functionList[key].text,
                imgDark: `../../image/information/MiniDLPU-ICON-C-D_${functionList[key].img}.svg`,
                imgLight: `../../image/information/MiniDLPU-ICON-C_${functionList[key].img}.svg`,
                id: key
            })
        }

        this.setData({array: data});
    }

})
