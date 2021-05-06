const API = {};
const KCB = require("KCB");
const LOG = require('log')
const baseHost = "https://jwc.nogg.cn"

/**
 * @function parseTime
 * @description 时间解析
 * @returns time(String)
 */
API.parseTime = function (lGST) {
    return lGST ?
        lGST.getFullYear() + "-" +
        (lGST.getMonth() + 1) + "-" +
        lGST.getDate() + " " +
        lGST.getHours() + ":" +
        lGST.getMinutes() + ":" +
        lGST.getSeconds()
        : "暂无数据";
}

/**
 * @function json
 * @param d(Obj|String)
 * @description 如果传入字符串则尝试解析json
 * @description 传入对象则转换为json字符串
 * */
API.json = function (d) {

    // 如果是空值 直接返回
    if (!d) return false;

    // 类型判断
    if (typeof d !== "string")
        return JSON.stringify(d);

    // 尝试转换
    let data;
    try {
        data = JSON.parse(d);
    } catch (e) {
        return false
    }
    return data;
};

/**
 * @function set
 * @description 封装微信setStorageSync
 * @param key 存储使用的键
 * @param data 存储的值
 * @returns error 错误对象
 */
API.set = function (key, data) {

    // 处理单个存储请求
    if (key.constructor === String)
        return wx.setStorage({
            key: key,
            data: data
        });

    // 处理多个存储请求
    if (
        key.constructor === Array &&
        data.constructor === Array
    )
        for (let i = 0; i < key.length; i++) {
            wx.setStorage({
                key: key[i],
                data: data[i]
            })
        }
};

/**
 * @function get
 * @description 封装微信getStorageSync
 * @param key 获取存储键
 * @returns error 错误对象
 */
API.get = function (key) {

    // 处理单次获取请求
    if (key.constructor === String)
        return wx.getStorageSync(key);

    // 处理多个获取请求
    let res = [];
    if (key.constructor === Array)
        for (let i = 0; i < key.length; i++)
            res.push(wx.getStorageSync(key[i]));
    return res;
};

/**
 * @function setObjData
 * @description 覆盖全集数据
 * @param obj 要设置的对象
 * @param key 键值
 * @param data 值
 */
API.setObjData = function (obj, key, data) {

    // 处理单个存储请求
    if (key.constructor === String)
        return obj[key] = data;

    // 处理多个存储请求
    if (
        key.constructor === Array &&
        data.constructor === Array
    )
        for (let i = 0; i < key.length; i++) {
            obj[key[i]] = data[i]
        }
};

/**
 * @function testData
 * @description 存在性校验数据
 * @param obj 需要校验的对象
 * @param key 需要检验的键值
 * @param time 最后一位时间校验
 */
API.testData = function (obj, key, time) {

    let res = true;
    key = key.constructor === Array ? [].concat(key) : [key];

    // 检测时间合法性
    if (time) res = ((new Date() - obj[key.pop()]) < time);

    // 存在性校验
    for (let i = 0; i < key.length; i++)
        if (!obj[key[i]]) return false;

    return res;
};

/**
 * @function runCallBack
 * @description 运行回调函数
 * @param api
 * @param call
 */
API.runCallBack = function (api, call, d, code, data) {

    let rd = (call && call.constructor === Function) ? () => {
        call(d, code, data);
    } : () => {
    };

    if (api && api.constructor === Function)
        api(d, code, data, rd);
    else rd();
}

/**
 * @function setDefaultVal
 * @description 设置默认值
 * @param def 默认值
 * @param val 覆盖值
 */
API.setDefaultVal = function (def, val) {
    return val ? val : def;
};

/**
 * @function testMessage
 * @description 校验合法消息数据
 */
API.testMessage = function (d) {
    return (d &&
        d.constructor === String &&
        d != 'none')
};

/**
 * @function request
 * @description 调用API
 * @param api(API) 访问哪个接口
 * @param data(Object) 数据
 * @param callback(Oject) 回调函数
 * @returns 这个是异步函数没有返回
 */
