
/**
  *                             _ooOoo_
  *                            o8888888o
  *                            88" . "88
  *                            (| -_- |)
  *                            O\  =  /O
  *                         ____/`---'\____
  *                       .'  \\|     |//  `.
  *                      /  \\|||  :  |||//  \
  *                     /  _||||| -:- |||||-  \
  *                     |   | \\\  -  /// |   |
  *                     | \_|  ''\---/''  |   |
  *                     \  .-\__  `-`  ___/-. /
  *                   ___`. .'  /--.--\  `. . __
  *                ."" '<  `.___\_<|>_/___.'  >'"".
  *               | | :  `- \`.;`\ _ /`;.`/ - ` : | |
  *               \  \ `-.   \_ __\ /__ _/   .-` /  /
  *          ======`-.____`-.___\_____/___.-`____.-'======
  *                             `=---='
  *          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  *                     佛祖保佑        永无BUG
  */
const KCB = {};

// 默认颜色列表
/*KCB.COLOR = [
  "EB8A79", "C3D876", "6BC1CB", "77C182", "CC5884",
  "877ED8", "FFC36B", "D68ED1", "89A8C5", "E0D948"
];*/
const opc = "0.7"
KCB.COLOR = [
  "rgba(235,138,121,"+opc+")", "rgba(107,193,203,"+opc+")", "rgba(119,193,130,"+opc+")", "rgba(204,88,132,"+opc+")",
  "rgba(135,126,216,"+opc+")", "rgba(255,195,107,"+opc+")", "rgba(214,142,209,"+opc+")", "rgba(137,168,197,"+opc+")"
];


/**
 * @function getClassColor
 * @description 获取颜色
 * @param cList 当前颜色列表
 * @param name 课程名字
 * @returns color(String) 分配的颜色
 */
KCB.getClassColor = function(cList, name){
  
  // 如果找到 直接返回
  for(let i = 0; i < cList.length; i++){
    if (cList[i].n === name) return cList[i].c
  }

  // 没找到 统计被使用的颜色列表
  let unUsed = KCB.COLOR.map((v)=>{

    // 去除使用过的颜色
    for(let i = 0; i < cList.length; i++){
      if (cList[i].c === v) return 0;
    }

    return v;
  }).filter((v) => v!==0 );

  // console.log(unUsed, cList);

  // 所有颜色都被使用了
  let color = "";
  if (unUsed.length === 0){
    // 生成随机颜色
    color = KCB.COLOR[Math.floor(Math.random() * KCB.COLOR.length)];
  }

  // 从未使用的颜色中随机生成
  else{
    color = unUsed[Math.floor(Math.random() * unUsed.length)];
  }

  // 记录颜色
  cList.push({
    n: name,
    c: color
  });

  return color;
};

/**
 * @function findCList
 * @description 在课程列表中搜索数据
 * @param clist 课程列表
 * @param name 课程名字
 */
KCB.findCList = function(clist, name){
  for(let i = 0; i < clist.length; i++){
    if(clist[i] == name) return clist[i]
  }
},

/**
 * @function KCB2PerClass
 * @description 将课程表解析为重叠课程列表
 * @param d 原始数据
 */
KCB.KCB2PerClass = function(d){

  // 全部课程列表
  let cList = [];
  // console.log(d);

  // 解析
  for(let i = 0; i < d.length; i++){

    // 解析ID
    let pos = KCB.id2WeekTime(d[i].Id);

    // 搜索课程
    for(let j = 0; j < d[i].CTTDetails.length; j++){

      let clas = d[i].CTTDetails[j];
      let findClass = KCB.findCList(cList, clas.Name);

      // 没有找到
      if (!findClass) {
        // let cd = {
        //   n: clas.Name,
        //   t: [],
        // };
        // cd.t.push(pos[0]);
        // cd[pos[0]] = [pos[1]];
        cList.push(clas.Name);
      }

      // 找到了 贡献课节长度
      else if(false){
        let cd = findClass;

        // 如果当前周不存在
        if(!cd[pos[0]]){
          cd.t.push(pos[0]);
          cd[pos[0]] = [pos[1]];
        }

        // 如果存在 直接贡献
        else cd[pos[0]].push(pos[1]);
      }
    }  
  }

  return cList;
},

