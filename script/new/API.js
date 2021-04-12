
/**
 * 接口类
 */
export default class API {

  /**
   * 临时数据
   */
  // 传递给微信的数据
  // API类自动生成，不要覆盖
  // 可以在beforeRequest函数中修改
  wxData = {};
  // 原始参数
  initData = null;
  // 保存微信请求对象
  wxReqObj = null;
  
  /**
   * 请求返回信息
   */
  // 这里保存请求返回的数据
  data = null; 
  // 请求是否成功
  succ = false; 
  // 代码
  errCode = 0;
  // 网络错误
  netErr = 0;
  // 请求状态代码
  statusCode = 0;
  // 返回set-cookie
  cookies = null;
  // 网络请求过程中一些调试信息
  profile = null;
  // 响应头
  header = null;
  // 错误信息
  errMsg = "";

  /**
   * 请求基础参数设置
   */
  // 请求地址 必须重写此参数
  url = ""; 
  // 如果指定了这个参数;则会强制使用这个域名
  forceDomain = ""; 
  // 方法
  method = "GET"; 
  // 超时时间，单位为毫秒
  timeout = undefined;
  // 返回的数据格式
  dataType = "json";
  // 响应的数据类型
  responseType = "text";
  // 开启 http2
  enableHttp2 = false;
  // 开启 quic
  enableQuic = false;
  // 开启 cache
  enableCache = false;

  /**
   * 设置自动消息提示
   */
  // 默认成功时提示
  succMsg = "成功!"; 
  // 默认出错时提示
  failMsg = "错误,{{msg}},代码{{code}}"; 
  // 服务器无响应时提示
  networkMsg = "无法连接至服务器"; 
  // 默认加载时提示
  loadingMsg = "加载中..."; 
  // 默认是否显示加载弹窗
  showSucc = false; 
  // 默认是否显示失败提示
  showFail = false; 
  // 默认是否显示服务器无响应时提示
  showNetwork = false; 
  // 默认是否显示加载动画
  showLoading = false; 

  /**
   * 参数设置
   * @virtual _params 虚拟属性
   */
  _params = [
    // {
    //   name: "id" 参数名字 (必须声明)
    //   default: "xiaoming" 默认值;如果指定;则认为该参数为非必要参数 (null)
    //   test: /^\d+$/ 使用正则表达式验证;如果指定;则开启校验 ("")
    //   test: (data)=>!data.d 可以指定一个函数，来校验值
    //   parse: (data)=>doSomething(data) 这个函数在校验成功后调用，用来处理数据
    //   isHeader: false 是否将此参数添加到请求头
    // }
  ];

  // 虚拟属性
  get params(){return this._params};
  set params(data){
    
    // 如果传递数组
    if(data.constructor === Array)
    for(let i = 0; i < data.length; i++)
    this._params.push(data[i]);

    // 使用对象直接赋值
    if(data.constructor === Object)
    this._params.push(data);
  }

  /**
   * 请求限制
   * 程序运行时最大允许该请求的次数
   */
  limit = 1;

  /** 
   * 构造器 
   */
  constructor(p){this.initData = p};

  /**
   * 初始化
   */
  init(){

    // 初始化 wxData
    this.wxData = {data:{}, header:{}};

    // 解析数据
    this.parseReqData(this.initData);

    // 请求限制
    let globalData = getApp().globalData;
    if(!globalData.requestLimit) globalData.requestLimit = {};
    if(!globalData.requestLimit[this.wxData.url]) 
    globalData.requestLimit[this.wxData.url] = 0;

    // 如果超出限制连接本次请求
    // console.log(globalData.requestLimit[this.wxData.url], this.limit);
    if(globalData.requestLimit[this.wxData.url] >= this.limit) return;
    globalData.requestLimit[this.wxData.url]++;

    // 触发beforeRequest
    this.beforeRequest();

    // 加载动画
    if(this.showLoading) wx.showLoading({title: this.loadingMsg });

    // 挂载函数
    this.wxData.success = (d)=>this.wxSuccessCallback(d);
    this.wxData.fail = (d)=>this.wxFailCallback(d);

    // 释放请求
    wx.request(this.wxData);
  }

  // 这个函数在请求前调用;此时请求需要的信息已处理完成
  beforeRequest = function(){
    // 这里可以使用 this.wxData 访问即将传递给 wx.request 的数据

  }; 

  // 这个函数在请求后调用;此时返回的数据已处理完成
  afterRequest = function(){
    // 这里可以使用this.data访问数据
  }; 

