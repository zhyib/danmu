<template>
  <div id="container">
    <div id="header-container">
      <el-row :gutter=10 type="flex">
        <el-col style="flex: 1">
          <el-input
              v-model="roomid"
              clearable
              placeholder="请输入房间号"
              @keyup.enter.native="connect"
          ></el-input>
        </el-col>
        <el-col style="width: 160px">
          <el-button
              id="button-connect"
              :type="isConnected ? 'success' : 'primary'"
              @click="connect"
          >
            <span v-if="isConnected">重连</span>
            <span v-else>连接</span>
          </el-button>
          <el-button
              id="button-disconnect"
              :disabled="!isConnected"
              type="danger"
              @click="disconnect"
          >
            断开
          </el-button>
        </el-col>
      </el-row>
      <el-row :gutter=10 style="padding-top: 5px" type="flex">
        <el-col style="flex: 1;">
          <div id="popularity">
            人气值：{{ popularity }}
          </div>
        </el-col>
        <el-col style="width: auto; text-align: right">
          <div>
            <el-tooltip content="清空弹幕" effect="dark" placement="left">
              <el-button
                  id="button-clear"
                  class="button-group"
                  plain
                  round
                  size="mini"
                  @click="clear"
              >
                <i class="far fa-trash-alt"></i>
              </el-button>
            </el-tooltip>
          </div>
        </el-col>
        <el-col style="width: auto; text-align: right">
          <el-checkbox-group
              id="check-boxes"
              v-model="displayConfig"
              size="mini"
              @change="handleChange"
          >
            <el-checkbox-button
                v-for="(btn, index) in checkButtons"
                :key="index"
                :label="btn.label"
            >
              <el-tooltip :content="btn.text" effect="dark" placement="left">
                <i :class="btn.icon"></i>
              </el-tooltip>
            </el-checkbox-button>
          </el-checkbox-group>
        </el-col>
      </el-row>
    </div>
    <div id="main-container">
      <div ref="mainCol" id="main-col" class="shadow-need">
        <div id="main-box" ref="mainBox">
          <div v-for="(cmt, index) in displayMain" :key="index">
            <comment :msg-body=cmt></comment>
          </div>
        </div>
      </div>
      <div ref="giftCol" id="gift-col" class="shadow-need">
        <div id="gift-box" ref="giftBox">
          <div v-for="(gift, index) in displayGift" :key="index">
            {{ gift }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style type="text/css">
@import url(home.css);
</style>

<script>
import home from './home';

export default home;
</script>