/**
 * @function parseKCB(d)
 * @description 核心函数 解析课程表
 * @returns class kcb[7][12][?]
 */
KCB.parseKCB = function(d, colorList = []){
  // 创建结果索引 三维数组(7x12x0)
  let kcb = new Array(7).fill(null).map(()=>new Array(6).fill(null).map(()=>new Array()));

  // 解析课程数据并存入索引
  for(let i = 0; i < d.length; i++){
    let pos = KCB.id2WeekTime(d[i].Id);
    let kcbWT = kcb[pos[0]][pos[1]];
    for(let j = 0; j < d[i].CTTDetails.length; j++){

      // 检查是由与目前已知课程重复
      // 这里进行周合并
      let isUnion = false;
      for(let l = 0; l < kcbWT.length; l++){

        // 只要满足课程名字场地和老师相同 则认为是同一门课
        // 进行课程合并
        if(
          kcbWT[l].n === d[i].CTTDetails[j].Name && 
          kcbWT[l].l === d[i].CTTDetails[j].Room && 
          kcbWT[l].t === d[i].CTTDetails[j].Teacher
        ){

          // console.log("出现相同课程啦！！！！！！！");
          // 将周函数合并
          kcbWT[l].w = KCB.unionWeek(
            KCB.parseWeek(d[i].CTTDetails[j].Week), 
            kcbWT[l].w
          );

          // 反向推导周描述
          kcbWT[l].m = KCB.reverseWeek(kcbWT[l].w) + "(周)";
          isUnion = true;
          break;
        };
      }

      // 没有相同的课程 直接推入数组
      // console.log(KCB.getClassColor(colorList, d[i].CTTDetails[j].Name));
      if(!isUnion) kcbWT.push({
        n: d[i].CTTDetails[j].Name,
        l: d[i].CTTDetails[j].Room,
        t: d[i].CTTDetails[j].Teacher,
        w: KCB.parseWeek(d[i].CTTDetails[j].Week),
        m: d[i].CTTDetails[j].Week,
        c: KCB.getClassColor(colorList, d[i].CTTDetails[j].Name)
      });
    }
  }
  
  return [kcb,colorList];
};

/**
 * @function sortClassObj
 * @description 复制并整理课程数据对象，防止因浅拷贝影响kcb索引
 * @returns classObj()
 */
KCB.sortClassObj = function(o, len, blank, otherWeek = false, i = 0){

  // 这里选择前端需要的数据
  let d = {
    n: o.n,
    l: o.l,
    // t: o.t,
    // w: o.w,
    // m: o.m,
    c: o.c,
    other: otherWeek ? 1 : 0,
    len: len,
    blank: blank
  };

  // 自定义课程
  if(i) d.i = i;

  // 如果名字太长 省略
  // 如果只有一个格子 限制4字
  if((len == 1) && (d.n.length > 4)) {
    // console.log(d.n, d.n.length, len, 1);
    d.n = d.n.substr(0, 4) + "...";
  }

  else if((d.n.length > (len - 1) * 12) && len != 1) {
    // console.log(d.n, d.n.length, len, 2);
    d.n = d.n.substr(0, (len - 1) * 12) + "...";
  }

  return d;
}

/**
 * @function KCB2PerWeek
 * @description 将课程表数据解析为周 导出可用于渲染的数据
 * @param kcb KCB.parseKCB()函数解析得到的数据
 * @param i 第几周
 * @param otherWeek 是否渲染[非本周]
 * @returns preWeek
 */
