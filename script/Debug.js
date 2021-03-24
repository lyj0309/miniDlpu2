const CONST = require("./Const");
const CONFIG = {

  // 调试模块
  debug: {

    // 调试输出总开关
    on: true,
    // 最高调试等级
    leve: CONST.DEBUG_LEVE.LOW,
  }
};

/** 
 * 调试输出函数
 * @class Debug
 */
class Debug{

  constructor(){
    this.COLOR = CONST.COLOR;
    this.DEBUG_LEVE = CONST.DEBUG_LEVE;
  }

  /**
   * 获取当前调试栈信息
   */
  getLine(){
    let stack = new Error().stack.split(/\s+/);
    stack.shift();
    let name; let line;
    for(let i = 0; i < stack.length; i++){

      // 搜索栈区除debug关键字意外的栈信息
      if(/at/.test(stack[i]) && !/^(Debug\.|\/Debug.js\:)/.test(stack[i+1])){
        name = stack[i+1];
        line = /\/([^\/]*)\.js\:\d+\:\d+$/.exec(stack[i+2].replace(/(\(|\))/g, ""))[0].replace("\/", "");
        break;
      }
    }
    
    // 返回调用栈信息
    return ["%c" + name + " %c(" + line + "):\n", 
    ...this.getLineStyle()];
  }

  /**
   * 获取调试信息
   */
  genStyle(color = this.COLOR.GOLD, size = 1, padding = 0){
    return "color: " + color + "; font-size: " + size + "em; padding: " + padding + "px;";
  }

  /**
   * 获取调试头样式 
   */ 
  getLineStyle(){
    return [this.genStyle(this.COLOR.POWDERBLUE, 0.8) + "; padding-bottom: 10px;", 
    this.genStyle(this.COLOR.MEDIUMSEAGREEN, 0.8) + "; padding-bottom: 10px;"]
  }

  /**
   * 尝试调试
   */
  testLog(leve = CONST.DEBUG_LEVE.LOW){
    if(CONFIG.debug.leve <= leve) return true
    return false;
  }

  /**
   * 打印对象
   */
  log(...d){
    if(!CONFIG.debug.on) return false;

    // 开启自动识别变量
    let leve = CONST.DEBUG_LEVE.LOW;
    for(let i = 0; i < d.length; i++){
      if(typeof d[i] === "object" && d[i].constructor === CONST.DEBUG_LEVE) {
        leve = d[i];
        d.splice(i, 1);
        break;
      }
    }

    // 鉴权输出
    if(!this.testLog(leve)) return;
    console.log.apply(console, this.getLine().concat(d));
  }

  /**
   * 打印消息
   */
  msg(string = "", ...d){
    if(!CONFIG.debug.on) return false;

    // 自动识别
    let leve = CONST.DEBUG_LEVE.LOW;
    let color = CONST.COLOR.GOLD;
    let size = 1;
    for(let i = 0; i < d.length; i++){
      if(typeof d[i] === "object" && d[i].constructor === CONST.DEBUG_LEVE) {
        leve = d[i];
        continue;
      }
      if(typeof d[i] === "object" && d[i].constructor === CONST.COLOR){
        color = d[i];
        continue;
      }
      if(typeof d[i] === "number" || typeof d[i] === "string"){
        size = d[i];
        continue;
      }
    }

    // 鉴权输出
    if(!this.testLog(leve)) return;
    let line = this.getLine();
    console.log(line[0] + "%c" + string, line[1], line[2], this.genStyle(color, size));
  };
}

module.exports = Debug;