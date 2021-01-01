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
        }, {
            text: '统一支付',
            imgSrc: '../../image/pay.png'
        }
        ],
        container: null,
    },
    refreshEva(data) {
        this.popup = this.selectComponent("#com"); //组件的id
        this.popup.evaluation(undefined, data); //组件里里面定义的方法
    },

    onClose() {
        this.setData({show: false, title: ''});
    },
    propTap: function (prop) {
        API.getUserData(selector=>{
            wx.showLoading({title: '加载中···'})
            console.log(prop.currentTarget.id)
            switch (prop.currentTarget.id) {
                case '2':
                    wx.previewImage({
                        current: 'https://s3.ax1x.com/2020/12/05/DON5qJ.jpg',
                        urls: ['https://s3.ax1x.com/2020/12/05/DON5qJ.jpg', 'https://s3.ax1x.com/2020/12/05/DON4r4.jpg']
                    })
                    wx.hideLoading()
                    break
                /*            case '6':
                                wx.navigateToMiniProgram({
                                    appId: 'wx3f924baa54174a84',
                                    path: 'pages/index/index',
                                    envVersion: 'release',
                                    success(res) {
                                        // 打开成功
                                    }
                                })
                                wx.hideLoading()
                                break*/
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
        })
    }
})
