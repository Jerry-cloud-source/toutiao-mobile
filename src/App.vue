<template>
  <div id="app">
    <!-- 路由出口 -->
    <!--
       因为 router-view 是一级路由出口
      keep-alive 仅对该路由出口渲染的组件有效
     -->
    <keep-alive :include="cachePages">
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'App',
  computed: {
    ...mapState(['cachePages'])
  }
}
</script>

<style lang="less"></style>