KCB.KCB2PerWeek = function(kcb, i, otherWeek = true){
  // 创建结果索引 三维数组(lenx7x0)
  let preWeek = new Array(7).fill(null).map(()=>new Array());

  // 创建缩略图
  let img = new Array(6).fill(null).map(()=>new Array(6).fill(0));

  // 课程数量统计
  let classNum = 0;

  // 逐星期采样
  for(let j = 0; j < 7; j++){

    // 记录当前空白 长度 课程
    let blank = 0; let len = 0; let dcla = null;
    // 记录非本周课程 数据
    let lenF = 0; let dclaF = null;
    for(let l = 0; l < 6; l++){
      let cla = kcb[j][l];

      // 如果有很多课程重叠 继续遍历
      let hasClass = false;
      for(let o = 0; o < cla.length; o++){
        // 如果该课程在本周有课
        if(cla[o].w[i] === 1) {

          // 如果存在未结算的非本周课程 先结算
          if (dclaF !== null && otherWeek){
            preWeek[j].push(KCB.sortClassObj(dclaF, lenF, blank, true));
            // console.log("遇到本周非本周结算", lenF, blank, dclaF.n, l);
            lenF = 0;
            dclaF = null;
            blank = 0;
          }

          // 这门课是非连续的第一门课
          if(dcla === null) {
            dcla = cla[o];
            len = 2;
            // console.log("非连续", len, blank, dcla.n, l, o);
          }

          // 只要满足课程名字场地和老师相同 则认为是同一门课 累计len贡献
          else if(
            dcla.n === cla[o].n && 
            dcla.l === cla[o].l && 
            dcla.t === cla[o].t
          ){
            len += 2;
            dcla = cla[o];
            classNum++;
            // console.log("连续", len, blank, dcla.n, l, o);
          }

          // 不是同一门课 结算上一门课 更新为当前课
          else{
            preWeek[j].push(KCB.sortClassObj(dcla, len, blank));
            classNum++;
            // console.log("非同门", dcla.len, dcla.blank, dcla.n, l, o);
            dcla = cla[o];
            len = 2;
            blank = 0;
          }

          hasClass = true;
          break;
        }
      }

      // 遍历的这些课在这周全不上 结算上节课 贡献空白值
      if(hasClass === false){

        // 如果上节课存在 结算
        if (dcla !== null) {
          preWeek[j].push(KCB.sortClassObj(dcla, len, blank));
          classNum++;
          // console.log("空白结算", dcla.len, dcla.blank, dcla.n, l);
          dcla = null;
          len = 0;
          blank = 0;
        }

        // 进入非本周课程处理
        // 如果非本周课程不存在 直接贡献空白值
        if(cla.length === 0 && otherWeek){

          // 如果存在未结算的非本周课程 先结算
          if (dclaF !== null && otherWeek){
            preWeek[j].push(KCB.sortClassObj(dclaF, lenF, blank, true));
            // console.log("空白非本周结算", lenF, blank, dclaF.n, l);
            lenF = 0;
            dclaF = null;
            blank = 0;
          }

          blank += 2;
        }

        // 这门非本周课是非连续的第一门课
        else if(dclaF === null && otherWeek) {
          dclaF = cla[0];
          lenF = 2;
          // console.log("非本周非连续", lenF, blank, dclaF.n, l);
        }

        // 只要满足课程名字场地和老师相同 则认为是同一门课 累计len贡献
        else if(
          otherWeek &&
          dclaF.n === cla[0].n && 
          dclaF.l === cla[0].l && 
          dclaF.t === cla[0].t
        ){
          lenF += 2;
          dclaF = cla[0];
          // console.log("非本周连续", len, blank, dcla.n, l, o);
        }

        // 不是同一门非本周课 结算上一门非本周课 更新为当前非本周课
        else if(otherWeek) {
          preWeek[j].push(KCB.sortClassObj(dclaF, lenF, blank, true));
          // console.log("非本周非同门", dcla.len, dcla.blank, dcla.n, l, o);
          dclaF = cla[0];
          lenF = 2;
          blank = 0;
        }

        else if(!otherWeek){
          blank += 2;
        }
      }

      // 如果当前位置有课 采集缩略图
      else{
        img[j >= 6 ? 5 : j][l] = 1;
      }
    }

    // 到这里如果还有课程未结算 在这里补充结算
    if (dcla !== null) {
      preWeek[j].push(KCB.sortClassObj(dcla, len, blank));
    }

    // 到这里如果存在未结算的非本周课程 在这里补充结算
    if (dclaF !== null && otherWeek){
      preWeek[j].push(KCB.sortClassObj(dclaF, lenF, blank, true));
    }

    // 由于算法中特殊的课程结算方式
    // 所以本周课程和非本周课程在这里最多出现一个
  }

  return [preWeek, img, classNum];
};


