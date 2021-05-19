<template>
  <el-container id="container">
    <el-header id="header">
      <div>
        <el-row type="flex" :gutter=10>
          <el-col style="flex: 1">
            <el-input
                v-model="roomid"
                placeholder="请输入房间号"
                @keyup.enter.native="connect"
                clearable
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
                type="danger"
                :disabled="!isConnected"
                @click="disconnect"
            >
              断开
            </el-button>
          </el-col>
        </el-row>
        <el-row type="flex" style="padding-top: 5px" :gutter=10>
          <el-col style="flex: 1;">
            <div id="popularity">
              人气值：{{ popularity }}
            </div>
          </el-col>
          <el-col style="width: 60px; text-align: right">
            <div>
              <el-tooltip effect="dark" content="清空弹幕" placement="left">
                <el-button
                    class="button-group"
                    id="button-clear"
                    @click="clear"
                    size="mini"
                    plain
                    round
                >
                  <i class="far fa-trash-alt"></i>
                </el-button>
              </el-tooltip>
            </div>
          </el-col>
          <el-col style="width: 160px; text-align: right">
            <div id="check-boxes">
              <el-checkbox-group v-model="displayConfig" size="mini" @change="handleChange">
                <el-checkbox-button
                    v-for="(btn, index) in checkButtons"
                    :label="btn.label"
                    :key="index"
                >
                  <el-tooltip effect="dark" :content="btn.text" placement="left">
                    <i :class="btn.icon"></i>
                  </el-tooltip>
                </el-checkbox-button>
              </el-checkbox-group>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-header>
    <el-main style="height: 100%">
      <el-row style="height: 100%;" :gutter=20>
        <el-col :span="12" style="height: 100%">
          <div style="height: 100%; overflow-y: auto" ref="mainCol">
            <div id="mainBox" ref="mainBox">
              <div v-for="(cmt, index) in displayMain" :key="index">
                <comment :msg-body=cmt></comment>
              </div>
            </div>
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
        Made by AkiraZhyib
        <!--        <a href="https://github.com/zhyib/danmu">-->
        <i class="fab fa-github" style="font-size: 20px"></i>
        <!--        </a>-->
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
