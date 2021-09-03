
Page({
    onLoad(query) {
        wx.showShareMenu({

            withShareTicket: true,

            menus: ['shareAppMessage', 'shareTimeline']

        })
        console.log(query)
        this.setData({name: query.name,url:decodeURIComponent(query.url)})
    },
    onShareTimeline(){}

});