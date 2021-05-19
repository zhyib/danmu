import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    displayConfig: [
      // 'DISPLAY_INTERACT_WORD',
      'DISPLAY_GIFT',
      'DISPLAY_NOTICE_MSG',
    ],
    roomid: '',
    resCode: {
      HEART_BEAT: 2, // 心跳
      HEART_BEAT_RES: 3, // 心跳回应
      MSG: 5, // 通知
      ENTER_ROOM: 7, // 进房
      ENTER_ROOM_RES: 8, // 进房回应
    },
  },
  mutations: {
    updateRoomid(state, { roomid }) {
      state.roomid = roomid;
    },
    updateDisplayConfig(state, { val }) {
      state.displayConfig = val;
    },
  },
  actions: {
  },
  modules: {
  },
});
