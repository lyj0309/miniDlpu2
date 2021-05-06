import Data from "../core/Data";

/**
 * 设置类
 * 管理小程序设置
 */
export default class Setting extends Data{

  constructor(){
    super();

    // 缓存数据
    // 隐藏属性
    this._data = this.getStorage("Setting");
    if(!this._data) {
      this._data = {};
      this.setStorage("Setting", this._data);
    }

    // 基础缓存控制
    this.regisKey({
      name: "data",
      get: () => this._data,
      set: (e) => {
        this._data = e;
        this.setStorage("Setting", this._data);
      }
    });

    // 当前学期数据
    this.relationKey("data", "nowSemester", Data.DEFAULT);

    // 当前周数据
    this.relationKey("data", "nowWeek", Data.DEFAULT);

    // 课表背景
    this.relationKey("data", "backgroundImg", Data.DEFAULT);

    // 课表显示周数
    this.relationKey("data", "showWeekNum", 20);

    // 是否显示非本周课程
    this.relationKey("data", "showOtherWeek", true);

    // 是否显示自定义课程
    this.relationKey("data", "showUserClass", true);

    // 自定义课程是否会覆盖教务处课程
    this.relationKey("data", "userClassIndex", true);

    // 开启课表解析器严格模式
    this.relationKey("data", "parserStrictMod", true);

    // 开启快速迭代求解模式
    this.relationKey("data", "parserFasterMod", true);
  }
}