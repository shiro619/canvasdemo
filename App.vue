<script>
	import {
	    mapState,
	    mapMutations
	} from 'vuex'
	export default {
		onLaunch: function() {
			console.log('App Launch');
			const width = uni.getSystemInfoSync().windowWidth
			const height = uni.getSystemInfoSync().windowHeight
			this.SET_SIZE({width, height})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			...mapMutations(['SET_SIZE']),
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
