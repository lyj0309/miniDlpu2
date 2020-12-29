// pages/Information/Information.js
import * as echarts from '../../ec-canvas/echarts';

let chartLine;

Page({

    /**
     * 页面的初始数据
     */
    data: {
        ecLine: {
            onInit: function (canvas, width, height) {
                //初始化echarts元素，绑定到全局变量，方便更改数据
                chartLine = echarts.init(canvas, null, {
                    width: width,
                    height: height
                });
                canvas.setChart(chartLine);

                //可以先不setOption，等数据加载好后赋值，
                //不过那样没setOption前，echats元素是一片空白，体验不好，所有我先set。
                chartLine.setOption({
                    //图例
                    legend: {
                        //图例垂直排列
                        orient: 'vertical',
                        x: 'left',
                        //data中的名字要与series-data中的列名对应，方可点击操控
                        data:['平时成绩（30%）','期中成绩（10%）','期末成绩（60%）']
                    },
                    series: [
                        {
                            name:'访问来源',
                            type:'pie',
                            //饼状图
                            // radius: ['50%', '70%'],
                            //标签
                            label: {
                                normal: {
                                    show: true,
                                    position: 'inside',
                                    formatter: function (params) {
                                        return params.data.score +'分'
                                    },
                                    //formatter: '{c}',//模板变量有 {a}、{b}、{c}、{d}，分别表示系列名，数据名，数据值，百分比。{d}数据会根据value值计算百分比
                                    textStyle : {fontSize : 15,}
                                },
                            },
                            data:[
                                {value:30, name:'平时成绩（30%）',score:60},
                                {value:60, name:'期中成绩（10%）',score:60},
                                {value:10, name:'期末成绩（60%）',score:60},
                            ]
                        }
                    ]
                });
            }
        },
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
        }, {
            text: '意见反馈',
            imgSrc: '../../image/feedback.png'
        }],
        value1: 0,

    },
    refreshEva(data) {
        this.popup = this.selectComponent("#com"); //组件的id
        this.popup.evaluation(undefined, data); //组件里里面定义的showPopup方法
    },

    onClose() {
        this.setData({show: false, title: ''});
    },
    propTap: function (prop) {
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
                console.log("点击了同意支付")
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
    }
})
