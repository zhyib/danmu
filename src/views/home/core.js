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
  DISPLAY: [
    // 'DISPLAY_INTERACT_WORD',
    'DISPLAY_GIFT',
    'DISPLAY_NOTICE_MSG',
  ],
};

const TYPE = {
  HIDE: 'Hide',
  MAIN_BOX: 'MainBox',
  GIFT_BOX: 'GiftBox',
  UNKNOWN: 'Unknown',
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
    throw new Error('Decode failed: Invalid operation');
  }
  // console.log(packet);
  return packet;
}

function handleComboSend(item) {
  const { data } = item;
  if (CONFIG.DISPLAY.indexOf('DISPLAY_GIFT') !== -1) {
    return {
      type: TYPE.GIFT_BOX,
      body: `${data.uname} ${data.action} ${data.gift_name} 共 ${data.total_num} 个`,
      raw: data,
    };
  }
  return {
    type: TYPE.HIDE,
  };
}

function handleDanmuMsg(item) {
  // console.log(item.info);
  const ret = {
    type: TYPE.MAIN_BOX,
    body: {
      username: item.info[2][1],
      text: item.info[1],
    },
    raw: item.info,
  };
  // 存在牌子
  if (item.info[3].length !== 0) {
    ret.body.medal = {
      color: `#${(item.info[3][4]).toString(16).padStart(6, 0)}`,
      name: item.info[3][1],
      level: item.info[3][0],
    };
  }
  return ret;
}

function handleEntryEffect(item) {
  const { data } = item;
  let str = data.copy_writing;
  str = str.replace('<%', '<b>');
  str = str.replace('%>', '</b>');
  return {
    type: TYPE.MAIN_BOX,
    body: {
      text: str,
    },
    raw: data,
  };
}

function handleHotRankChanged(item) {
  const { data } = item;
  return {
    type: TYPE.MAIN_BOX,
    body: {
      text: `分区榜单：${data.area_name} ${data.rank}`,
    },
    raw: data,
  };
}

function handleInteractWord(item) {
  const { data } = item;
  if (CONFIG.DISPLAY.indexOf('DISPLAY_INTERACT_WORD') !== -1) {
    return {
      type: TYPE.MAIN_BOX,
      body: {
        text: `${data.uname} 进入房间`,
      },
      raw: data,
    };
  }
  return {
    type: TYPE.HIDE,
  };
}

function handleNoticeMsg(item) {
  if (CONFIG.DISPLAY.DISPLAY_NOTICE_MSG !== -1) {
    return {
      type: TYPE.MAIN_BOX,
      body: {
        text: `${item.msg_common}`,
      },
      raw: item,
    };
  }
  return {
    type: TYPE.HIDE,
  };
}

function handleOnlineRankV2(item) {
  // console.log('ONLINE_RANK_V2');
}

function handleRoomRank(item) {
  const { data } = item;
  return {
    type: TYPE.HIDE,
    body: `小时榜单：${data.rank_desc}`,
    raw: data,
  };
}

function handleRoomRealTimeMessageUpdate(item) {
  const { data } = item;
  return {
    type: TYPE.MAIN_BOX,
    body: {
      text: `${data.roomid}直播间状态更新：粉丝数${data.fans}，粉丝团${data.fans_club}`,
    },
    raw: data,
  };
}

function handleSendGift(item) {
  const { data } = item;
  if (CONFIG.DISPLAY.indexOf('DISPLAY_GIFT') !== -1) {
    return {
      type: TYPE.GIFT_BOX,
      body: `${data.uname} ${data.action} ${data.giftName} * ${data.num}`,
      raw: data,
    };
  }
  return {
    type: TYPE.HIDE,
  };
}

function handleStopLiveRoomList(item) {
  const { data } = item;
  return {
    type: TYPE.HIDE,
    body: data.room_id_list,
    raw: data,
  };
}

function handleSuperChatMessage(item) {
  const { data } = item;
  return {
    type: TYPE.GIFT_BOX,
    body: `${data.user_info.uname} 的 ${data.price} 元 ${data.gift.gift_name}：${data.message}`,
    raw: data,
  };
}

function handleWidgetBanner(item) {
  const subData = item.data.widget_list[4].sub_data;
  return {
    type: TYPE.HIDE,
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
  STOP_LIVE_ROOM_LIST: handleStopLiveRoomList,
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
        type: TYPE.UNKNOWN,
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
      throw new Error('Cannot handle: Unknown operation');
  }
}

export {
  encode,
  decode,
  handlePacket,
  CONFIG,
  RES_CODE,
};
