<template>
  <div class="search-container">
    <!-- 搜索栏 -->
    <form action="/">
      <van-search
        v-model="searchText"
        show-action
        placeholder="请输入搜索关键词"
        @search="onSearch(searchText)"
        @cancel="$router.back()"
        @focus="isResultShow = false"
      />
    </form>

    <!-- 搜索结果 -->
    <search-result v-if="isResultShow" :search-text="searchText" />

    <!-- 联想建议 -->
    <search-suggestion
      v-else-if="searchText"
      :search-text="searchText"
      @search="onSearch"
    />

    <!-- 历史记录 -->
    <search-history
      v-else
      :search-histories="searchHistories"
      @search="onSearch"
      @update-histories="deleteAllHistories"
    />
  </div>
</template>

<script>
import SearchSuggestion from './components/search-suggestion'
import SearchHistory from './components/search-history'
import SearchResult from './components/search-result'
import { setItem, getItem } from '@/utils/storage'
import { getSearchHistories, deleteSearchHistories } from '@/api/search'
import { mapState } from 'vuex'
// import { deleteSearchHistories } from '@/api/search'
export default {
  name: 'SearchIndex',
  components: {
    SearchSuggestion,
    SearchHistory,
    SearchResult
  },
  data () {
    return {
      searchText: '', // 搜索输入框的内容
      isResultShow: false, // 控制搜索结果的显示状态
      searchHistories: [] // 搜索历史数据
    }
  },
  methods: {
    onSearch (searchText) {
      // this.$toast(val)
      // 把输入框设置为你要搜索的文本
      this.searchText = searchText

      const index = this.searchHistories.indexOf(searchText)
      if (index !== -1) {
        // 把重复项删除
        this.searchHistories.splice(index, 1)
      }
      // 把最新的搜索历史记录放到顶部
      this.searchHistories.unshift(this.searchText)

      // 如果用户已登录，则把搜索历史记录存储到线上
      // 提示：只要我们调用获取搜索结果的数据接口，后端会给我们自动存储用户的搜索历史记录
      // 如果用户没有登录，则把搜索历史记录存储到本地
      // setItem('search-histories', this.searchHistories)

      // 展示搜索结果
      this.isResultShow = true
    },
    async loadSearchHistories () {
      // 因为后端帮我们存储的用户搜索历史记录太少了（只有4条）
      // 所以我们这里让后端返回的历史记录和本地的历史记录合并到一起

      let searchHistories = getItem('search-histories') || []
      if (this.user) {
        const { data } = await getSearchHistories()
        // console.log(data.data.keywords)

        // 数组去重
        // 合并数组：[...数组, ...数组]
        // 把 Set 转为数组：[...Set对象]
        // 数组去重：[...new Set([...数组, ...数组])]
        searchHistories = [
          ...new Set([...searchHistories, ...data.data.keywords])
        ]
      }
      // console.log(searchHistories)

      this.searchHistories = searchHistories
    },
    async deleteAllHistories () {
      this.searchHistories = []
      await deleteSearchHistories()
    }
  },
  created () {
    this.loadSearchHistories()
  },
  computed: {
    ...mapState(['user'])
  },
  watch: {
    // 监听搜索历史记录的变化，存储到本地
    searchHistories () {
      setItem('search-histories', this.searchHistories)
    }
  }
}
</script>

<style scoped lang="less"></style>
