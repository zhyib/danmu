// const WebSocket = require('ws');
import pako from 'pako';

const RES_CODE = {
  HEART_BEAT: 2, // 心跳
  HEART_BEAT_RES: 3, // 心跳回应
  MSG: 5, // 通知
  ENTER_ROOM: 7, // 进房
  ENTER_ROOM_RES: 8, // 进房回应
};

const CONFIG = {
  DISPLAY_INTERACT_WORD: true,
  DISPLAY_GIFT: true,
  DISPLAY_NOTICE_MSG: false,
};

function readIntFromBuffer(buffer, offset, length) {
  let ret = 0;
  for (let i = offset; i < offset + length; i++) {
    ret *= 256;
    ret += (+buffer[i]);
  }
  return ret;
}

function encode(operation, params = {}) {
  if (params.roomid === undefined) {
    throw new Error('Must have a roomid');
  }
  const requestHead = Buffer.from([0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, operation, 0, 0, 0, 1]);

  const clientver = '1.6.3' || params.clientver;
  const platform = 'web' || params.platform;
  const protover = 2 || params.protover;
  const { roomid } = params;
  const type = 2;
  const uid = 0;
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
  };
  // console.log(packet);
  if (packet.operation === RES_CODE.ENTER_ROOM_RES) {
    // enter room response
    packet.body = [];
  } else if (packet.operation === RES_CODE.HEART_BEAT_RES) {
    // heart beat response
    packet.body = [readIntFromBuffer(buffer, 16, packet.packetLength - packet.headerLength)];
  } else if (packet.operation === RES_CODE.MSG) {
    let unzipped;

    try {
      unzipped = Buffer.from(pako.inflate(buffer.slice(packet.headerLength)));
    } catch (e) {
      // console.log(e, packet.operation, buffer.slice(packet.headerLength).toString());
      packet.body.push(JSON.parse(buffer.slice(packet.headerLength).toString()));
    }

    if (unzipped) {
      // 同一条 message 中可能存在多条信息，用正则筛出来
      const group = unzipped.toString().split(/[\x00-\x1f]+/);
      group.forEach((item) => {
        try {
          packet.body.push(JSON.parse(item));
        } catch (e) {
          // 忽略非 JSON 字符串，通常情况下为分隔符
        }
      });
    }
  } else {
    throw new Error('Decode faied: Invalid operation');
  }
  // console.log(packet);
  return packet;
}

function handleComboSend(item) {
  const { data } = item;
  return {
    type: 'ComboSend',
    body: `${data.uname} ${data.action} ${data.gift_name} * ${data.total_num}`,
    raw: data,
  };
}

function handleDanmuMsg(item) {
  return {
    type: 'DanmuMsg',
    body: `${item.info[2][1]}说：${item.info[1]}`,
    raw: item.info,
  };
}

function handleEntryEffect(item) {
  const { data } = item;
  return {
    type: 'EntryEffect',
    body: `${data.copy_writing}`,
    raw: data,
  };
}

function handleHotRankChanged(item) {
  const { data } = item;
  return {
    type: 'HotRankChanged',
    body: `分区榜单：${data.area_name} ${data.rank}`,
    raw: data,
  };
}

function handleInteractWord(item) {
  const { data } = item;
  return {
    type: 'InteractWord',
    body: `${data.uname} 进入房间`,
    raw: data,
  };
}

function handleNoticeMsg(item) {
  return {
    type: 'NoticeMsg',
    body: `${item.msg_common}`,
    raw: item,
  };
}

function handleOnlineRankV2(item) {
  // console.log('ONLINE_RANK_V2');
}

function handleRoomRank(item) {
  const { data } = item;
  return {
    type: 'RoomRank',
    body: `小时榜单：${data.rank_desc}`,
    raw: data,
  };
}

function handleRoomRealTimeMessageUpdate(item) {
  const { data } = item;
  return {
    type: 'RoomRealTimeMessageUpdate',
    body: `${data.roomid}直播间状态更新：粉丝数${data.fans}，粉丝团${data.fans_club}`,
    raw: data,
  };
}

function handleSendGift(item) {
  const { data } = item;
  return {
    type: 'SendGift',
    body: `${data.uname} ${data.action} ${data.giftName} * ${data.num}`,
    raw: data,
  };
}

function handleSuperChatMessage(item) {
  const { data } = item;
  return {
    type: 'SuperChatMessage',
    body: `${data.user_info.uname} 的 ${data.price} 元 ${data.gift.gift_name}：${data.message}`,
    raw: data,
  };
}

function handleWidgetBanner(item) {
  const subData = item.data.widget_list[4].sub_data;
  return {
    type: 'WidgetBanner',
    body: 'WidgetBanner',
    raw: JSON.parse(decodeURIComponent(subData)),
  };
}

const handlers = {
  COMBO_SEND: handleComboSend, // ZIPPED
  DANMU_MSG: handleDanmuMsg, // ZIPPED
  ENTRY_EFFECT: handleEntryEffect, // ZIPPED
  HOT_RANK_CHANGED: handleHotRankChanged,
  INTERACT_WORD: handleInteractWord, // ZIPPED
  NOTICE_MSG: handleNoticeMsg,
  ONLINE_RANK_V2: handleOnlineRankV2,
  ROOM_RANK: handleRoomRank,
  ROOM_REAL_TIME_MESSAGE_UPDATE: handleRoomRealTimeMessageUpdate,
  SEND_GIFT: handleSendGift, // ZIPPED
  SUPER_CHAT_MESSAGE: handleSuperChatMessage,
  SUPER_CHAT_MESSAGE_JPN: handleSuperChatMessage,
  WIDGET_BANNER: handleWidgetBanner,
};

function handleMessage(packet) {
  const ret = {
    type: 'MSG',
    body: [],
  };
  packet.body.forEach((item) => {
    if (item >= 0 && item <= 9) {
      //
    } else if (handlers[item.cmd] !== undefined) {
      ret.body.push(handlers[item.cmd](item));
    } else {
      ret.body.push({
        type: 'DEFAULT',
        body: item,
      });
    }
  });
  return ret;
}

function handlePacket(packet) {
  switch (packet.operation) {
    case RES_CODE.HEART_BEAT_RES:
      return {
        type: 'HEART_BEAT_RES',
        body: [packet.body[0]],
      };
    case RES_CODE.MSG:
      return handleMessage(packet);
    case RES_CODE.ENTER_ROOM_RES:
      return {
        type: 'ENTER_ROOM_RES',
        body: [`连接房间${CONFIG.ROOM_ID}成功`],
      };
    default:
      throw new Error('Cannot hanlde: Unknown operarion');
  }
}

export {
  encode,
  decode,
  handlePacket,
  CONFIG,
  RES_CODE,
};