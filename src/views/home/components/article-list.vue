<template>
  <!--
      List 组件通过 loading 和 finished 两个变量控制加载状态，
当组件初始化或滚动到到底部时，会触发 load 事件并将 loading 设置成 true，此时可以发起异步操作并更新数据，数据更新完毕后，将 loading 设置成 false 即可。
若数据已全部加载完毕，则直接将 finished 设置成 true 即可。

    - `load 事件`：
    + List 初始化后会触发一次 load 事件，用于加载第一屏的数据。
    + 如果一次请求加载的数据条数较少，导致列表内容无法铺满当前屏幕，List 会继续触发 load 事件，直到内容铺满屏幕或数据全部加载完成。

  - `loading 属性`：控制加载中的 loading 状态
    + 非加载中，loading 为 false，此时会根据列表滚动位置判断是否触发 load 事件（列表内容不足一屏幕时，会直接触发）
    + 加载中，loading 为 true，表示正在发送异步请求，此时不会触发 load 事件
  - `finished 属性`：控制加载结束的状态
    + 在每次请求完毕后，需要手动将 loading 设置为 false，表示本次加载结束
    + 所有数据加载结束，finished 为 true，此时不会触发 load 事件
     -->
  <div class="article-list" ref="article-list">
    <van-pull-refresh
      v-model="isPullRefreshLoading"
      :success-text="refreshSuccessText"
      :success-duration="1000"
      @refresh="onRefresh"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <!-- <van-cell
          v-for="(article, index) in articles"
          :key="index"
          :title="article.title"
        /> -->
        <article-item
          v-for="(article, index) in articles"
          :key="index"
          :article="article"
        />
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from '@/api/article'
import ArticleItem from '@/components/article-item'
import { debounce } from 'lodash'
export default {
  name: 'ArticleList',
  components: {
    ArticleItem
  },
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      articles: [], // 文章列表
      loading: false, // 控制加载中的 loading 状态
      finished: false, // 控制加载结束的状态，当加载结束，不再触发加载更多
      timestamp: null, // 获取下一页的数据的时间戳
      isPullRefreshLoading: false, // 下拉刷新的 loading
      refreshSuccessText: '', // 下拉刷新成功的提示文本
      scrollTop: 0 // 列表滚动到顶部的距离
    }
  },
  methods: {
    async onLoad () {
      // 1.请求获取数据
      // 2.把数据放到 list 数组中  注意：数据是 push 进去的
      // 3.设置本次加载状态结束，它才可以判断是否需要加载下一次，否则就会永远的停在这里
      // 4.数据全部加载完成

      // 1.请求获取数据
      const { data } = await getArticles({
        channel_id: this.channel.id, // 频道 id
        timestamp: this.timestamp || Date.now(), // 时间戳，请求新的推荐数据传当前的时间戳，请求历史推荐传指定的时间戳，timestamp 相当于页码，请求最新数据使用当前最新时间戳，下一页数据使用上一次返回的数据中的时间戳
        with_top: 1 // 是否包含置顶，进入页面第一次请求时要包含置顶文章，1-包含置顶，0-不包含
      })
      // console.log(data)

      // 2.把数据放到 list 数组中
      const { results } = data.data
      this.articles.push(...results) // 数组合并

      // 3.设置本次加载状态结束
      this.loading = false

      // 4.数据全部加载完成
      if (results.length) {
        // 更新获取下一页数据的页码
        this.timestamp = data.data.pre_timestamp
      } else {
        // 没有数据了，把加载状态设置结束，不再触发加载更多
        this.finished = true
      }
    },
    async onRefresh () {
      // console.log('onRefresh')
      // 下拉刷新，组件自己就会展示 loading
      // 1、请求获取数据
      const { data } = await getArticles({
        channel_id: this.channel.id, // 频道 id
        timestamp: Date.now(), // 传递不同的时间戳就会返回不同的数据，而且数据不能为空
        with_top: 1
      })

      // 2、报数据放到数据列表中（往顶部追加）
      const { results } = data.data
      this.articles.unshift(...results)
      // 3、 关闭刷新的状态 loading
      this.isPullRefreshLoading = false

      this.refreshSuccessText = `更新了${results.length}条数据`
    }
  },
  mounted () {
    const articleList = this.$refs['article-list']
    articleList.onscroll = debounce(() => {
      // console.log(articleList.scrollTop)
      // console.log('onscroll')
      this.scrollTop = articleList.scrollTop
    }, 80)
  },
  activated () {
    // console.log('从缓存中被激活')
    this.$refs['article-list'].scrollTop = this.scrollTop
  }
}
</script>

<style scoped lang="less">
.article-list {
  // 让文章列表固定定位，使其让顶部固定和不被底部遮盖
  position: fixed;
  left: 0;
  right: 0;
  bottom: 48px;
  top: 92px;
  overflow-y: auto;
}
</style>
