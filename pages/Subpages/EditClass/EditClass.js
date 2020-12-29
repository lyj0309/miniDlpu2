// pages/Subpages/EditClass/EditClass.js
const KCB = require("../../../script/KCB");
const API = require("../../../script/API");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: 1,

    // 周数
    weekList: [],
    weekText: "",

    // 星期列表
    dayList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    day: 0,

    // 周列表
    showWeekList: undefined,

    // 课节
    timeList: [],
    timeText: "",

    // 课节列表
    showTimeList: undefined,

    // 表单错误
    nameError: false,

    // 学期
    semester: ""
  },

  /**
   * @function weekList
   * @description 设置周选择列表
   */
  setWeekList: function(w, d){

    // 渲染
    this.setData({
      weekList: w.concat(new Array(6 - (w.length % 6 === 0 ? 6 : w.length % 6)).fill("b")),
      timeList: new Array(12).fill(0).map((v, i)=>(d[0] <= i) && (i <= d[1]))
    });
  },

  /**
   * @function showWeekList
   * @description 显示周选择列表
   */
  weekList: function(){
    this.data.showWeekList = !this.data.showWeekList;
    // console.log(this.data.showWeekList);
    this.setData({ showWeekList: this.data.showWeekList });
  },

    /**
   * @function showWeekList
   * @description 显示周选择列表
   */
  timeList: function(){
    this.data.showTimeList = !this.data.showTimeList;
    // console.log(this.data.showWeekList);
    this.setData({ showTimeList: this.data.showTimeList });
  },

  /**
   * @function click2AddWeek
   * @description 点击添加周事件
   * @param e 标准事件
   */
  click2AddWeek: function(e){
    let id = e.currentTarget.dataset.id;
    let allWeek = 0;
    this.classData.w.map((v)=>{if(v)allWeek++});
    if(this.classData.w[id] && allWeek === 1) return wx.showToast({
      title: '至少选择一周',
      icon: 'none'
    });
    this.classData.w[id] = this.classData.w[id] ? 0 : 1;
    this.setWeekList(this.classData.w,this.classData.m);
    this.setData({
      weekText: KCB.reverseWeek(this.classData.w)
    });
  },

  /**
   * @function click2AddTime
   * @description 点击添加时间段
   * @param e 标准事件
   */
  click2AddTime: function(e){
    let id = e.currentTarget.dataset.id;

    // 开始选择
    if(this.classData.m[0] == this.classData.m[1]){
      if(this.classData.m[0] > id) this.classData.m[0] = id;
      else if(this.classData.m[1] < id) this.classData.m[1] = id;
      else this.classData.m[1] = id;
    }

    // 重新开始选择
    else{
      this.classData.m[0] = id;
      this.classData.m[1] = id;
    }

    // 渲染数据
    this.setWeekList(this.classData.w,this.classData.m);
    this.setData({
      timeText: this.classData.m[0] == this.classData.m[1] ? 
      this.classData.m[0]/1 + 1 : (this.classData.m[0]/1 + 1) + "-" + (this.classData.m[1]/1 + 1)
    });

  },

  /**
   * @function dayChange
   * @description 用户选择周数
   * @param e 
   */
  dayChange: function(e){
    let id = e.detail.value/1
    this.classData.d = id;
    this.setData({
      day: id
    });
  },

  /**
   * @function onInput
   * @description 输入事件
   */
  onInput: function(e){
    let doing = e.currentTarget.dataset.id;
    let val = e.detail.value;
    this.classData[doing] = val;
  },

  /**
   * 生命周期函数--监听页面加载
   */
  classData: {
    n: "",
    t: "",
    l: "",
    w: [],
    d: 0,
    m: []
  },
  onLoad: function (options) {

    // 获取设置
    let setting = API.getSetting();

    // 编辑模式
    let classData = null;
    if(options.id){

       // 读取学期缓存
       let user = API.get(options.semester).user;

       // 在user中搜索   
       for(let i = 0; i < user.length; i++){
         if(user[i].i == options.id) classData = user[i];
       }
    }

    if(classData){
      this.classData = classData;
    }

    else{
      // 生成周列表
      this.classData.w = new Array(setting.weekNum).fill(0);
      this.classData.w[options.week] = 1;
      this.classData.d = options.day;

      // 生成课节列表
      this.classData.m = [options.start/1, options.end/1];
    }
    

    // 渲染数据
    this.renderer();

    this.setData({
      mode: classData ? 2 : 1
    });

    this.data.semester = options.semester;
  },

  /**
   * @function renderer
   * @description 将数据渲染到页面上
   */
  renderer: function(){
    // 渲染数据
    this.setWeekList(this.classData.w, this.classData.m);

    // 方向解析周数据
    this.setData({
      nameVal: this.classData.n,
      teacherVal: this.classData.t,
      locateVal: this.classData.l,
      weekText: KCB.reverseWeek(this.classData.w),
      timeText: this.classData.m[0] == this.classData.m[1] ? 
      this.classData.m[0]/1 + 1 : (this.classData.m[0]/1 + 1) + 
      "-" + (this.classData.m[1]/1 + 1),
      day: this.classData.d,
    });
  },

  /**
   * @function submit
   * @description 数据提交
   */
  submit: function(){
    
    // 表单验证
    if(!this.classData.n){
      this.setData({
        nameError: false
      });
      this.setData({
        nameError: true
      });
      return wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      })
    }
    
    // 读取学期缓存
    let semester = API.get(this.data.semester);

    // 分配一个颜色
    this.classData.c = this.classData.c ? this.classData.c : 
    KCB.getClassColor(semester.color, this.classData.n);

    // 分配一个标识符号
    if(!this.classData.i){
      semester.nextId = semester.nextId ? semester.nextId + 1 : 1;
      this.classData.i = semester.nextId;
    }
    
    // 删除重复项
    let push = false;
    for(let i = 0; i < semester.user.length; i++){
      if(semester.user[i].i == this.classData.i) {
        push = true;
        semester.user[i] = this.classData
      };
    }
    
    // 存放
    if(!push) semester.user.push(this.classData);
    API.set(this.data.semester, semester);

    // 提示消息
    wx.showToast({
      title: '保存成功！！',
      success: ()=>{

        // 获取设置
        let setting = API.getSetting();
        
        // 重新演算当前学期课表
        API.calcKCB(this.data.semester, false, ()=>{
          wx.navigateBack({});
        }, setting);
      }
    })
  },

  /**
   * @function delete
   * @description 删除课程
   */
  delete: function(){
    console.log(this.classData.i);

    let semester = API.get(this.data.semester);
    semester.user = semester.user.filter((v)=>v.i!==this.classData.i);
    API.set(this.data.semester, semester);

    // 提示消息
    wx.showToast({
      title: '删除成功！！',
      success: ()=>{

        // 获取设置
        let setting = API.getSetting();
        
        // 重新演算当前学期课表
        API.calcKCB(this.data.semester, false, ()=>{
          wx.navigateBack({});
        }, setting);
      }
    })
  },

  /**
   * @function reCalcKCB
   * @description 重新演算课程
   */
  reCalcKCB: function(){
    let termList = API.getTermList().List;
    let successNum = 0;
    for(let i = 0; i < termList.length; i++){
      API.calcKCB(termList[i], false, ()=>{
        successNum++;
        if(successNum >= termList.length) wx.showToast({
          title: '课表解析成功!',
        });
      }, this.data.setting);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})