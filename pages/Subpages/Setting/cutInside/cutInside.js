/**
 * Created by sail on 2017/6/1.
 */
import WeCropper from './we-cropper/we-cropper.js'

const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight

let bgImgHeight = wx.getStorageSync(`bgImgHeight`)
if (bgImgHeight === null ||bgImgHeight==='') {
    let systemInfo = wx.getSystemInfoSync()
    // px转换到rpx的比例
    let pxToRpxScale = 750 / systemInfo.windowWidth;
    // 图片的高度
    let ktxWindowHeight = systemInfo.windowHeight * pxToRpxScale - 83.2 * pxToRpxScale
    wx.setStorageSync(`bgImgHeight`, ktxWindowHeight)
    bgImgHeight = ktxWindowHeight
}
const imgHeight = 300*(bgImgHeight/750)

Page({
    data: {
        cropperOpt: {
            id: 'cropper',
            targetId: 'targetCropper',
            pixelRatio: device.pixelRatio,
            width,
            height,
            scale: 2.5,
            zoom: 8,
            cut: {
                x: (width - 300) / 2,
                y: (height - imgHeight) / 2,
                width: 300,
                height: imgHeight
            },
            boundStyle: {
                color: '#3EA3D8',
                mask: 'rgba(0,0,0,0.8)',
                lineWidth: 1
            }
        }
    },
    touchStart(e) {
        this.cropper.touchStart(e)
    },
    touchMove(e) {
        this.cropper.touchMove(e)
    },
    touchEnd(e) {
        this.cropper.touchEnd(e)
    },
    getCropperImage() {
        wx.showLoading({title: "加载中···"})

        let FSM = wx.getFileSystemManager();
        this.cropper.getCropperImage()
            .then((src) => {
                console.log(src)
                FSM.getFileInfo({
                    filePath: src,
                    success: r => {
                        console.log("剪裁图片大小", r)
                    }
                })

                FSM.saveFile({
                    tempFilePath: src, // 传入一个本地临时文件路径
                    success(res) {
                        let bgImg = wx.getStorageSync(`bgImg`)
                        if (bgImg){
                            FSM.removeSavedFile({
                                filePath: bgImg,
                                success: r => {
                                    wx.removeStorageSync(`bgImg`)
                                    console.log(`移除成功`)
                                }
                            })
                        }
                        //console.log(res.savedFilePath) // res.savedFilePath 为一个本地缓存文件路径
                        wx.setStorageSync(`bgImg`, res.savedFilePath)
                        wx.hideLoading()
                        let pages = getCurrentPages();//当前页面栈

                        if (pages.length > 1) {
                            let beforePage = pages[pages.length - 2];//获取上一个页面实例对象
                            beforePage.setData({       //如果需要传参，可直接修改A页面的数据，若不需要，则可省去这一步
                                bgImg: res.savedFilePath
                            })
                        }

                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })

            })
            .catch((err) => {
                wx.showModal({
                    title: '温馨提示',
                    content: err.message
                })
            })
    },

    onLoad(option) {
        const {cropperOpt} = this.data

        cropperOpt.boundStyle.color = '#3EA3D8'

        this.setData({cropperOpt})

        this.cropper = new WeCropper(cropperOpt)
            .on('ready', (ctx) => {
                console.log(`wecropper is ready for work!`)
            })
            .on('beforeImageLoad', (ctx) => {
                wx.showToast({
                    title: '上传中',
                    icon: 'loading',
                    duration: 20000
                })
            })
            .on('imageLoad', (ctx) => {
                wx.hideToast()
            })


        wx.getFileSystemManager().getFileInfo({
            filePath: option.src,
            success: r => {
                console.log("图片原始大小", r)
                wx.hideLoading()
            }
        })
        wx.compressImage({
            src: option.src, // 图片路径
            quality: 100, // 压缩质量
            success: r => {
                this.cropper.pushOrign(r.tempFilePath)
            }
        })

    }
})
