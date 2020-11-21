<template>
  <div class="search-suggestion">
    <van-cell icon="search" v-for="(str, index) in suggestions" :key="index" @click="$emit('search', str)">
      <div slot="title" v-html="highlight(str)"></div>
    </van-cell>
  </div>
</template>

<script>
import { getSearchSuggestions } from '@/api/search'
import { debounce } from 'lodash'

// 函数防抖
// import _ from 'lodash'
// const fn = _.debounce(function () {
//   console.log('debounce')
// }, 1000)

export default {
  name: 'SearchSuggestion',
  props: {
    searchText: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      suggestions: [] // 联想建议数组
    }
  },
  methods: {
    highlight (str) {
      return str.replace(
        // a /a/gi、 vue /vue/gi
        // 正则表达式 /中间的内容/都会当作正则匹配模式字符来对待
        // 错误写法：/this.searchText/gi
        // RegExp 是正则表达式的构造函数
        // 参数1：字符串
        // 参数2： 匹配模式
        // 返回值： 正则对象
        new RegExp(this.searchText, 'gi'),
        `<span style="color: red">${this.searchText}</span>`
      )
    }
  },

  // watch 详解：https://cn.vuejs.org/v2/api/#watch
  watch: {
    // 属性名：要监视数据的名称
    // 数据发生变化时才会调用
    //   searchText () {
    //     console.log('searchText')
    //   }
    // }

    // 监视的完整写法
    // 该回调将会在侦听开始之后被立即调用
    searchText: {
      // 当数据变化会执行 handler 函数
      // async handler () {
      //   // console.log('searchText')
      //   // 找到数据接口
      //   // 请求获取数据
      //   // 模板绑定展示
      //   const { data } = await getSearchSuggestions(this.searchText)
      //   // console.log(data)
      //   this.suggestions = data.data.options
      // },

      // debounce 函数
      // 参数1：函数
      // 参数2：时间
      // 返回值：防抖处理的函数
      handler: debounce(async function () {
        const { data } = await getSearchSuggestions(this.searchText)
        this.suggestions = data.data.options
      }, 200),
      immediate: true
    }
  }
}
</script>

<style></style>
