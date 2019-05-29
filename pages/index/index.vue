<template>
	<view class="content">
		<canvas canvas-id='customCanvas' class="bordercan" :style="{width: windowsize.width + 'px', height: windowsize.height + 'px'}" @tap="canvastap" @touchstart="canvasMoveStart" @touchend="canvasMoveEnd" @touchmove="canvasMove"></canvas>
	</view>
</template>

<script>
	import {
	    mapState,
	    mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				title: 'Hello',
				myCanvas: null,
				imgs: [],
				topimg: 1
			}
		},
		computed: {
			...mapState(['windowsize'])
		},
		onLoad() {

		},
		methods: {
			// 事件信息
			canvasEventDetail(e) {
				console.log(e)
				let x = e.touches[0].clientX || e.touches[0].x
				let y = e.touches[0].clientY || e.touches[0].y
				let ix = this.imgs[this.topimg].x
				let iy = this.imgs[this.topimg].y
				let iw = this.imgs[this.topimg].w
				let ih = this.imgs[this.topimg].h
				let ex = this.imgs[this.topimg].x + this.imgs[this.topimg].w
				let ey = this.imgs[this.topimg].y + this.imgs[this.topimg].h
				const other = this.topimg ? 0 : 1
				let oix = this.imgs[other].x
				let oiy = this.imgs[other].y
				let oex = this.imgs[other].x + this.imgs[other].w
				let oey = this.imgs[other].y + this.imgs[other].h
				let isMove = (x >= ix && x <= ex && y >= iy && y <= ey) || (x >= ix - 20 && x <= ix && y >= iy - 20 && y <= iy)
				let isFun = 0
				if (x >= ix - 20 && x <= ix && y >= iy - 20 && y <= iy){
					isFun = 1
				} else if (x >= ix + iw && x <= ix + iw + 20 && y >= iy - 20 && y <= iy) {
					isFun = 2
				} else if (x >= ix - 20 && x <= ix && y >= iy + ih && y <= iy + ih + 20) {
					isFun = 3
				} else if (x >= ix + iw && x <= ix + iw + 20 && y >= iy + ih && y <= iy + ih + 20) {
					isFun = 4
				}
				let isOther = !isMove && !isFun && (x >= oix && x <= oex && y >= oiy && y <= oey)
				let isNo = !isMove && !isOther
				return {
					x, // 事件x
					y, // 事件y
					ix, // 主图x
					iy, // 主图y
					iw, // 主图w
					ih, // 主图h
					ex, // 主图右下x
					ey, // 主图右下y
					oix, // 副图x
					oiy, // 副图y
					oex, // 副图右下x
					oey, // 副图右下y
					isMove, // 主图范围内
					isFun, // 主图功能按钮内
					isOther, // 副图范围内
					isNo, // 不在图内
					other: this.topimg ? 0 : 1
				}
			},
			// 处理像素数据
			imgRotate(data) {
				console.log('rotateData')
				var img_data = data,
				i, i2, t,
				h = img_data.height,
				w = img_data.width;
				var new_data = {
				    data: new Uint8ClampedArray(4 * w * h),
				    width: h,
				    height: w
				}
				for (var dx = 0; dx < w; dx ++) {
					for (var dy = 0; dy < h; dy ++) {
						var nx = h - dy - 1
						var ny = dx
						var i = (dy << 2) * w + (dx << 2)
						var i2 = (ny << 2) * h + (nx << 2)
						// if(i > 390 && i < 410) {
						// 	console.log(i, i2)
						// }
						for (var p = 0; p < 4; p ++) {
							t = img_data.data[i + p]
							new_data.data[i2 + p] = t
						}
					}
				}
				// new_data.data = Uint8ClampedArray.from(new_data.data)
				return new_data
			},
			imgTranspose (srcImageData) {
				function createImageData(w, h) {
				    return {
				        data: new Uint8ClampedArray(4 * w * h),
				        width: w,
				        height: h
				    }
				    // return _context.createImageData(w, h);
				}
			    var srcPixels = srcImageData.data,
			        srcWidth = srcImageData.width,
			        srcHeight = srcImageData.height,
			        srcLength = srcPixels.length,
			        dstImageData = createImageData(srcHeight, srcWidth),
			        dstPixels = dstImageData.data;
			
			    var srcIndex, dstIndex;
			
			    for (var y = 0; y < srcHeight; y += 1) {
			        for (var x = 0; x < srcWidth; x += 1) {
			            srcIndex = (y * srcWidth + x) << 2;
			            dstIndex = (x * srcHeight + y) << 2;
			
			            dstPixels[dstIndex] = srcPixels[srcIndex];
			            dstPixels[dstIndex + 1] = srcPixels[srcIndex + 1];
			            dstPixels[dstIndex + 2] = srcPixels[srcIndex + 2];
			            dstPixels[dstIndex + 3] = srcPixels[srcIndex + 3];
			        }
			    }
			
			    return dstImageData;
			},
			canvastap(e) {
				const res = this.canvasEventDetail(e)
				if (res.isMove) {
					if (!this.imgs[this.topimg].canMove) { // 减少渲染
						this.imgs[this.topimg].canMove = true
						this.imgs[res.other].canMove = false
						this.drawCanvas()
					}
				} else if (res.isFun) {
					if (res.isFun === 2) {
						console.log('fun2')
						const dotX = this.imgs[this.topimg].x + (this.imgs[this.topimg].w / 2)
						const dotY = this.imgs[this.topimg].y + (this.imgs[this.topimg].h / 2)
						this.imgs[this.topimg].deg += 90
						if (this.imgs[this.topimg].deg === 360) {
							this.imgs[this.topimg].deg = 0
						}
						[this.imgs[this.topimg].w, this.imgs[this.topimg].h] = [this.imgs[this.topimg].h, this.imgs[this.topimg].w]; // 调换宽高
						const info = {
							x: dotX - this.imgs[this.topimg].h / 2,
							y: dotY - this.imgs[this.topimg].w / 2,
							w: this.imgs[this.topimg].w,
							h: this.imgs[this.topimg].h
						}
						this.imgs[this.topimg].x = info.x
						this.imgs[this.topimg].y = info.y
						const data = {
							data: this.imgs[this.topimg].data,
							width: this.imgs[this.topimg].h,
							height: this.imgs[this.topimg].w
						}
						const res = this.imgRotate(data)
						this.imgs[this.topimg].data = res
						this.drawCanvas()
					}
				} else if (res.isOther){
					this.imgs[res.other].canMove = true
					this.imgs[this.topimg].canMove = false
					this.topimg = res.other
					this.drawCanvas()
				} else {
					this.imgs[res.other].canMove = false
					this.imgs[this.topimg].canMove = false
					this.drawCanvas()
				}
			},
			canvasMoveStart(e) {
				return
				console.log('startmove')
				const res = this.canvasEventDetail(e)
				if (res.isMove) {
					this.imgs[this.topimg].oldx = res.x - res.ix
					this.imgs[this.topimg].oldy = res.y - res.iy
					this.imgs[this.topimg].onMoving = true
				}
			},
			canvasMoveEnd(e) {
				this.imgs[this.topimg].onMoving = false
			},
			canvasMove(e) {
				console.log('move')
				const res = this.canvasEventDetail(e)
				console.log(this.imgs[this.topimg].oldx, this.imgs[this.topimg].oldy, res.x, res.y)
				if (this.imgs[this.topimg].onMoving) {
					console.log('canMove')
					this.imgs[this.topimg].x = (res.x - this.imgs[this.topimg].oldx)
					this.imgs[this.topimg].y = (res.y - this.imgs[this.topimg].oldy)
					this.drawCanvas(null, true)
				}
			},
			setcanvas() {
				const _this = this
				_this.myCanvas = uni.createCanvasContext('customCanvas')
				// _this.drawCanvas(this.myCanvas)
				class MyImage {
					constructor(id, url, x = 0, y = 0, w = 100, h = 200) {
						this.id = id
						this.url = url,
						this.x = x,
						this.y = y,
						this.oldx = 0,
						this.oldy = 0,
						this.w = w,
						this.h = h,
						this.deg = 0,
						this.canMove = false,
						this.onMoving = false,
						this.data = null
					}
				}
				const img1 = new MyImage(0, '/static/1.jpg', 10, 10, 100, 200)
				const img2 = new MyImage(1, '/static/2.jpg', 50, 50, 100, 200)
				_this.imgs.push(img1)
				_this.imgs.push(img2)
				_this.myCanvas.drawImage(img1.url, img1.x, img1.y, img1.w, img1.h)
				// _this.myCanvas.drawImage(img2.url, img2.x, img2.y, img2.w, img2.h)
				_this.myCanvas.draw(true, () => {
					uni.canvasGetImageData({
						canvasId: 'customCanvas',
						x: img1.x,
						y: img1.y,
						width: img1.w,
						height: img1.h,
						success: (res) => {
							img1.data = res.data
							_this.myCanvas.drawImage(img2.url, img2.x, img2.y, img2.w, img2.h)
							_this.myCanvas.draw(true, () => {
								uni.canvasGetImageData({
									canvasId: 'customCanvas',
									x: img2.x,
									y: img2.y,
									width: img2.w,
									height: img2.h,
									success: (res1) => {
										img2.data = res1.data
										// _this.drawCanvas()
										console.log(img1,img2)
									}
								})
							})
						}
					})
				})
			},
			drawCanvas() {
				console.log('draw')
				const _this = this
				const ctx = _this.myCanvas
				// ctx.clearRect(0, 0, this.windowsize.width, this.windowsize.height)
				const imgA = _this.imgs[_this.topimg]
				const imgB = _this.imgs[this.topimg ? 0 : 1]
				const drawFun = () => {
					if (imgA.canMove) {
						// 方框
						ctx.beginPath()
						ctx.strokeStyle = "black"
						ctx.lineWidth = 2
						ctx.strokeRect(imgA.x, imgA.y, imgA.w, imgA.h)
						// 移动按钮
						ctx.drawImage('/static/move.png', imgA.x - 20, imgA.y - 20, 20, 20)
						// 旋转按钮
						ctx.drawImage('/static/redo.png', imgA.x + imgA.w, imgA.y - 20, 20, 20)
						// 放大缩小按钮
						ctx.drawImage('/static/size.png', imgA.x + imgA.w, imgA.y + imgA.h, 20, 20)
						// 删除按钮
						ctx.drawImage('/static/delete.png', imgA.x - 20, imgA.y + imgA.h, 20, 20)
					}
					_this.myCanvas.draw(true)
				}
				// console.log(imgA.data)
				uni.canvasPutImageData({
				    canvasId: 'customCanvas',
				    data: imgB.data,
				    x: imgB.x,
				    y: imgB.y,
				    width: imgB.w,
				    height: imgB.h,
				    success: res => {
						console.log(res)
						console.log('hahahaput')
						uni.canvasPutImageData({
						    canvasId: 'customCanvas',
						    data: imgA.data,
						    x: imgA.x,
						    y: imgA.y,
						    width: imgA.w,
						    height: imgA.h,
						    complete: res => {
								drawFun()
							},
						})
				    }
				})
			}
		},
		onReady() {
			this.setcanvas()
			
			
		}
	}
</script>

<style>
	.content {
		text-align: center;
		height: 400upx;
	}

	.logo {
		height: 200upx;
		width: 200upx;
		margin-top: 200upx;
	}

	.title {
		font-size: 36upx;
		color: #8f8f94;
	}
</style>