API.request = function (api, callback, data, cookie) {

    // 判断请求时间
    // 限制请求频率

    // 收集发送数据
    let requestData = {
        url: api.url,
        method: api.method,
        dataType: "json",
        header: {
            "content-type": "application/json"
        },
        contentType: api.contentType,
        data: data,

        // 自定义默认数据
        loading: '正在玩命加载',
        successMsg: 'none',
        failMsg: 'none',
        networkMsg: '服务器开小差了'
    };

    // 设置cookie
    if (cookie) requestData.header.cookie = cookie;

    // 是否显示加载信息
    requestData.loading = API.setDefaultVal(api.loading, callback.loading);

    // 是否显示成功信息
    requestData.successMsg = API.setDefaultVal(api.successMsg, callback.successMsg);

    // 是否显示失败信息
    requestData.failMsg = API.setDefaultVal(api.failMsg, callback.failMsg);

    // 是否显示网络错误信息
    requestData.networkMsg = API.setDefaultVal(api.networkMsg, callback.networkMsg);
    if (!requestData.networkMsg) requestData.networkMsg = '服务器开小差了';

    // 显示加载提示
    if (API.testMessage(requestData.loading)) wx.showLoading({
        title: requestData.loading,
    });

    // 数据正确
    requestData.ok = (d) => {
        API.runCallBack(api.ok, callback.ok, d, 1, data);
    };

    // 数据错误
    requestData.no = (code, d) => {

        API.runCallBack(api.no, callback.no, code, d, data);
    };

    // 成功！
    requestData.success = (d) => {
        API.runCallBack(api.success, callback.success, d);
        if (d.statusCode === 502) {
            wx.showToast({
                icon: 'none',
                title: "服务器故障，请稍后再试"
            })
            return;
        }

        // 收集错误代码
        let code = 0;
        if (d.data) code = d.data.code;
        let data = d.data ? (d.data.data ? d.data.data : d.data) : undefined;

        // 成功
        if (code === 1) {
            if (requestData.url !== API.GET_STATIC_DATA.url) {
                // 更新时间
                let date = new Date();

                // 存储到缓存
                API.set(
                    "lastGetSessionTime", date
                )

                // 更新到全局数据
                API.setObjData(
                    getApp().globalData.UserData,
                    "time", date
                );
            }

            requestData.ok(data);

            // 显示成功消息
            if (API.testMessage(requestData.successMsg)) wx.showToast({
                icon: 'success',
                title: requestData.successMsg
            })
            return
        }
        if (code === 2) { //session 过期
            API.reLogin(r => {
                wx.hideLoading()
                if (r === false) {
                    return
                }
                requestData.header.cookie = `session=` + r.session
                wx.request(requestData)
            }, getApp())
            return;
        }


        requestData.no(code, data);
        let message = "";
        // 显示失败消息
        if (
            requestData.failMsg &&
            (requestData.failMsg.constructor === Array ||
                requestData.failMsg.constructor === Object) &&
            API.testMessage(requestData.failMsg[code])
        ) message = requestData.failMsg[code];

        else if (API.testMessage(requestData.failMsg))
            message = requestData.failMsg;


        // api关键字为后端返回错误代码
        if (message === 'api') message = d.data.err_msg ? d.data.err_msg : ('未知错误，代码:' + d.data.code);

        // 显示错误提示
        if (message) wx.showModal({
            title: message,
            confirmText: '确定',
            showCancel: false,
        })
    };

    // 失败
    requestData.fail = (d) => {
        API.runCallBack(api.fail, callback.fail, d);

        // 失败回调
        requestData.no(d.statusCode, d.data);

        if (API.testMessage(requestData.networkMsg)) wx.showToast({
            icon: 'none',
            title: requestData.networkMsg
        });
    };

    // 完成
    requestData.complete = (d) => {
        API.runCallBack(api.complete, callback.complete, d);
        // 关闭加载提示
        if (API.testMessage(requestData.loading)) wx.hideLoading();
    };

    // 请求开始
    wx.request(requestData);
};

/**
 * @static GET_JS_SESSION
 * @description JsSession授权接口
 */

API.GET_JS_SESSION = {
    url: baseHost + '/login',
    method: 'POST',
    contentType: 'application/json',

    // 成功后将数据保存到本地
    ok: (d, code, r, rd) => {

        // 更新时间
        let date = new Date();

        // 存储到缓存
        API.set(
            ["ip", "name", "session", "lastGetSessionTime", "user", "pwd", "idCard"],
            [d.ip, d.name, d.session, date, r.id, r.pwd, d.idCard]
        )

        // 更新到全局数据
        API.setObjData(
            getApp().globalData.UserData,
            ["ip", "name", "session", "user", "pwd", "time", "idCard"],
            [d.ip, d.name, d.session, r.id, r.pwd, date, d.idCard]
        );

        rd();
    }
};

