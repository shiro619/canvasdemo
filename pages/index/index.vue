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
				var img_data = data,
				i, i2, t,
				h = img_data.height,
				w = img_data.width;
				var new_data = {
					data: [],
					width: img_data.height,
					height: img_data.width
				}
				for (var dx = 0; dx < w; dx ++) {
					for (var dy = 0; dy < h; dy ++) {
						var nx = h - dy - 1
						var ny = dx
						var i = (dy << 2) * w + (dx << 2)
						var i2 = (ny << 2) * h + (nx << 2)
						if(i > 390 && i < 410) {
							console.log(i, i2)
						}
						for (var p = 0; p < 4; p ++) {
							t = img_data.data[i + p]
							new_data.data[i2 + p] = t
						}
					}
				}
				const nd = Uint8ClampedArray.from(new_data.data)
				return img_data
				// return {
				// 	width: new_data.height,
				// 	height: new_data.width,
				// 	data: nd
				// }
			},
			canvastap(e) {
				const res = this.canvasEventDetail(e)
				if (res.isMove) {
					this.imgs[this.topimg].canMove = true
					this.imgs[res.other].canMove = false
					this.drawCanvas()
				} else if (res.isFun) {
					if (res.isFun === 2) {
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
						uni.canvasGetImageData({
							canvasId: 'customCanvas',
							x: info.x,
							y: info.y,
							width: info.w,
							height: info.h,
							success: (res) => {
								const res1 = this.imgRotate(res)
								console.log(res)
								console.log(res1)
								this.drawCanvas(res1)
							}
						})
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
					this.drawCanvas()
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
						this.onMoving = false
					}
					set(res) {
						console.log('setarg:')
						console.log(res)
						const ctx = _this.myCanvas
						if (this.deg) {
							const tranX = _this.windowsize.width / 2 - (this.x + (this.w / 2))
							const tranY = _this.windowsize.height / 2 - (this.y + (this.h / 2))
							// switch (this.deg) {
							// 	case 90: ctx.translate(tranX, 0);
							// 	break;
							// 	case 180: ctx.translate(0, tranY);
							// 	break;
							// 	case 270: ctx.translate(tranX, tranY);
							// 	break;
							// }
							// ctx.translate(tranX, tranY);
							// ctx.rotate(this.deg * Math.PI / 180)
							// ctx.translate(-tranX, -tranY);
						}
						console.log('deg' + this.deg)
						if(this.deg && res) {
							console.log('put')
							uni.canvasPutImageData({
								canvasId: 'customCanvas',
								data: res.data,
								x: this.x,
								y: this.y,
								width: this.w,
								height: this.h,
								success: (res) => {
									console.log(res)
								}
							})
						} else {
							console.log('set')
							_this.myCanvas.drawImage(this.url, this.x, this.y, this.w, this.h)
						}
						if (this.canMove) {
							// 方框
							ctx.beginPath()
							ctx.strokeStyle = "black"
							ctx.lineWidth = 2
							ctx.strokeRect(this.x, this.y, this.w, this.h)
							// 移动按钮
							_this.myCanvas.drawImage('/static/move.png', this.x - 20, this.y - 20, 20, 20)
							// 旋转按钮
							_this.myCanvas.drawImage('/static/redo.png', this.x + this.w, this.y - 20, 20, 20)
							// 放大缩小按钮
							_this.myCanvas.drawImage('/static/size.png', this.x + this.w, this.y + this.h, 20, 20)
							// 删除按钮
							_this.myCanvas.drawImage('/static/delete.png', this.x - 20, this.y + this.h, 20, 20)
							// ctx.moveTo(this.x, this.y)
							// ctx.lineTo(this.x, this.y + this.h)
							// ctx.lineTo(this.x + this.w, this.y + this.h)
							// ctx.lineTo(this.x + this.w, this.y)
							// ctx.closePath()
						}
					}
					move(x, y) {
						this.x = x
						this.y = y
					}
				}
				const img1 = new MyImage(0, '/static/1.jpg', 10, 10, 100, 200)
				const img2 = new MyImage(1, '/static/2.jpg', 50, 50, 100, 200)
				_this.imgs.push(img1)
				_this.imgs.push(img2)
				_this.drawCanvas()
			},
			drawCanvas(res) {
				// this.myCanvas.clearRect(0, 0, this.windowsize.width, this.windowsize.height)
				this.imgs[this.topimg ? 0 : 1].set()
				this.imgs[this.topimg].set(res || null)
				this.myCanvas.draw()
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
