<template>
  <span id="medal-body" :style="medalBorder">
    <span id="medal-left" :style="medalColor">{{ name }}</span>
    <span id="medal-right" :style="textColor">{{ level }}</span>
  </span>
</template>

<style type="text/css">
@import url(medal.css);
</style>

<script>
import medal from './medal';

export default medal;
</script>