/**
 * @static GET_STATIC_DATA
 * @description 获取静态数据接口
 */
API.GET_STATIC_DATA = {
    url: baseHost + '/static',
    method: 'GET',


    // 成功后存储数据
    ok: (d, a, b, rd) => {
        // 更新时间
        let date = new Date();
        // let date = new Date('1995-12-17T03:24:00');

        //console.log("传入学期",d.semester)
        let semester = API.geneSemesterArr(d.semester)[1]
        //console.log("静态数据semester",semester)
        // 存储到缓存
        API.set(
            ["semester", "weekNow", "lastGetStaticDataTime", "weather"],
            [semester, d.week_now, date, d.weather]
        );

        // 更新到全局数据
        API.setObjData(
            getApp().globalData.StaticData,
            ["semester", "weekNow", "time", "weather"],
            [semester, d.week_now, date, d.weather]
        );

        rd();
    }
}

/**
 * @static GET_TIME_TABLE
 * @description 获取课程表接口
 */
API.GET_TIME_TABLE = {
    url: baseHost + '/course_timetable',
    method: 'GET',
    loading: "正在抓取课表",

    // 成功后存储数据
    ok: (d, code, r, rd) => {
        // 如果没有数据
        // if(d.data === null && d.code === 1) return;

        if (!r.semester) return;

        API.calcKCB(r.semester + (r.age === undefined ? "" : r.age), d, () => {
            rd();
        }, API.getSetting());
    }
}

//上课提醒
API.ADD_TIME_TABLE_REMIND = {
    url: baseHost + '/course_timetable_remind',
    method: 'POST',

}
API.DELETE_TIME_TABLE_REMIND = {
    url: baseHost + '/course_timetable_remind',
    method: 'DELETE',

}

API.GET_EXAM_DATE = {
    url: baseHost + '/exam_date',
    method: 'GET',

}

API.GET_EXAM_SCORE = {
    url: baseHost + '/exam_score',
    method: 'GET',

}
// 培养方案
API.GET_CULTIVATE_SCHEME = {
    url: baseHost + '/cultivate_scheme',
    method: 'GET',

}
// 培养方案列表
API.GET_CULTIVATE_SCHEME_LIST = {
    url: baseHost + '/cultivate_scheme_list',
    method: 'GET',
}

API.GET_EMPTY_CLASS = {
    url: baseHost + '/empty_class',
    method: 'GET',
}
API.EVALUATION_LIST = {
    url: baseHost + '/evaluation',
    method: 'GET',
}

API.EVALUATION_DETAIL = {
    url: baseHost + '/evaluation_detail',
    method: 'GET',
}


API.EVALUATION_POST = {
    url: baseHost + '/evaluation_post',
    method: 'GET',
}
//四级
API.CET = {
    url: baseHost + '/cet',
    method: 'GET',
}

API.FAQ = {
    url: baseHost + '/assets/FAQ.json',
    method: 'GET',

}
API.ABOUTUS = {
    url: baseHost + '/assets/aboutUs',
    method: 'GET',
}

API.LOGIN_WATERCARD = {
    url: 'https://www.wuweixuezi.com/app/index.php',
    method: 'GET',
}
API.GET_WATERCARD_IMG = {
    url: 'https://www.wuweixuezi.com/app/index.php',
    method: 'GET',

}
API.GET_WATERCARD_INFO = {
    url: 'https://www.wuweixuezi.com/app/index.php',
    method: 'GET',
}


/**
 * @function calcKCB
 * @param semester 学期
 * @param d 原始数据
 * @param then 下一步要做的事情
 * @param o 设置
 * @param o.colorList: 新的颜色列表
 * @param o.otherClass: 其他课表解析
 * @param o.userClass: 开启渲染用户自定义课表
 * @param o.userIndex: 用户定义课表优先级
 */