/**
 * @function userKCB2PerWeek
 * @description 解析用户自定义课表
 * @param user 用户自定义课程
 * @param kcb 当前课表
 * @param img 当前课程影像
 * @param i 哪周
 * @param otherWeek = true
 */
KCB.userKCB2PerWeek = function(user, kcb, img, i, otherWeek = true, classIndex = true){

  // 遍历每个星期
  for(let j = 0; j < kcb.length; j++){

    // 过滤当天自定义课程
    let TUserClass = []; let FUserClass = [];
    for(let k = 0; k < user.length; k++){

      // 本周
      if ((user[k].w[i]/1) && (user[k].d/1 == j)) {
        user[k].other = 0;
        TUserClass.push(user[k]);
      }

      // 非本周
      if ((!(user[k].w[i]/1)) && (user[k].d/1 == j)) {
        user[k].other = 1;
        FUserClass.push(user[k]);
      }
    };

    // 如果当天没有自定课程
    // 不做任何处理 跳过本次循环
    if ((!TUserClass.length) && (!FUserClass.length)) continue;

    // 如果设置了不显示本周
    // 非本周课程将会被丢弃
    if (!otherWeek) FUserClass = [];

    // 调试语句 测试解析算法
    // FUserClass = [];
    // TUserClass = [];

    // 创建坐标数组
    let posArray = new Array(12).fill(0);

    // 创建一颗指针用于记录当前坐标
    let posPointer = 0;

    // 遍历每节课
    // 生成12x指针数组
    for(let k = 0; k < kcb[j].length; k++){
      posPointer += kcb[j][k].blank;
      let tPos = posPointer + kcb[j][k].len/1;
      for(; posPointer < tPos; posPointer ++)
      posArray[posPointer] = kcb[j][k];
    }

    // 调试语句 这里在测试指针数组
    // console.log(i,j,posArray);

    // 将用户课表注入到教务处课表
    // 同时记录当前是否成功覆盖
    // 先覆盖本周课程
    for(let k = 0; k < TUserClass.length; k++){

      // 遍历该课程上课时间区域
      for(let p = TUserClass[k].m[0]; p <= TUserClass[k].m[1]; p++){

        // 覆盖非本周 和 用户强制定义覆盖本周
        if((!posArray[p]) || posArray[p].other || classIndex) {
          posArray[p] = TUserClass[k];

          // 更新预览图
          img[j == 6 ? 5 : j][(Math.floor(p/2))] = 1;

          continue;
        }
      }
    }

    // 再覆盖非本周课程
    for(let k = 0; k < FUserClass.length; k++){

      // 遍历该课程上课时间区域
      for(let p = FUserClass[k].m[0]; p <= FUserClass[k].m[1]; p++){

        // 覆盖非本周 和 用户强制定义覆盖本周
        if( (!posArray[p]) || ((posArray[p].other) && (!posArray[p].i) && (classIndex))) {
          posArray[p] = FUserClass[k];
          continue;
        }
      }
    }

    // console.log(i,j,posArray);

    // 清除原先的课表
    kcb[j].length = 0;

    // 解析用户自定义课表
    let blank = 0; let len = 0; let clas = null;
    for(let k = 0; k < posArray.length; k++){

      // 遇到空白
      if(!posArray[k]){

        // 结算上一门课
        if (clas) {
          kcb[j].push(KCB.sortClassObj(clas, len, blank, clas.other, clas.i));
          clas = null;
          blank = 1;
          len = 0;
        }

        // 贡献空白值
        else blank += 1;
      }

      // 有课 上一节没课
      else if(posArray[k] && !clas){
        clas = posArray[k];
        len = 1;
      }

      // 有课 与上一节相同
      else if(posArray[k] && (posArray[k] == clas)){
        len += 1;
      }

      // 有课 与上一节不同
      else if(posArray[k] && (posArray[k] != clas)){
        kcb[j].push(KCB.sortClassObj(clas, len, blank, clas.other, clas.i));
        clas = posArray[k];
        blank = 0;
        len = 1;
      }
    }

    // 如果还有没结算的课程
    // 这这里结算
    if(clas) kcb[j].push(KCB.sortClassObj(clas, len, blank, clas.other, clas.i));
  }
};

