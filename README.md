## miniDLPU2-WechatProgram

掌上教务处(大连工业大学的工大教务处小程序v2)，主要有学生课程表查询、学生成绩、考试日程、校历、培养方案、空教室、评教等功能。

## 主要页面展示
![image](https://user-images.githubusercontent.com/50474995/111158380-ed8d0300-85d2-11eb-9081-654376d9d1ea.png)
![image](https://user-images.githubusercontent.com/50474995/111158426-fa115b80-85d2-11eb-925e-2acbb40beaf7.png)

## 小程序码
![gh_97aaf8177dee_258 (2)](https://user-images.githubusercontent.com/50474995/111158556-1ca37480-85d3-11eb-895f-d81e2fb123fb.jpg)

## 功能对应路径

+ **课程表**：page/Timetable/Timetable

+ **综合信息**：pages/Information/Information
+ 成绩 考试日程 培养方案 空教室 pages/Information/infoCom/infoCom
+ 校历：pages/Information/simple/simple
+ 评教：pages/Information/evaluation/evaluation


+ **设置**：pages/Account/Account
+ 学号和密码：pages/Subpages/StudentId/StudentId
+ 关于我们：pages/Subpages/AboutUs/AboutUs
+ 缓存管理：pages/Subpages/Storage/Storage
+ 常见问题：pages/Subpages/FAQ/FAQ
  

  | 返回码 | 说明 |
  | ---- |---- |
  | 1 | 请求成功 |
  | 2 | session过期 |
  | 3 | 用户名或密码错误 |
  | 4 | 其他错误（如cet） |


发版计划：

考试提醒  
培养方案 plus
空教室自成一服务  
已选择未安排课程和备注添加   
图片接口  
重新后端LOG  
增加其他没排课课程  

开发历史：
> 考试日程加倒计时  
> 长时间不登录get 3次staticdata  
> 节目使用高斯模糊美化  
> 空教室显示BUG  
> 有图片时倒计时显示模糊  
> 剪切图片BUG  

> 后端成绩全部查询   
> 学期选择：大一，大二   
> 当没教室时候显示空空如也（包括成绩）   
> 成绩查询+加载中 改版   
> 前端培养方案分割   
> 成绩查询选择学期，成绩占比   
> 成绩查询打开查询当前学期   
> background-attachment 在手机内核不起作用 (用image+fixed实现)   
> scroll-left   
> 课程表的自定义背景   
> 后端返回身份证后6位   
> 水卡优化（自动登录-默认密码）  
> 水卡显示拥有者名字   
> 培养方案，空教室二次弹出   
> 意见反馈   
> 背景颜色改版RGBA   
> 删除数据，重新抓取   
> 学期获取修复   
> 深色模式   
> 学期优化   
> 深色模式登录BUG   
> 深色模式成绩查询学期选择BUG   
> 天气显示切换（包括温度）  
> 空教室BUG   
> 登录优化  
> 微信登录   
> 登录防止二次按按钮  
> 看ip延时(后)  
>关于我们


session机制测试

1. 30，40，50min
2. 登录后查成绩，过20min
3. 返回机制 评教评优评差占比对比(缓)
 出成绩提醒(缓)
   数据预加载(缓)
