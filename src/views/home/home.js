import {
  encode, decode, handlePacket, CONFIG, RES_CODE,
} from './core';

export default {
  name: 'home',
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
  updated() {
    const mainBox = document.getElementById('mainBox');
    const giftBox = document.getElementById('giftBox');
    mainBox.scrollTop = mainBox.scrollHeight;
    console.log(mainBox.scrollTop, mainBox.scrollHeight);
    giftBox.scrollTop = giftBox.scrollHeight;
  },
  methods: {
    connect() {
      const topThis = this;
      const ws = new WebSocket('ws://broadcastlv.chat.bilibili.com:2244/sub');
      this.ws = ws;
      const { roomid } = this;
      CONFIG.ROOM_ID = roomid;
      ws.onopen = function onopen() {
        console.log('Connection open ...');
        try {
          ws.send(encode(RES_CODE.ENTER_ROOM, { roomid }));
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
        reader.readAsArrayBuffer(res.data, 'utf-8');
        reader.onload = function onload() {
          try {
            const buffer = Buffer.from(reader.result);
            const packet = decode(buffer);
            topThis.dispalyPacket(handlePacket(packet));
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
    dispalyPacket(packet) {
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
            break;
          case 'GiftBox':
            this.displayGift += `${bodys[i].body}</br>`;
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
  computed: {
  },
  watch: {
    displayConfig() {
      CONFIG.DISPLAY = this.displayConfig;
    },
  },
};
