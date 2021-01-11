import Notify from "../../miniprogram_npm/@vant/weapp/notify/notify";
const API = require("../../script/API");

Page({

    /**
     * 页面的初始数据
     */
    data: {
        title: '',
        show: false,
        array: [{
            text: '成绩查询',
            imgSrc: '../../image/search.png'
        }, {
            imgSrc: '../../image/ksrc.png',
            text: '考试日程'
        }, {
            text: '校历',
            imgSrc: '../../image/date.png'
        }, {
            text: '培养方案',
            imgSrc: '../../image/edu.png'
        }, {
            text: '空教室',
            imgSrc: '../../image/room2.png'
        }, {
            text: '水卡',
            imgSrc: '../../image/qr_code.png'
        }, {
            text: '评教',
            imgSrc: '../../image/pingjiao.png'
        }/*, {
            text: '统一支付',
            imgSrc: '../../image/pay.png'
        }*/
        ],
        container: null,
        minShow: false,
        empClaShow0:false
    },
    empClaConfirm0(event) { //空教室确认
        const {picker, value, index} = event.detail
        //console.log(value)
        this.setData({empClaShow0: false, })
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
        this.setData({empClaShow1: false,epClaTimeList:this.data.epClaTimeList})
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

    closeMinModel(){
        this.setData({minShow: false});
    },
    onClose() {
        this.setData({show: false, title: ''});
    },
    propTap: function (prop) {
        API.getUserData(selector=>{
            wx.showLoading({title: '加载中···'})
            //console.log(prop.currentTarget.id)
            switch (prop.currentTarget.id) {
                case '2':
                    wx.previewImage({
                        current: 'https://s3.ax1x.com/2020/12/05/DON5qJ.jpg',
                        urls: ['https://s3.ax1x.com/2020/12/05/DON5qJ.jpg', 'https://s3.ax1x.com/2020/12/05/DON4r4.jpg']
                    })
                    wx.hideLoading()
                    break
                case '7':
                    wx.navigateTo({
                        url: './unifyPay/index'
                    })
                    wx.hideLoading()
                    break
                case '8': //意见反馈

                    wx.hideLoading()
                    break
                default:
                    this.setData({show: true, title: this.data.array[parseInt(prop.currentTarget.id)].text});
                    break
            }
            this.infoCom = this.selectComponent("#com");
        })
    },
    onLoad(query) {
       if ( wx.getSystemInfoSync().theme!== 'light'){
           this.setData({
               overlayStyle:"background-color: rgba(255,255,255,0.7)"
           })
       }
    }
})