/**
 * @default IMG 静态数据
 * @description 缩略图生成标准
 */
KCB.IMG = {
  class: "3EA3D8",
  blank: "DDDDDD",
  width: 42.5,
  height: 42.5
};

/**
 * @function imageCss
 * @description 将缩略图转换为CSS背景
 * @param img(int[][])
 * @returns res(String)
 */
KCB.imageCss = function(img){
  let bg = ""; let pos = "";
  let uw = KCB.IMG.width / img.length;
  let uh = KCB.IMG.height / img[0].length;

  // 遍历图像矩阵
  for(let i = 0; i < img.length; i++){
    for(let j = 0; j < img[i].length; j++){
      
      // 颜色贡献
      bg += ", radial-gradient(" + "#" +
      (img[i][j] ? KCB.IMG.class : KCB.IMG.blank) + 
      " 43%, transparent 0)";

      // 计算坐标
      pos += ", " + i*uw + (i === 0 ? "" : "px") + 
      " " + 
      j*uh + (j === 0 ? "" : "px");
    }
  }

  // 去除第一位的 ", "
  bg = bg.replace(", ", "");
  pos = pos.replace(", ", "");

  return "background-image: " + bg + "; " +
  "background-position: " + pos + ";"

}

/**
 * @function sortClassObj
 * @description 复制并整理课程数据对象，防止因浅拷贝影响kcb索引
 * @returns classObj()
 */
KCB.sortCList = function(o, otherWeek = 0){

  // 这里选择前端需要的数据
  return {
    n: o.n,
    l: o.l,
    t: o.t,
    // w: o.w,
    i: o.i ? o.i : 0,
    m: o.m,
    c: o.c,
    o: otherWeek ? 1 : 0
  }
}

/**
 * @function searchClass
 * @description 通过 周数 星期数 节数 索引该处的课程
 * @param kcb 课程表数据
 * @param kd 课程表逐周采样数据
 * @param user 用户课程表
 * @param week 周数
 * @param day 星期数
 * @param time 节数
 * @param setting 设置 注意这里因为不能循环引用
 * @param detail 是否显示细节
 * @returns cList 课程列表
 */
KCB.searchClass = function(kcb, kd, user, week, day, time, setting, detail = true){

  let weekDay = kcb[day][parseInt(time / 2)];
  let cList = []; let cListF = [];
  // console.log(weekDay);

  // 遍历获取当前时间坐标下的课程列表
  for(let i = 0; i < weekDay.length; i++){

    // 看看这门课在这周上不上
    let thisWeek = weekDay[i].w[week];

    if (thisWeek) cList.push(KCB.sortCList(
      weekDay[i], 1
    ));

    // 不上丢入cListF
    else cList.push(KCB.sortCList(
      weekDay[i], 0
    ));
  }

  // 检测自定义课表
  for(let i = 0; i < user.length; i++){

    let pr = 0;
    
    // 本周
    if (
      (user[i].w[week]/1) && 
      (user[i].d/1 == day) && 
      (user[i].m[0] <= time) && 
      (user[i].m[1] >= time)
    ) {
      pr = 1;
    }

    // 非本周
    if (
      (!(user[i].w[week]/1)) && 
      (user[i].d/1 == day) && 
      (user[i].m[0] <= time) && 
      (user[i].m[1] >= time)
    ) {
      pr = 2;
    }

    if(pr){
      let cData = {
        n: user[i].n,
        l: user[i].l,
        t: user[i].t,
        m: KCB.reverseWeek(user[i].w) + '(周)',
        c: user[i].c,
        o: pr == 1 ? 1 : 0,
        w: day,
        s: user[i].m[0],
        e: user[i].m[1],
        i: user[i].i
      };

      if(pr == 1) cList.push(cData);
      else if(pr == 2) cListF.push(cData);
    }
  }

  // 如果不需要继续获取细节 到这里就可以了 节省性能
  if(!detail) return setting.otherClass ? cList.concat(cListF) : cList;

  // 遍历有课的点位 获取上课时间
  for(let i = 0; i < cList.length; i++){

    // 课表渲染数据中搜索
    let blank = 0;
    for(let j = 0; j < kd[week][day].length; j++){
      let clas = kd[week][day][j];

      // console.log(clas);
      // 累计空白
      blank += clas.blank;
      // console.log(blank, blank + clas.len, time + 1);
      if((blank + clas.len >= (time + 1)) ){
        cList[i].w = day;
        cList[i].s = blank;
        cList[i].e = blank + clas.len - 1;
        break;
      }
      blank += clas.len;
    }
  }

  return setting.otherClass ? cList.concat(cListF) : cList;
};

