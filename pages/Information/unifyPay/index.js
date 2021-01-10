Page({
    data:{
      height:400
    },
    onLoad(query) {
        this.setData({
            srcs:[]
        })
    },
    scrollCanvas: function (e) {
        let canvasLen = e.detail.scrollLeft;
        this.setData({
            canvasLen: canvasLen
        })
    },

    onReady() {
        const query = wx.createSelectorQuery()
        query.select('#myCanvas')
            .fields({node: true, size: true})
            .exec((res) => {
                const dpr = wx.getSystemInfoSync().pixelRatio
                this.canvas = res[0].node
                let ctx = this.canvas.getContext('2d')
                this.canvas.width = res[0].width * dpr
                this.canvas.height = res[0].height * dpr
                ctx.scale(dpr, dpr)
                console.log("宽度：", res[0].width)
                console.log("高度；", res[0].height)
                //需要为字留40px
                let weather = wx.getStorageSync(`weather`)
                let highest = weather[15].high
                let lowest = weather[15].low
                weather.pop()
                this.setData({
                    weather: weather
                })
                console.log("天气", weather)
                let unitY = (res[0].height - 80) / (highest - lowest) //单位高度 (改这里变斜率)
                let unitX = res[0].width / 5
                console.log("单位：", unitY)
                let p = []
                for (let k = 0; k < 15; k++) p.push(new Object({x: 0.0, y1: 0.0, y2: 0.0}));
                for (let v = 0; v < 3; v++) {
                    for (let i = v * 5; i < v * 5 + 6; i++) {
                        if (i === 15) {
                            break
                        }
                        let high = weather[i].tem1
                        let low = weather[i].tem2

                        p[i].y1 = 35 + unitY * (highest - high) //改这里变间距
                        p[i].y2 = res[0].height - 35 - unitY * (low - lowest)
                        p[i].x = Math.round((unitX * ((2 * (i - 5 * v) + 1)) / 2))
                        Math.round((unitX * -1 / 2))
                        let draw = function (y, yl, k) {
                            if ((i === 5 && v === 1) || (i === 10 && v === 2)) {
                                ctx.lineWidth = 2
                                ctx.strokeStyle = "#D2D2D2";
                                ctx.beginPath();
                                //计算三角函数
                                let long = Math.sqrt(unitX * unitX + (y - yl) * (y - yl))  //计算长边
                                ctx.moveTo((Math.round((unitX * -1 / 2))) + 5.1 * (unitX / long), yl + 5.1 * ((y - yl) / long));
                                ctx.lineTo(p[i].x - +5.1 * (unitX / long), y - +5.1 * ((y - yl) / long));
                                ctx.stroke();
                            } else if (i >= 1) { //画线
                                ctx.lineWidth = 2
                                ctx.strokeStyle = "#D2D2D2";
                                ctx.beginPath();
                                //计算三角函数
                                let long = Math.sqrt(unitX * unitX + (y - yl) * (y - yl))  //计算长边
                                ctx.moveTo(p[i - 1].x + 5.1 * (unitX / long), yl + 5.1 * ((y - yl) / long));
                                ctx.lineTo(p[i].x - +5.1 * (unitX / long), y - +5.1 * ((y - yl) / long));
                                ctx.stroke();
                            }
                            //画圆
                            ctx.lineWidth = 1
                            ctx.strokeStyle = "#B5B5B5";
                            ctx.beginPath();
                            ctx.arc(p[i].x, y, 4, 0, 2 * Math.PI);
                            ctx.arc(p[i].x, y, 3, 0, 2 * Math.PI);
                            ctx.stroke();

                            //写字
                            ctx.font = "18px Arial";
                            ctx.fillText((k === 0 ? high : low) + '°', p[i].x - 9, k === 0 ? y - 10 : y + 25);
                        }
                        draw(p[i].y1, p[i - 1] ? p[i - 1].y1 : 0, 0)
                        draw(p[i].y2, p[i - 1] ? p[i - 1].y2 : 0, 1)
                    }
                    wx.canvasToTempFilePath({
                        canvas: this.canvas,
                        success: res => {
                            console.log(res.tempFilePath)
                            this.setData({['srcs['+v+']']: res.tempFilePath})
                        },
                        fail: r => {
                            console.log(r)
                        }
                    })
                    ctx.clearRect(0, 0, 1000, 1000);
                    console.log(`画完一个`)
                }
                this.setData({height:0})
            })


    }
});