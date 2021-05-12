import medal from '@/components/medal/index';
import {
  encode, decode, handlePacket, CONFIG, RES_CODE,
} from './core';

export default {
  name: 'home',
  components: { medal },
  data() {
    return {
      roomid: '',
      displayMain: '',
      displayGift: '',
      popularity: 0,
      ws: null,
      displayConfig: CONFIG.DISPLAY,
    };
  },
  methods: {
    connect() {
      const topThis = this;
      const ws = new WebSocket('ws://broadcastlv.chat.bilibili.com:2244/sub');
      this.ws = ws;
      const { roomid } = this;

      if (!/^\d+$/.test(roomid) || +roomid === 0) {
        this.$message({
          message: '请输入有效数字',
          duration: 1000,
          type: 'error',
        });
        return;
      }

      CONFIG.ROOM_ID = roomid;
      ws.onopen = function onopen() {
        console.log('Connection open ...');
        try {
          ws.send(encode(RES_CODE.ENTER_ROOM, { roomid }));
          ws.send(encode(RES_CODE.HEART_BEAT, { roomid }));
          setInterval(() => {
            ws.send(encode(RES_CODE.HEART_BEAT, { roomid }));
          }, 30000);
        } catch (e) {
          console.log(e);
        }
      };

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

      ws.onclose = function onclose(res) {
        topThis.$message({
          message: '连接已断开',
          type: 'success',
        });
        console.log('Connection closed.');
      };
    },
    disconnect() {
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
          throw new Error('Cannot hanlde: Unknown operarion.');
      }
    },
    handleMsg(packet) {
      const bodys = packet.body;
      for (let i = 0; i < bodys.length; i++) {
        const inner = bodys[i];
        switch (inner.type) {
          case 'MainBox':
            this.displayMain += `${bodys[i].body}</br>`;
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
  },
  computed: {},
  watch: {
    displayConfig() {
      CONFIG.DISPLAY = this.displayConfig;
    },
  },
};
