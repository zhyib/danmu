import Comment from '@/components/comment/index.vue';
import {
  encode, decode, handlePacket,
} from './core';

export default {
  name: 'home',
  components: { Comment },
  data() {
    return {
      roomid: '',
      displayMain: [],
      displayGift: '',
      popularity: 0,
      ws: null,
      heatBeat: null,
      displayConfig: this.$store.state.displayConfig,
      resCode: this.$store.state.resCode,
      LIMIT_MAIN: 10,
      isConnected: false,
      checkButtons: [
        {
          label: 'DISPLAY_INTERACT_WORD',
          icon: 'fas fa-sign-in-alt',
        },
        {
          label: 'DISPLAY_GIFT',
          icon: 'fas fa-gift',
        },
        {
          label: 'DISPLAY_NOTICE_MSG',
          icon: 'fas fa-volume-up',
        },
      ],
    };
  },
  methods: {
    connect() {
      const { roomid } = this;
      // 检查数字有效性
      if (!/^\d+$/.test(roomid) || +roomid === 0) {
        this.$message({
          message: '请输入有效数字',
          duration: 1000,
          type: 'error',
        });
        return;
      }
      this.$store.commit('updateRoomid', { roomid });

      const topThis = this;
      if (this.ws) {
        this.ws.close();
      }
      this.ws = new WebSocket('ws://broadcastlv.chat.bilibili.com:2244/sub');
      const { ws } = this;

      ws.onopen = function onopen() {
        console.log('Connection open ...');
        try {
          ws.send(encode(topThis.resCode.ENTER_ROOM, { roomid }));
          ws.send(encode(topThis.resCode.HEART_BEAT, { roomid }));
          topThis.heartBeat = setInterval(() => {
            ws.send(encode(topThis.resCode.HEART_BEAT, { roomid }));
          }, 30000);
          topThis.isConnected = true;
        } catch (e) {
          console.log(e);
        }
      };

      /**
       * @description callback when a msg receives
       * @param res {Object}
       */
      ws.onmessage = function onmessage(res) {
        // res.data is a blob
        const reader = new FileReader();
        reader.readAsArrayBuffer(res.data);
        reader.onload = function onload() {
          try {
            const buffer = Buffer.from(reader.result);
            const packet = decode(buffer);
            topThis.displayPacket(handlePacket(packet));
          } catch (e) {
            console.log(e);
          }
        };
      };

      /**
       * @description callback when ws closing
       * @param res {Object}
       */
      ws.onclose = function onclose(res) {
        topThis.$message({
          message: '连接已断开',
          type: 'success',
        });
        console.log('Connection closed.');
      };
    },
    disconnect() {
      // 终止心跳包发送
      clearInterval(this.heatBeat);
      this.isConnected = false;
      this.ws.close();
    },
    displayPacket(packet) {
      switch (packet.type) {
        case 'HEART_BEAT_RES':
          this.popularity = packet.body[0];
          break;
        case 'MSG':
          this.handleMsg(packet);
          break;
        case 'ENTER_ROOM_RES':
          this.$message({
            message: packet.body[0],
            type: 'success',
          });
          break;
        default:
          throw new Error('Cannot handle: Unknown operation.');
      }
    },
    handleMsg(packet) {
      const bodys = packet.body;
      for (let i = 0; i < bodys.length; i++) {
        const inner = bodys[i];
        switch (inner.type) {
          case 'MainBox':
            this.displayMain.push(bodys[i].body);
            this.$nextTick(() => {
              this.$refs.mainCol.scrollTop = this.$refs.mainBox.scrollHeight;
            });
            break;
          case 'GiftBox':
            this.displayGift += `${bodys[i].body}</br>`;
            this.$nextTick(() => {
              this.$refs.giftCol.scrollTop = this.$refs.giftBox.scrollHeight;
            });
            break;
          case 'Hide':
            break;
          case 'Unknown':
            console.log(inner);
            break;
          default:
            throw new Error(`Cannot display: Unhandled type, ${inner.type}`);
        }
      }
    },
    clear() {
      this.displayMain = [];
    },
    handleChange(val) {
      this.$store.commit('updateDisplayConfig', { val });
    },
  },
  computed: {
  },
  watch: {
  },
};
