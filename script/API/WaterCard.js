import API from "./API";

export default class WaterCard extends API {
    limit = 2
    forceDomain='app.gzblackcloud.com'
    showSucc = false
    params = [
        {
            name: "i",
            default: "2"
        },
        {
            name: "j",
            default: "3"
        },
        {
            name: "c",
            default: "entry"
        },
        {
            name: "m",
            default: "water"
        },
        {
            name: "do",
            default: "appapi"
        },
    ]
    failMsg = "错误,{{ errmsg }},代码{{ errcode }}";


    parseResData = function (d) {

        // 处理成功情况
        if (d.errcode/1 === 0) {
            this.succ = true;
            this.errCode = 1;
            return  d.errmsg;
        }

        // 处理失败情况
        else {
            this.succ = false;
            this.errCode = d.errcode;
            return  d;
        }
    }
}


WaterCard.Login = class Login extends WaterCard {
    url = '/app/index.php'
    params = [
        {
            name: "op",
            default: "user.login"
        },
        {
            name: "realname",
        },
        {
            name: "studentID",
        },
        {
            name: "password",
        },
        {
            name: "time",
            default: "1607400092"
        },
        {
            name: "sign",
            default: "dffddefeb30cc01984f00ee8038e0793"
        },
        {
            name: "style",
            default: "2"
        },
        {
            name: "schoolID",
            default: "7"
        },

    ]
}

WaterCard.Img = class Img extends WaterCard {
    url = '/app/index.php'
    params = [
        {
            name: "op",
            default: "user.getPrcode"
        },
        {
            name: "time",
            default: "1607400092"
        },
        {
            name: "sign",
            default: "dffddefeb30cc01984f00ee8038e0793"
        },
        {
            name: "token",
        },
    ]


}

WaterCard.UserInfo = class UserInfo extends WaterCard {
    url = '/app/index.php'

    params = [
        {
            name: "op",
            default: "user.getIndex"
        },
        {
            name: "time",
            default: "1607424790"
        },
        {
            name: "sign",
            default: "243e317a29b4f8f180df5047ec39cd56"
        },
        {
            name: "token",
        },
    ]
}

