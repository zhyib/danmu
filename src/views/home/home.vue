<template>
  <el-container style="height: 100%">
    <el-header style="height: 80px">
      <div>
        <el-row :gutter=20>
          <el-col :span="18">
            <el-input
              v-model="roomid"
              placeholder="请输入房间号"
              clearable
            ></el-input>
          </el-col>
          <el-col :span="6">
            <el-button type="primary" @click="connect">连接</el-button>
            <el-button type="primary" @click="disconnect">断开</el-button>
          </el-col>
        </el-row>
        <el-row :gutter=20>
          <el-col :span="8">
            人气值：{{ popularity }}
          </el-col>
          <el-col :span="16">
            <el-checkbox-group v-model="displayConfig">
              <el-checkbox label="DISPLAY_INTERACT_WORD">进入房间</el-checkbox>
              <el-checkbox label="DISPLAY_GIFT">赠送礼物</el-checkbox>
              <el-checkbox label="DISPLAY_NOTICE_MSG">全场广播</el-checkbox>
            </el-checkbox-group>
          </el-col>
        </el-row>
      </div>
    </el-header>
    <el-main style="height: 100%">
      <el-row style="height: 100%;">
        <el-col :span="12" style="height: 100%; overflow-y: scroll">
          <div v-html="displayMain" id="mainBox"></div>
        </el-col>
        <el-col :span="12" style="height: 100%; overflow-y: scroll">
          <div v-html="displayGift" id="giftBox"></div>
        </el-col>
      </el-row>
    </el-main>
    <el-footer style="height: 30px">
      Footer
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
