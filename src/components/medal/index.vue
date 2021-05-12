<template>
  <span class="medal-body" :style="this.medalBorder">
    <span class="medal-left" :style="this.medalColor">{{ this.name }}</span>
    <span class="medal-right" :style="this.textColor">{{ this.level }}</span>
  </span>
</template>

<style type="text/css">
@import url(medal.css);
</style>

<script>
import medal from './medal';

export default medal;
</script>
