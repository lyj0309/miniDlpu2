
Page({
    onLoad(query) {
        wx.showShareMenu({

            withShareTicket: true,

            menus: ['shareAppMessage', 'shareTimeline']

        })
        this.setData({name: query.name})
    },
    onShareTimeline(){}

});