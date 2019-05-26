import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
		windowsize: {
			width: 0,
			height: 0
		}
    },
    mutations: {
		SET_SIZE(state, info){
			state.windowsize.width = info.width
			state.windowsize.height = info.height
		}
    }
})

export default store