/**
 * @function id2WeekTime(id)
 * @description 将ID解析为周-时间坐标系
 * @returns pos(Array(2)) [周, 时间]
 */
KCB.id2WeekTime = function(id){
  // return [parseInt((id - 1) / 6), (id - 1) % 6];
  return [(id - 0) % 7, parseInt((id - 0) / 7)];
};

/**
 * @function unionWeek
 * @description 将两个课程安排周，进行并集运算
 * @param w1 第一个周
 * @param w2 第二个周
 * @returns w 合并后的周
 */
KCB.unionWeek = function(w1, w2){
  
  // 遍历比较长的周
  return (w1.length > w2.length ? w1 : w2)
  .map((v, i) => w1[i] || w2[i]);
};

/**
 * @function parseWeek(s)
 * @description 解析周
 * @returns week(Array)
 */
KCB.parseWeek = function(s){
  
  // 检测模式
  let mod = 0; let maxWeek = 0;
  let weekRES = [,/(\(周\)|（周）)$/,/(\(双周\)|（双周）)$/,/(\(单周\)|（单周）)$/];
  weekRES.map((v, i)=>{if(v && v.test(s)) mod = i});

  // 去除(周)
  s = s.replace(weekRES[mod], "");

  // 解析为稀疏数组
  let sparseArray = [];
  s.split(",").map((v)=>{
    v = v.split("-");
    if (v.length === 1) v.push(v[0]);
    maxWeek = maxWeek > v[1]/1 ? maxWeek : v[1]/1;
    for(let i = v[0]-1; i < v[1]; i++) sparseArray.push(i);
  });

  // 将稀疏数组转换为布尔数据
  let week = new Array(maxWeek).fill(0);
  sparseArray.map((v)=>week[v] = 1);

  // 处理双周情况
  if(mod === 2) week = week.map((v, i)=>i%2 && v);

  //处理单周情况
  if(mod === 3) week = week.map((v, i)=>(i+1)%2 && v);

  return week;
}

/**
 * @function reverseTime(s)
 * @description 逆向解析课节
 * @param w 课节布尔数据
 * @returns time(String)
 */
KCB.reverseTime = function(w){
  let st = 0; let ed = 0; let de = false;
  for(let i = 0; i < w.length; i++){
    
    // 找到起始点
    if(w[i] && !de) {
      st = i + 1;
      de = true;
    }

    // 找到结束点
    if(!w[i] && de){
      ed = i;
    }
  }

  return st + '-' + ed;
},

/**
 * @function reverseWeek(s)
 * @description 逆向解析周
 * @param w 周布尔数据
 * @returns week(String)
 */
KCB.reverseWeek = function(w){
  
  // 这个函数返回字符串值
  let week = "";

  // 搜索周与周之间的断点
  let start = 0; let len = 0;
  for (let i = 0; i < w.length; i++){
    
    // 有课 没记录
    if (w[i] === 1 && start === 0){
      start = i + 1;
    }

    // 有课 有记录
    else if(w[i] === 1 && start > 0){
      len ++;
    }

    // 无课 有记录
    else if(w[i] === 0 && start > 0){
      week += ",";
      if (len === 0) week += start;
      else week += start + "-" + (start + len);
      start = 0; len = 0; 
    }
  }

  // 如果仍然有周没有解析 这里补充
  if(start > 0){
    week += ",";
    if (len === 0) week += start;
    else week += start + "-" + (start + len);
  }

  return week.replace(",", "");
};

module.exports = KCB;