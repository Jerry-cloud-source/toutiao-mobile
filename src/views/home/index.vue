<template>
  <div class="home-container">
    <!-- 导航栏 -->
    <van-nav-bar class="app-nav-bar">
      <van-button
        slot="title"
        class="search-btn"
        icon="search"
        type="info"
        round
        to="/search"
        >搜索</van-button
      >
    </van-nav-bar>

    <!-- 文章频道列表 -->
    <!--
      标签页组件有一个功能，只有你第一次查看标签页的时候才会渲染里面的内容
     -->
    <van-tabs class="channel-tabs" v-model="active">
      <van-tab
        :title="channel.name"
        v-for="(channel, index) in channels"
        :key="index"
      >
        <!-- 文章列表 -->
        <article-list :channel="channel" />
      </van-tab>
      <!-- 汉堡按钮 -->
      <div
        slot="nav-right"
        class="wap-nav-wrap"
        @click="isChannelEditShow = true"
      >
        <van-icon name="wap-nav" />
      </div>

      <!-- 汉堡按钮定位把列表最后的位置给挡住了，解决办法就是在这里添加一个站位元素 -->
      <div class="nav-right-placeholder" slot="nav-right"></div>
    </van-tabs>

    <!-- 弹出层 -->
    <van-popup
      v-model="isChannelEditShow"
      position="bottom"
      :style="{ height: '100%' }"
      closeable
      close-icon-position="top-left"
      get-container="body"
    >
      <!--
      模板中的 $event 表示事件参数
     -->
      <channel-edit
        :user-channels="channels"
        :active="active"
        @close="isChannelEditShow = false"
        @update-active="active = $event"
      />
    </van-popup>
  </div>
</template>

<script>
import { getUserChannels } from '@/api/user'
import ArticleList from './components/article-list'
import ChannelEdit from './components/channel-edit'
import { mapState } from 'vuex'
import { getItem } from '@/utils/storage'

export default {
  name: 'HomeIndex',
  components: {
    ArticleList,
    ChannelEdit
  },
  data () {
    return {
      active: 0, // 控制被激活的标签
      channels: [],
      isChannelEditShow: false // 控制编辑频道的显示状态
    }
  },
  methods: {
    async loadChannels () {
      // 请求获取用户频道列表
      // const { data } = await getUserChannels()
      // console.log(data)
      // this.channels = data.data.channels

      let channels = []
      // console.log(this.user)
      if (this.user) {
        // 已登录，请求获取线上的用户频道列表
        const { data } = await getUserChannels()
        channels = data.data.channels
      } else {
        // 没有登录，判断本地是否又频道列表数据
        const localChannels = getItem('user-channels')
        // 如果本地存储有频道列表就使用
        if (localChannels) {
          channels = localChannels
        } else {
          // 用户没有登录，也没有本地存储的频道列表，那就请求获取默认推荐的频道列表
          const { data } = await getUserChannels()
          channels = data.data.channels
        }
      }
      this.channels = channels
    }
    // onUpdateActive (index) {
    //   this.active = index
    // }
  },
  created () {
    this.loadChannels()
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>

<style scoped lang="less">
.home-container {
  /deep/ .van-nav-bar__title {
    max-width: none;
  }
  .search-btn {
    width: 277px;
    height: 32px;
    background-color: #5babfb;
    border: none;
    .van-icon {
      font-size: 16px;
    }
    .van-button__text {
      font-size: 14px;
    }
  }
  .channel-tabs {
    /deep/ .van-tab {
      border-right: 1px solid #edeff3;
      border-bottom: 1px solid #edeff3;
      font-size: 18px;
    }
    /deep/ .van-tabs__line {
      width: 50px !important;
      height: 3px;
    }
    .nav-right-placeholder {
      width: 33px;
      flex-shrink: 0;
    }
  }
  .wap-nav-wrap {
    position: fixed;
    right: 0;
    height: 43px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    opacity: 0.9;
    .van-icon {
      font-size: 28px;
    }
    &:before {
      content: '';
      width: 1px;
      height: 43px;
      background: url('../../assets/line.png') no-repeat;
      background-size: contain;
      position: absolute;
      right: 33px;
      top: 0;
    }
  }
}
</style>
