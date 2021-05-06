/**
 * 数据类
 */
export default class Data{

  /**
   * 构造器
   */
  constructor(){}

  /**
   * @function parseTime
   * @description 时间解析
   * @returns time(String)
   */
  parseTime(lGST) {
    return lGST ?
      lGST.getFullYear() + "-" +
      (lGST.getMonth() + 1) + "-" +
      lGST.getDate() + " " +
      lGST.getHours() + ":" +
      lGST.getMinutes() + ":" +
      lGST.getSeconds()
      : "";
    }

  /**
  * @function jsonParse
  * @param d(Obj|String)
  * @description 如果传入字符串则尝试解析json
  * @description 传入对象则转换为json字符串
  * */
  jsonParse(d) {

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
  }

  /**
  * @function setStorage
  * @description 封装微信setStorageSync
  * @param key 存储使用的键
  * @param data 存储的值
  * @returns error 错误对象
  */
  setStorage(key, data) {

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
  }

  /**
  * @function getStorage
  * @description 封装微信getStorageSync
  * @param key 获取存储键
  * @returns error 错误对象
  */
  getStorage (key) {

    // 处理单次获取请求
    if (key.constructor === String)
      return wx.getStorageSync(key);

    // 处理多个获取请求
    let res = [];
    if (key.constructor === Array)
      for (let i = 0; i < key.length; i++)
        res.push(wx.getStorageSync(key[i]));
    return res;
  }

  /**
  * @function setObjData
  * @description 覆盖全集数据
  * @param obj 要设置的对象
  * @param key 键值
  * @param data 值
  */
  setObjData (obj, key, data) {

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
  }

  /**
   * @function testData
   * @description 存在性校验数据
   * @param obj 需要校验的对象
   * @param key 需要检验的键值
   * @param time 最后一位时间校验
   */
  testData(obj, key, time) {

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
   * 注册一个数据键
   * @param p 配置对象
   * 
   * @param p.name 参数名字
   * @param p.get 同步获取
   * @param p.set 同步设置
   * @param p.getSync 异步获取函数 演示(callback)=>callback(data)
   * @param p.setSync 异步设置函数 演示(data, callback)=>callback()
   * 
   * @description 注册一个属性，必须使用此方法注册
   * 如果定义了同步操作，则会生成异步操作函数
   * 如果仅定义了异步操作，则无法使用同步操作，同步调用将报错
   */
  regisKey(p){

    // 名称检测
    if(!p.name) throw new Error("Data: 注册属性时必须指定name");

    // 绑定对象
    if(this[p.name]) throw new Error("Data: 已存在名为'" + p.name + "'的属性");
    else this[p.name] = {};
    let par = this[p.name];

    // 检测函数设置
    par.haveSet = (p.set && p.set.constructor === Function);
    par.haveGet = (p.get && p.get.constructor === Function);
    par.haveSetSync = (p.setSync && p.setSync.constructor === Function);
    par.haveGetSync = (p.getSync && p.getSync.constructor === Function);

    // 检测
    if(!par.haveGet && !par.haveGetSync) p.get = () => {
      console.warn("Data: '" + p.name + "'属性是只写的");
    };
    if(!par.haveSet && !par.haveSetSync) p.set = () => {
      console.warn("Data: '" + p.name + "'属性是只读的");
    };

    // 设置 set
    par.set = par.haveSet ? 
    ((...e) => p.set.call(this, ...e)) : 
    (() => {throw new Error("Data: '" + p.name + "'属性不支持同步设置")});
    
    // 设置 get
    par.get = par.haveGet ? 
    ((...e) => p.get.call(this, ...e)) : 
    (() => {throw new Error("Data: '" + p.name + "'属性不支持同步获取")});

    // 异步 setSync
    par.setSync = par.haveSetSync ? 
    ((...e) => p.setSync.call(this, ...e)) : 
    ((...e) => new Promise((r) => r(p.set.call(this, ...e)) ));

    // 异步 getSync
    par.getSync = par.haveGetSync ? 
    ((...e) => p.getSync.call(this, ...e)) : 
    ((...e) => new Promise((r) => r(p.get.call(this, ...e)) ));
  }

  /**
   * 将属性关联到另一个对象的键值
   * @param obj 关联对象
   * @param key 关联键值
   */
  relationKey(obj, key, def){

    if(!key || !obj) throw new Error("Data: 数据关联时请指定关系键值");
    if(!this[obj]) throw new Error("Data: 关联对象不存在！");

    let setting = {name: key};
    
    // 如果 obj 存在同步获取方法
    if(this[obj].haveGet && this[obj].haveSet){
      setting.get = (e) => {
        let data = this[obj].get(e);
        if (data[key] !== undefined) return data[key];

        // 设置默认值
        data[key] = def;
        this[obj].set(data);
        return def;
      }
    }

    // 如果存在同步设置
    if(this[obj].haveSet){
      setting.set = (e)=>{
        let data = this[obj].get(e);
        data[key] = e === undefined ? def : e;
        this[obj].set(data);
        return data[key];
      }
    }

    // 如果没有指定同步获取
    // 或者源对象自定义了异步获取
    if(this[obj].haveGetSync || !setting.get){
      setting.getSync = (e) => new Promise((r) => {
        this[obj].getSync(e).then((data)=>{
          if (data[key] !== undefined) r(data[key]);

          // 设置默认值
          else {
            data[key] = def;
            this[obj].setSync(data).then( () => r(def) );
          }
        });
      });
    }

    // 如果没有指定同步设置
    // 或者源对象自定义了异步设置
    if(this[obj].haveSetSync || !setting.set){
      setting.setSync = (e) => new Promise((r) => {
        this[obj].getSync(e).then((data)=>{
          data[key] = e === undefined ? def : e;
          this[obj].setSync(data).then( () => r(data[key]) );
        });
      });
    }

    // 注册
    this.regisKey(setting);
  }

  // 默认
  static DEFAULT = "_DEFAULT_";
}
