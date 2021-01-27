const WebSocket = require('ws');
const pako = require('pako');

const ROOM_ID = 350964;
// const ROOM_ID = 92613;

const HEART_BEAT = 2;       // 心跳
const HEART_BEAT_RES = 3;   // 心跳回应
const MSG = 5;              // 通知
const ENTER_ROOM = 7;       // 进房
const ENTER_ROOM_RES = 8;   // 进房回应

const DISPLAY_INTERACT_WORD = true;
const DISPLAY_GIFT = true;
const DISPLAY_NOTICE_MSG = false;

let timeHotRank = 0;
let timeRoomRank = 0;

function readIntFromBuffer(buffer, offset, length) {
  let ret = 0;
  for (let i = offset; i < offset + length; i++) {
    ret *= 256;
    ret = ret + (+buffer[i]);
  }
  return ret;
}

function encode(operation, params = {}) {
  const requestHead = Buffer.from([0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, operation, 0, 0, 0, 1]);

  const clientver = '1.6.3' || params.clientver;
  const platform = 'web' || params.platform;
  const protover = 2 || params.protover;
  const roomid = ROOM_ID || params.roomid;
  const uid = 0;
  const type = 2 || params/type;
  const requestBody = Buffer.from(`{"clientver":"${clientver}","platform":"${platform}","protover":${protover},"roomid":${roomid},"uid":${uid},"type":${type}}`);
  
  const request = Buffer.concat([requestHead, requestBody], requestHead.length + requestBody.length);
  request[3] = request.length;
  return request;
}

function decode(buffer) {
  const packet = {
    packetLength: readIntFromBuffer(buffer, 0, 4),
    headerLength: readIntFromBuffer(buffer, 4, 2),
    protocolVersion: readIntFromBuffer(buffer, 6, 2),
    operation: readIntFromBuffer(buffer, 8, 4),
    sequenceId: readIntFromBuffer(buffer, 12, 4),
    body: [],
  }
  if (packet.operation === ENTER_ROOM_RES) {
    // enter room response
    packet.body = [];
  } else if (packet.operation == HEART_BEAT_RES) {
    // heart beat response
    packet.body = [readIntFromBuffer(buffer, 16, packet.packetLength - packet.headerLength)];
  } else {
    let unzipped;

    try {
      unzipped = Buffer.from(pako.inflate(buffer.slice(packet.headerLength)));
    } catch(e) {
      // console.log(e, packet.operation, buffer.slice(packet.headerLength).toString());
      packet.body.push(JSON.parse(buffer.slice(packet.headerLength).toString()));
    }

    if (unzipped) {
      // 同一条 message 中可能存在多条信息，用正则筛出来
      const group = unzipped.toString().split(/[\x00-\x1f]+/);
      group.forEach(item => {
        try {
          packet.body.push(JSON.parse(item));
        } catch(e) {
          // 忽略非 JSON 字符串，通常情况下为分隔符
        }
      });
    }
  }
  // console.log(packet);
  return packet;
}

function handlePacket(packet) {
  switch(packet.operation) {
    case HEART_BEAT_RES:
      // console.log('HEART_BEAT_RES');
      console.log('人气值：', packet.body[0]);
      break;
    case MSG:
      handleMessage(packet);
      break;
    case ENTER_ROOM_RES:
      console.log(`连接房间${ROOM_ID}成功`);
      break;
    default:
      console.log('Unknown operarion');
      break;
  }
}

function handleDanmuMsg(item) {
  console.log(`${item.info[2][1]}说：${item.info[1]}`);
}

function handleComboSend(item) {
  const data = item.data;
  if (DISPLAY_GIFT) {
    console.log(`${data.uname} ${data.action} ${data.gift_name} * ${data.total_num}`);
  }
}

function handleEntryEffect(item) {
  const data = item.data;
  console.log(`${data.copy_writing}`);
}

function handleHotRankChanged(item) {
  const data = item.data;
  if (timeHotRank !== data.timestamp) {
    timeHotRank = data.timestamp;
    console.log(`分区榜单：${data.area_name} ${data.rank}`);
  }
}

function handleInteractWord(item) {
  const data = item.data;
  if (DISPLAY_INTERACT_WORD) {
    console.log(`${data.uname} 进入房间`);
  }
}

function handleNoticeMsg(item) {
  if (DISPLAY_NOTICE_MSG) {
    console.log(`${item.msg_common}`);
  }
}

/**
 * 高能榜
 * @param {Object} item 
 */
function handleOnlineRankV2(item) {
  // console.log('ONLINE_RANK_V2');
}

function handleRoomRank(item) {
  const data = item.data;
  if (timeRoomRank !== data.timestamp) {
    timeHotRank = data.timestamp;
    // console.log(`小时榜单：${data.rank_desc}`);
  }
}

function handleRoomRealTimeMessageUpdate(item) {
  const data = item.data;
  console.log(`${data.roomid}直播间状态更新：粉丝数${data.fans}，粉丝团${data.fans_club}`)
}

function handleSendGift(item) {
  const data = item.data;
  if (DISPLAY_GIFT) {
    console.log(`${data.uname} ${data.action} ${data.giftName} * ${data.num}`);
  }
}

function handleSuperChatMessage(item) {
  const data = item.data;
  console.log(`${data.user_info.uname} 的 ${data.price} 元 ${data.gift.gift_name}：${data.message}`)
}

function handleWidgetBanner(item) {
  const sub_data = item.data.widget_list[4].sub_data;
  // console.log(JSON.parse(decodeURIComponent(sub_data)));
}

const handlers = {
  'COMBO_SEND': handleComboSend,  // ZIPPED
  'DANMU_MSG': handleDanmuMsg,  // ZIPPED
  'ENTRY_EFFECT': handleEntryEffect,  // ZIPPED
  'HOT_RANK_CHANGED': handleHotRankChanged,
  'INTERACT_WORD': handleInteractWord,  // ZIPPED
  'NOTICE_MSG': handleNoticeMsg,
  'ONLINE_RANK_V2': handleOnlineRankV2,
  'ROOM_RANK': handleRoomRank,
  'ROOM_REAL_TIME_MESSAGE_UPDATE': handleRoomRealTimeMessageUpdate,
  'SEND_GIFT': handleSendGift,  // ZIPPED
  'SUPER_CHAT_MESSAGE': handleSuperChatMessage,
  'SUPER_CHAT_MESSAGE_JPN': handleSuperChatMessage,
  'WIDGET_BANNER': handleWidgetBanner,
}

function handleMessage(packet) {
  packet.body.forEach((item) => {
    if (item >= 0 && item <= 9) {
      return;
    }
    if (handlers[item.cmd] !== undefined) {
      handlers[item.cmd](item);
    } else {
      console.log('DEFAULT', item);
    }
  })
}

const ws = new WebSocket('ws://broadcastlv.chat.bilibili.com:2244/sub');

ws.onopen = function() {
  console.log('Connection open ...');
  try {
    ws.send(encode(ENTER_ROOM));
    setInterval(function () {
      ws.send(encode(HEART_BEAT));
    }, 30000);
  } catch(e) {
    console.log(e);
  }
};

ws.onmessage = function(res) {
  const buffer = Buffer.from(res.data);
  const packet = decode(buffer);
  handlePacket(packet);
};

ws.onclose = function(evt) {
  console.log('Connection closed.');
};