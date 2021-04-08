Component({
    properties: {},
    data: {
        p: {},
        text: "",
        ps: [
            ['#semester', '点这里切换学期，\n在”设置-缓存管理“中可管理学期。'],
            ['#week', '点这里可以切换周，\n查看不同周的课表。'],
            ['#weather', '点击天气图标会出现最近15天的天气。'],
            ['.block', "点击任意课程可查看详情。"],
            ['#blankBlock', "点击空白处可出现加号，再次点击可添加自定义课表，可覆盖导入课表。"],
            ['', "最后，感谢大家的支持，您的分享就是对我们的最大支持😘"]
        ],
        index: 0
    },
    methods: {
        last() {
            this.show(this.data.index - 1)
        },
        next() {
            this.show(this.data.index + 1)
        },
        show(i) {
            if (this.data.index === this.data.ps.length - 1) {
                this.setData({
                    p: {},
                    text: this.data.ps[i][1]
                })
            } else {
                this.page.select(this.data.ps[i][0]).then(r => {
                    this.setData({
                        p: r,
                        text: this.data.ps[i][1]
                    })
                    // console.log(this.data.p)
                })
            }
            this.setData({
                index: i
            })

        },
        complete() {
            this.page.setData({
                userGuide: false
            })
        }
    },
    lifetimes: {
        attached() {
            this.page = getCurrentPages()[0];
            // 每隔地方的坐标，width,height,top,left
            // 用户引导启动
            this.show(this.data.index)

            /*            this.setData({
                            text: this.data.texts[0],
                            p: this.p[0]
                        })*/

        },
    },
});
