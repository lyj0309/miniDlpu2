Page({
    onLoad(query) {
        if (query.findpwd === "1" ){
            this.setData({findpwd:true})
        }
    }
});