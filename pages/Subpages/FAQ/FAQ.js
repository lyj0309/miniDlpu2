// pages/Subpages/FAQ/FAQ.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focusIndex: -1,
    // 保存了所有FAQ的对象，三层嵌套
    FAQ: [{
      question: "为什么我查看不了课程表、成绩？",
      answerArr: [
        [{
          text: "1、首先检查手机网络是否畅通；再确认你在“"
        }, {
          text: "设置->学号和密码",
          url: "/pages/Subpages/StudentId/StudentId"
        }, {
          text: "”里绑定了个人信息。"
        }],
        [{
          text: "2、尝试在设置里将实时课表打开再关闭。"
        }],
        [{
          text: "3、在浏览器中登录我校教务处官网测试官网是否能够正常服务或学号密码是否正确。"
        }],
      ]
    }, {
      question: "这个小程序隶属于大连工业大学教务处吗？",
      answerArr: [
        [{
          text: "不属于。"
        }],
        [{
          text: "该项目由信息学院集成测控技术研究所MOS小组几位成员在学长影响下开发而成，故而不隶属于学校教务处。本小程序与教务处的关系类似于携程与12306。"
        }]
      ]
    }, {
      question: "为什么考试日程会显示已考完的课程？",
      answerArr: [
        [{
          text: "教务处数据未及时更新。"
        }, ],
      ]
    }, {
      question: "空教室查询结果不准确？",
      answerArr: [
        [{
          text: "1、周末和节假日的空教室结果无法获取。"
        }, ],
        [{
          text: "2、部分课程有临时调动，学校教务处未及时更新。"
        }]
      ]
    }, ]


  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 点击问题区域，一次性只会显示一个答案
   * @param {*} e 
   */
  tapQuestion: function (e) {
    console.log(e)
    if (e.currentTarget.dataset.faqindex == this.data.focusIndex) {
      this.setData({
        focusIndex: -1
      })
    } else {
      this.setData({
        focusIndex: e.currentTarget.dataset.faqindex
      })
    }

  },
  /**
   * 点击可跳转的文字链接
   * @param {*} e 
   */
  jumpToPage: function (e) {
    // console.log(e)
    wx.navigateTo({
      url: e.target.dataset.url,
    })

  }
})