  // 这个函数用来处理请求前的数据，如果被重写需要自己手动解析数据
  parseReqData = function(p){

    // 补全data值
    if(!p.data) p.data = {};
    
    // 获取 URL 
    if(!this.url) throw new Error("API: 必须重写url属性!!!");
    this.wxData.url = "https://" + 
    (p.forceDomain || this.forceDomain || API.getDomain()) + 
    (p.url || this.url);

    // timeout
    this.wxData.timeout = p.timeout || this.timeout;

    // method
    this.wxData.method = p.method || this.method;

    // dataType
    this.wxData.dataType = p.dataType || this.dataType;

    // responseType
    this.wxData.responseType = p.responseType || this.responseType;

    // enableHttp2
    this.wxData.enableHttp2 = p.enableHttp2 || this.enableHttp2;

    // enableQuic
    this.wxData.enableQuic = p.enableQuic || this.enableQuic;

    // enableCache
    this.wxData.enableCache = p.enableCache || this.enableCache;

    // 解析请求数据
    for(let i = 0; i < this.params.length; i++){

      let pp = this.params[i];
      if(!pp.name) throw new Error("API: 需要的属性必须指定name!");
      let da = p.data[pp.name] || p[pp.name] || pp.default;

      // 存在性校验
      if(!da) throw new Error("API: 必要参数'" + pp.name + "'缺少值!");

      // 校验
      if(pp.test){
        let res = false;
        if(pp.test.constructor === Array) {
          for(let j = 0; j < pp.test.length; j++)
          res = res || API.testData(da, pp.test[j]);
        }else{
          res = API.testData(da, pp.test);
        }

        // 如果校验失败，抛出异常
        if(!res) throw new Error("API: 参数'" + pp.name + "'值校验失败!");
      }

      // 获取值处理函数
      let parseFn = pp.parse || API.defaultParse;

      // 判断是否为请求头数据
      // 赋值
      if(pp.isHeader) {
        this.wxData.header[pp.name] = parseFn(da);
      }else{
        this.wxData.data[pp.name] = parseFn(da);
      }
    }
  }

  // 这个函数在请求后立刻被调用;如果重写该函数;则不会处理数据;请手动处理数据
  parseResData = function(d){

    // 处理成功情况
    if(d.code === 1){
      this.succ = true;
      this.errCode = 1;
    }
    
    // 处理失败情况
    else{
      this.succ = false;
      this.errCode = d.code;
    }

    // 返回数据
    return d;
  }

  // 微信成功函数
  wxSuccessCallback(d){

    // 关闭加载
    if(this.showLoading) wx.hideLoading();

    // 保存数据
    this.data = d.data;

    // 保存状态码
    this.statusCode = d.statusCode;

    // 保存响应头
    this.header = d.header;

    // 保存错误信息
    this.errMsg = d.errMsg;

    // 解析数据
    let pData = this.parseResData(this.data);

    // 成功回调
    if(this.succ){

      // 显示提示信息
      if(this.showSucc) wx.showToast({title: this.succMsg});

      if(this.initData.success && 
      this.initData.success.constructor === Function) 
      this.initData.success.call(this, pData);
    }
    
    // 失败回调
    else{

      // 显示提示信息
      if(this.showFail) wx.showToast({title: this.failMsg, icon: "none"});

      if(this.initData.fail && 
      this.initData.fail.constructor === Function) 
      this.initData.fail.call(this, this.errCode);
    }

    this.wxCompleteCallback(pData);
  }

  // 微信失败函数
  wxFailCallback(d){

    // 关闭加载
    if(this.showLoading) wx.hideLoading();

    // 设置失败状态
    this.succ = false;

    // 设置网络错误
    this.netErr = 1;

    // 保存错误信息
    this.errMsg = d.errMsg;

    // 显示提示信息
    if(this.showNetwork) wx.showToast({title: this.networkMsg, icon: "none"});

    // 调用用户回调
    if(this.initData.fail && 
    this.initData.fail.constructor === Function) 
    this.initData.fail.call(this, -1);

    this.wxCompleteCallback(-1);
  }

  // 完成函数
  wxCompleteCallback(d){

    // 计数
    getApp().globalData.requestLimit[this.wxData.url]--;

    // 执行用户回调
    if(this.initData.complete && 
    this.initData.complete.constructor === Function) 
    this.initData.complete.call(this, d);
  }

  // 获取默认域名
  static getDomain(){
    return "jwc.nogg.cn";
  }

  // 校验
  static testData(data, fn){

    // 类型校验
    if(fn === Number || fn === String || fn === Object || 
      fn === Array || fn === Boolean)
      return (data.constructor === fn);

    // typeof校验
    if(fn === "number" || fn === "object" || 
      fn === "boolean" || fn === "string")
      return (typeof data === fn);

    // 正则校验
    if(fn.constructor === RegExp)
    return fn.test(data);

    // 函数校验
    if(fn.constructor === Function)
    return fn(data);

    // 如果没有满足条件
    throw new Error("API: 未知的校验方法" + fn.toString());
  }

  // 单个值解析
  static defaultParse(data){
    return data;
  }

  // 面向过程调用 API
  static run(cls, p){
    let api = new cls(p);
    api.init();
    return api;
  }

  // 使用模板
  static msgTemplate(tem, data){
    
  }
}
