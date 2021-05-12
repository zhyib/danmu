<template>
  <el-container id="container">
    <el-header id="header">
      <div>
        <el-row :gutter=20>
          <el-col :span="18">
            <el-input
                v-model="roomid"
                placeholder="请输入房间号"
                @keyup.enter.native="connect"
                clearable
            ></el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="connect">连接</el-button>
            <el-button type="primary" @click="disconnect">断开</el-button>
          </el-col>
        </el-row>
        <div id="status">
          <div id="popularity">
            人气值：{{ popularity }}
          </div>
          <div id="check-boxes">
            <el-checkbox-group v-model="displayConfig">
              <el-checkbox label="DISPLAY_INTERACT_WORD">进入房间</el-checkbox>
              <el-checkbox label="DISPLAY_GIFT">赠送礼物</el-checkbox>
              <el-checkbox label="DISPLAY_NOTICE_MSG">全场广播</el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </el-header>
    <el-main style="height: 100%">
      <el-row style="height: 100%;" :gutter=20>
        <el-col :span="12" style="height: 100%">
          <div style="height: 100%; overflow-y: auto" ref="mainCol">
            <div v-html="displayMain" id="mainBox" ref="mainBox"></div>
          </div>
        </el-col>
        <el-col :span="12" style="height: 100%">
          <div style="height: 100%; overflow-y: auto" ref="giftCol">
            <div v-html="displayGift" id="giftBox" ref="giftBox"></div>
          </div>
        </el-col>
      </el-row>
    </el-main>
    <el-footer style="height: 30px">
      <div id="foot-content">
        <medal :color="13081892" :name="'zyb'" :level="7"></medal>
        Made by AkiraZhyib
        <a href="https://github.com/zhyib/danmu">
          <i class="fa fa-github" style="font-size: 20px"></i>
        </a>
      </div>
    </el-footer>
  </el-container>
</template>

<style type="text/css">
@import url(home.css);
</style>

<script>
import home from './home';

export default home;
</script>