API.calcKCB = function (semester, d, then, o = {}) {

    // 转为异步函数调用
    // 涉及到复杂的运算
    setTimeout(() => {

        // 获取数据
        let data = API.get(semester) || {};

        // 复制数据
        data.data = d.constructor === Array ? d : data.data;
        d = data.data;

        // 继承颜色列表
        let colorList = !o.colorList ? data.color ? data.color : [] : [];

        // 解析为课程列表
        let cList = KCB.KCB2PerClass(d);
        data.cList = cList;

        let pauseKCB = KCB.parseKCB(d, colorList);
        data.kcb = pauseKCB[0];
        data.color = pauseKCB[1];

        // 逐周采样
        data.pre = [];
        data.img = [];

        // 记录课程门数
        data.typeNum = cList.length;

        // 统计学期一共多少节课
        let classNum = 0;

        // 读取自定义
        data.user = data.user ? data.user : [];
        let userKCB = data.user;

        // 解析课程表
        for (let i = 0; i < o.weekNum; i++) {
            let pw = KCB.KCB2PerWeek(data.kcb, i, o.otherClass);

            // 课表注入
            if (o.userClass) KCB.userKCB2PerWeek(userKCB, pw[0], pw[1], i, o.otherClass, o.userIndex);

            data.pre[i] = pw[0];
            data.img[i] = KCB.imageCss(pw[1]);
            classNum += pw[2];

        }

        // 记录课表爬取时间
        data.time = new Date();

        // 记录课程数量
        data.classNum = classNum;

        // 记录占用缓存大小
        data.size = 10000;
        data.size = JSON.stringify(data).length;
        //console.log(data,d)

        // 存储到缓存
        API.set(semester, data);

        // 获取课程列表
        let termList = API.getTermList();
        let iv = false;
        for (let i = 0; i < termList.List.length; i++)
            if (termList.List[i] == semester) iv = true;

        // 如果不存在新建
        if (!iv) {
            termList.List.push(semester);

            // 排序
            termList.List.sort((a, b) => {
                let ar = a.split("-");
                let br = b.split("-");
                return (br[0] - ar[0]) + (br[1] - ar[1]) + (br[2] - ar[2])
            });

            API.set("TermList", termList.List);
        }

        // 更新到全局数据
        let app = getApp();
        app.globalData.TermData[semester] = data;
        app.globalData.TermList.List = termList.List;

        // 返回值
        then();
    }, 0);
};

/**
 * @function getSetting
 * @description 获取设置
 */
API.getSetting = function () {

    // 获取当前时间 全局对象
    let App = getApp();

    // 校验全局数据是否合法
    if (App.globalData.setting)
        return App.globalData.setting;

    // 从缓存获取数据 覆盖到全局数据
    App.globalData.setting = API.get("Setting");

    // 再次校验
    if (App.globalData.setting)
        return App.globalData.setting;

    // 初始化
    let set = {
        otherClass: true,
        userClass: true,
        userIndex: true,
        weekNum: 20,
    };

    // 从缓存获取数据 覆盖到全局数据
    API.set("Setting", set);
    App.globalData.setting = set;

    return App.globalData.setting;
}

/**
 * @static STATIC_DATA_INVALID
 * @description 静态数据失效时间（毫秒）
 */
API.STATIC_DATA_INVALID = 10 * 60 * 1000;

/**
 * @static JS_SESSION_INVALID
 * @description session失效时间（毫秒）
 *  15小时
 */
API.JS_SESSION_INVALID = 15 * 60 * 60 * 1000;

/**
 * @function getStaticData
 * @description 对API的第二次封装
 * @param then 下一步做什么
 * 注意： 这个函数是异步函数，但是会返回失效的数据值！！！
 * 注意：传递给then函数是全局指针，不要修改数据！！！（非常重要！！）
 */
