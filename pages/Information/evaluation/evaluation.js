import Notify from "../../../miniprogram_npm/@vant/weapp/notify/notify";

const API = require("../../../script/API");


Page({
    data: {
        value: '', //总体评价
    },
    onLoad: function (options) {
        wx.setNavigationBarTitle({title: '课程评教'})
        this.setData({callbackUrl: options.callbackUrl, loadState: false})
        console.log(options)
        wx.showLoading({title: '加载中'})
        API.getUserData((d) => {
            API.request(
                API.EVALUATION_DETAIL,
                {
                    success: (d) => {
                        console.log(d.data.data)
                        if (d.data.data.Options[d.data.data.Options.length - 1].name === '总体评价') {
                            this.setData({
                                sumEva: d.data.data.Options[d.data.data.Options.length - 1].data[0]
                            })
                            d.data.data.Options.pop()
                            this.setData({
                                radio: new Array(10)
                            })
                            this.setData(d.data.data)
                        }
                        wx.hideLoading()
                    }
                }, {
                    query: options.query
                },
                "session=" + d.session
            )
        })
    },
    onChange(event) {
        let a = 'radio[' + event.currentTarget.id + ']'
        this.setData({
            [a]: event.detail,
        });
    },
    evaPost() {
        this.setData({
            loadState: true
        })

        let formStr = this.data.InputUP
        //query生成
        let isSame = true
        for (let i = 0; i < this.data.Options.length; i++) {
            if (this.data.radio[i] === undefined) {
                Notify({type: 'warning', message: '请选完全部选项'});
                return
            }
            if (i > 0 && this.data.radio[i] !== this.data.radio[i - 1]) {
                isSame = false
            }

            let str = this.data.Options[i].data[this.data.radio[i]][0]
            let idx = str.lastIndexOf('_')
            console.log(str.slice(0, idx), str.slice(idx + 1))
            formStr += str.slice(0, idx).replace('fz', 'id') + '=' + str.slice(idx + 1) + '&'
            for (let j = 0; j < this.data.Options[i].data.length; j++) {
                formStr += this.data.Options[i].data[j][0] + '=' + this.data.Options[i].data[j][1] + '&'
            }
        }

        if (isSame) {
            Notify({type: 'warning', message: '请不要全部选一样的'});
            this.setData({
                loadState: false
            })
            return
        }
        //这里增加那个评语表单，还没写完奥
        formStr += this.data.sumEva[0] + '=' + this.data.sumEva[1] + '&' + 'jynr='
        console.log(formStr)
        console.log(getCurrentPages())

        API.getUserData((d) => {
            API.request(
                API.EVALUATION_POST,
                {
                    success: (d) => {
                        console.log(d.data.data)
                        //console.log(d.data.data)
                        Notify({
                            background: '#77C182',
                            message: d.data.data,
                        })
                        wx.hideLoading()
                        setTimeout(() => {
                            let pages = getCurrentPages(); //当前页面
                            let beforePage = pages[pages.length - 2]; //前一页
                            wx.navigateBack({
                                success: () => {
                                    beforePage.refreshEva(decodeURIComponent(this.data.callbackUrl)); // 执行前一个页面的onLoad方法
                                }
                            });
                            // 这里就是处理的事件
                        }, 1500);

                    },
                }, {
                    query: encodeURIComponent(formStr),
                    sum: encodeURIComponent(this.data.value)
                },
                "session=" + d.session
            )
        })


    },
    setGood() {
        let temp = this.data.radio
        for (let i = 0; i < temp.length - 1; i++) {
            temp[i] = "1"
        }
        temp[temp.length - 2] = "2"
        this.setData({radio: temp})
    },
    setBad() {
        let temp = this.data.radio
        for (let i = 0; i < temp.length - 1; i++) {
            temp[i] = "5"
        }
        temp[temp.length - 2] = "4"
        this.setData({radio: temp})
    }
});