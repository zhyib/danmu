<template>
  <div id="border-whole">
    <div id="button-control">
      <el-tooltip effect="dark" content="最小化" placement="left">
        <el-button
            class="button-group"
            @click="minimize"
            size="mini"
            plain
            round
        >
          <i class="fas fa-minus"></i>
        </el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="关闭" placement="left">
        <el-button
            class="button-group"
            @click="close"
            size="mini"
            plain
            round
        >
          <i class="fas fa-times"></i>
        </el-button>
      </el-tooltip>
    </div>
    <div id="drag-part"></div>
    <el-tabs id="border-card" type="border-card">
      <el-tab-pane label="首页">
        <home></home>
      </el-tab-pane>
      <el-tab-pane label="配置项1">配置项1</el-tab-pane>
      <!--    <el-tab-pane label="角色管理">角色管理</el-tab-pane>-->
      <!--    <el-tab-pane label="定时任务补偿">定时任务补偿</el-tab-pane>-->
    </el-tabs>
    <div id="border-footer">
        Made by AkiraZhyib
        <!--        <a href="https://github.com/zhyib/danmu">-->
        <i class="fab fa-github"></i>
        <!--        </a>-->
      </div>
  </div>
</template>

<style type="text/css">
@import url(border.css);
</style>

<script>
import border from './border';

export default border;
</script>