API.getStaticData = function (then) {

    // 获取当前时间 全局对象
    let App = getApp();

    // 校验数据合法性
    let globalDataKey = ["semester", "weekNow", "time"];

    // 校验全局数据是否合法
    if (API.testData(App.globalData.StaticData, globalDataKey, API.STATIC_DATA_INVALID))
        return then(App.globalData.StaticData);

    // 从缓存获取数据 覆盖到全局数据
    API.setObjData(
        App.globalData.StaticData,
        globalDataKey,
        API.get(["semester", "weekNow", "lastGetStaticDataTime"])
    );

    // 再次校验全局数据是否合法
    if (API.testData(App.globalData.StaticData, globalDataKey, API.STATIC_DATA_INVALID))
        return then(App.globalData.StaticData);

    // 到这里如果函数还未返回
    // 发送网络请求
    API.request(
        API.GET_STATIC_DATA,
        {
            loading: 'none',
            successMsg: 'none',
            failMsg: 'api',

            // 成功后返回数据
            ok: (d) => {
                console.log(`数据过期`)
                then(App.globalData.StaticData);
            }
        });

    // 如果只是时间到期了 先返回假数据
    if (API.testData(App.globalData.StaticData, globalDataKey))
        return then(App.globalData.StaticData);

    // 返回一份假数据
    // 到这里如果还没有，手动选择当前学期
    if (!App.globalData.StaticData.semester) {
        let date = new Date();
        let month = date.getMonth() / 1 + 1;
        let year = date.getFullYear() / 1;

        let str = '';
        // 判断当前学期
        if (month < 3) {
            year--;
            str = year + '-' + (year + 1) + '-1';
        } else if (month > 7) {
            str = year + '-' + (year + 1) + '-1';
        } else {
            year--;
            str = year + '-' + (year + 1) + '-2';
        }
        App.globalData.StaticData.semester = str;
    }

    return App.globalData.StaticData;
}

/**
 * @function getUserData
 * @description 对API的第二次封装
 * @param then 下一步做什么
 * @param Tips 如果JsSession签发出现问题，是否提示用户
 * 注意： 这个函数是异步函数，不会返回数据值！！！
 * 注意：传递给then函数是全局指针，不要修改数据！！！（非常重要！！）
 */
API.getUserData = function (then, Tips = true) {
    const startTime = new Date().getTime();


    // 获取当前时间 全局对象
    let App = getApp();

    // 校验数据合法性
    let globalDataKey = ["ip", "name", "session", "user", "pwd", "time"];

    // 校验全局数据是否合法
    if (API.testData(App.globalData.UserData, globalDataKey, API.JS_SESSION_INVALID))
        return then(App.globalData.UserData);

    // 从缓存获取数据 覆盖到全局数据
    API.setObjData(
        App.globalData.UserData,
        globalDataKey,
        API.get(["ip", "name", "session", "user", "pwd", "lastGetSessionTime"])
    );

    // 再次校验全局数据是否合法
    if (API.testData(App.globalData.UserData, globalDataKey, API.JS_SESSION_INVALID))
        return then(App.globalData.UserData);

    // 到这里如果函数还未返回
    // 在发送网络请求之前，检查用户是否验证账号密码
    // 如果用户没有正确填写 在这里引导用户
    if (!API.testData(App.globalData.UserData, ["user", "pwd"])) {
        if (Tips && (!App.globalData.Pooping.UserId)) {
            App.globalData.Pooping.UserId = true;
            wx.hideLoading()
            wx.showModal({
                title: '账号信息',
                confirmText: '去设置',
                cancelText: '稍等',
                content: '请先设置账号信息，才能正常获取数据！',
                success: (res) => {
                    App.globalData.Pooping.UserId = false;
                    if (res.confirm) wx.navigateTo({url: '/pages/Subpages/StudentId/StudentId'});
                }
            });
        }
        return;
    }

    API.reLogin(e => {
        const t = new Date().getTime() - startTime
        wx.reportPerformance(1001, t)
        then(e)
    }, App)
    return "r";
}


API.reLogin = function (then, App, Tips = true) {
    // 发送网络请求
    API.request(
        API.GET_JS_SESSION,
        {
            loading: 'none',
            successMsg: 'none',
            failMsg: 'none',

            // 成功后返回数据
            ok: (d) => {
                then(App.globalData.UserData);
            },

            no: (d) => {
                if (Tips) wx.showModal({
                    title: '账号错误',
                    confirmText: '去设置',
                    cancelText: '稍等',
                    content: '您的账号信息错误，请修改正确，才能正常获取数据！',
                    success: (res) => {
                        if (res.confirm) wx.navigateTo({url: '/pages/Subpages/StudentId/StudentId'});
                    }
                });
                then(false)
            }
        }, {
            id: App.globalData.UserData.user,
            pwd: App.globalData.UserData.pwd,
            code: ""
        }
    )
}

/**
 * @function getTermList
 * @description 获取学期列表
 * @returns list {NowList(String), List(Array)}
 * 注意：这个方法是同步方法
 */
