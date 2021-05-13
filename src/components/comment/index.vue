<template>
  <div id="comment-body">
<!--      {{msgBody}}-->
    <medal v-if="msgBody.medal" :color="medalColor" :name="medalName" :level="medalLevel"></medal>
    <span v-if="msgBody.username" id="name">{{ username }}：</span>
    <span v-if="msgBody.text" id="txt">{{ text }}</span>
  </div>
</template>

<style type="text/css">
@import url(comment.css);
</style>

<script>
import comment from './comment';

export default comment;
</script>
