// pages/Account_Subpages/StudentId/StudentId.js

const app = getApp();
const API = require("../../../script/API");

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    user: "",
    pwd: "",
    showPassWord: true,
    userError: false,
    pwdError: false,
    showResetPwd: false,
    resetId: "",
    resetIdCard: "",
  },

  userData: {
    user: "",
    pwd: "",
  },

  /**
   * @function onShowPassWord
   * @description 显示和隐藏密码
   * @param e 事件
   */
  onShowPassWord: function (e) {
    this.setData({ showPassWord: !this.data.showPassWord });
  },

  /**
   * @function onInput
   * @description 用户输入事件
   * @param e 事件
   */
  onInput: function (e) {
    let doing = e.currentTarget.dataset.do;
    let data = e.detail.value;
    if (doing === "1") this.userData.user = data;
    else if (doing === "2") this.userData.pwd = data;
  },

  /**
   * @function inputError
   * @description 表单出错动画
   * @param id(1|2|3) 1代表用户名2代表密码3代表同时
   */
  inputError: function (id, msg) {
    // 判断类型
    let input =
      id === 1
        ? ["userError"]
        : id === 2
        ? ["pwdError"]
        : id === 3
        ? ["userError", "pwdError"]
        : [];

    // 计算setData数据
    let con = {};
    input.map((v) => {
      con[v] = false;
    });

    // 微信提示
    if (msg)
      wx.showToast({
        icon: "none",
        title: msg,
      });

    // 应用
    this.setData(con);
    this.setData({ loading: false });
    setTimeout(() => {
      input.map((v) => (con[v] = true));
      this.setData(con);
    }, 0);
  },

  /**
   * @function submit
   * @description 提交验证
   */
  submit: function () {
    if (this.data.loading === true) return;
    this.setData({ loading: true });
    // 表单校验 这里只检验空
    let error = 0;
    if (!this.userData.user) error = 1;
    if (!this.userData.pwd && !error) error = 2;
    if (!this.userData.pwd && error === 1) error = 3;
    console.log(`提交了`, error);
    // 要说的话
    if (error) {
      let message = [, "学号", "密码", "学号与密码"];
      this.inputError(error, "请填好" + message[error] + "!");
      return;
    }

    wx.login({
      success: (res) => {
        if (res.code) {
          // 发起登录请求
          API.request(
            API.GET_JS_SESSION,
            {
              loading: "正在验证",
              successMsg: "验证成功!",
              failMsg: "api",

              // 成功后保存数据
              ok: (d, code, r) => {
                // 传递到视图层
                this.setStorageData(1);
              },

              // 失败后提示错误
              no: (d) => {
                this.inputError(3);
              },
            },
            { id: this.userData.user, pwd: this.userData.pwd, code: res.code }
          );
        } else {
          console.log("登录失败！" + res.errMsg);
        }
      },
    });
  },

  /**
   * @function setStorageData
   * @description 设置缓存数据
   */
  setStorageData: function (k) {
    let user = API.get("user");
    let pwd = API.get("pwd");
    let lGST = API.get("lastGetSessionTime");
    let time = API.parseTime(lGST);

    this.userData.user = user;
    this.userData.pwd = pwd;
    //更新学期
    if (k === 1) {
      API.request(API.GET_STATIC_DATA, {
        ok: (r) => {
          API.getUserData((d) => {
            // 获取课表
            const sem = API.geneSemesterArr()[1];
            API.request(
              API.GET_TIME_TABLE,
              {
                ok: (d) => {
                  wx.reLaunch({
                    url: "/pages/Timetable/Timetable?userGuide=true",
                  });
                },
              },
              {
                semester: sem.slice(0, 11),
                age: sem.slice(11, sem.length),
              },
              "session=" + d.session
            );
          });
        },
      });
    }

    this.setData({
      loading: false,
      user: user,
      pwd: pwd,
      time: time,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (wx.getSystemInfoSync().theme !== "light") {
      this.setData({
        bgc: ` background-color: #666666 ;`,
      });
    }

    this.setStorageData();

    if (options.user !== undefined) {
      this.userData.user = options.user;
      this.userData.pwd = options.pwd;
      this.setData({ user: options.user, pwd: options.pwd });
    }
  },

  onClose() {
    this.setData({
      showResetPwd: false,
    });
  },
  openResetPwd(e) {
    this.setData({
      showResetPwd: true,
    });
  },
  ResetPwd() {
    // 发起登录请求
    API.request(
      API.RESET_PWD,
      {
        loading: "正在验证",
        successMsg: "验证成功!",
        failMsg: "api",

        // 成功后保存数据
        ok: (d, code, r) => {
          // 传递到视图层
          this.setStorageData(1);
        },

        // 失败后提示错误
        no: (d) => {
          this.inputError(3);
        },
      },
      { id: this.userData.user, pwd: this.userData.pwd, code: res.code }
    );
  },
});