API.getTermList = function () {

    // 获取当前时间 全局对象
    let App = getApp();

    // 校验数据合法性
    let globalDataKey = ["select", "week", "List"];

    // 校验全局数据是否合法
    if (API.testData(App.globalData.TermList, globalDataKey))
        return App.globalData.TermList;

    // 从缓存获取数据 覆盖到全局数据
    API.setObjData(
        App.globalData.TermList,
        globalDataKey,
        API.get(["userSelectTerm", "userSelectWeek", "TermList"])
    );

    // 再次校验
    if (API.testData(App.globalData.TermList, globalDataKey))
        return App.globalData.TermList;

    // 初始化
    if (!App.globalData.TermList.select) App.globalData.TermList.select = "default";
    if (!App.globalData.TermList.week) App.globalData.TermList.week = "default";
    if (!App.globalData.TermList.List) App.globalData.TermList.List = [];

    // 从缓存获取数据 覆盖到全局数据
    API.set(
        ["userSelectTerm", "userSelectWeek", "TermList"],
        [App.globalData.TermList.select, App.globalData.TermList.week, App.globalData.TermList.List]
    );

    return App.globalData.TermList;
};

/**
 * @function getTimeTable
 * @description 获取学期课表
 */
API.getTimeTable = function (then, semester, session) {

    // 全局对象 学期列表
    let App = getApp();
    let termList = API.getTermList();
    let timeTable = API.get(semester);

    //console.log("获取学期课表",termList,"2",timeTable)
    // 先看看学期列表有没有
    let iv = false;
    for (let i = 0; i < termList.List.length; i++)
        if (termList.List[i] == semester) iv = true;

    // 如果有 校验数据存在性质
    if (iv && App.globalData.TermData[semester]) return then(timeTable);

    // 缓存覆盖
    if (iv) App.globalData.TermData[semester] = API.get(semester);

    // 再次校验
    if (iv && App.globalData.TermData[semester]) return then(timeTable);

    // 如果还没有返回 从服务器请求
    if (session) return API.request(
        API.GET_TIME_TABLE,
        {
            ok: () => then(App.globalData.TermData[semester])
        }, {
            age: semester.slice(11, semester.length),
            semester: semester.slice(0, 11)
        },
        "session=" + session
    );

    return "none";
}

API.geneSemesterArr = function (semester) {
    let rage = []
    let xueQi = [['大一上', '大一下'], ['大二上', '大二下'], ['大三上', '大三下'], ['大四上', '大四下'], ['大五上', '大五下'], ['大六上', '大六下'], ['大七上', '大七下']]
    let user = API.get("user")
    if (user === '' || user === undefined) {
        return [[], semester]
    }
    if (semester === undefined) {
        semester = API.get("semester").slice(0, 11)
    }
    //console.log("user",user,semester)
    user = '20' + user.slice(0, 2)
    let nowYear = new Date().getFullYear()
    for (let i = 8; i >= -1; i--) {
        for (let k = 1; k <= 2; k++) {
            let currXQ = (nowYear - (i + 1)) + "-" + (nowYear - i) + "-" + k
            let idx = nowYear - (i + 1) - user
            if (semester === currXQ) {
                let a = currXQ + '  ' + xueQi[idx][k - 1]
                rage.unshift({name: a})
                rage.unshift({name: '全部学期'})
                return [rage, a]
            }
            if (idx >= 0 && idx <= 3) {
                rage.unshift({name: currXQ + '  ' + xueQi[idx][k - 1]})
            }
        }
    }
}


API.reCatchTable = function (id, del) {
    return new Promise(function (resolve, reject) {
        API.getUserData((d) => {
            // 获取课表
            API.request(
                API.GET_TIME_TABLE,
                {
                    loading: "正在抓取",
                    successMsg: "抓取成功",
                    failMsg: "api",
                    ok: (d) => {
                        resolve(true)
                        // console.log(d);
                    }
                }, {
                    semester: id.slice(0, 11),
                    age: id.slice(11, id.length)
                },
                "session=" + d.session
            );
        });
    })
}

API.delTable = function (id) {
    let app = getApp();
    app.globalData.TermData[id] = undefined;
    wx.removeStorageSync(id);

    let tlist = API.getTermList().List.filter((v) => {
        if (v == id) return false;
        else return true;
    });

    app.globalData.TermList.List = tlist;
    API.set("TermList", tlist);
}

module.exports = API;