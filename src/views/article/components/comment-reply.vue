<template>
  <div class="comment-reply">
    <!-- 头部信息 -->
    <van-nav-bar :title="`${comment.reply_count}条回复`">
      <van-icon slot="left" name="cross" @click="$emit('close')" />
    </van-nav-bar>
    <!-- 当前评论项 -->
    <comment-item :comment="comment" />

    <!-- 所有评论回复 -->
    <van-cell title="全部回复" />
    <comment-list type="c" :source="comment.com_id" :list="commentList" />

    <div center class="article-bottom">
      <van-button class="comment-btn" round @click="isPostShow = true"
        >写评论</van-button
      >
    </div>

    <!-- 发布回复 -->
    <van-popup v-model="isPostShow" position="bottom">
      <post-comment
        :target="comment.com_id"
        :article-id="articleId"
        @post-success="onPostSuccess"
      />
    </van-popup>
  </div>
</template>

<script>
import CommentItem from './comment-item'
import CommentList from './comment-list'
import PostComment from './post-comment'

export default {
  name: 'CommentReply',
  components: {
    CommentItem,
    CommentList,
    PostComment
  },
  props: {
    // 查看回复的评论项
    comment: {
      type: Object,
      required: true
    },
    articleId: {
      type: [Number, String, Object],
      required: true
    }
  },
  data () {
    return {
      isPostShow: false,
      commentList: [] // 评论的回复列表
    }
  },
  methods: {
    onPostSuccess (comment) {
      // console.log(comment)
      // 把发布成功的评论数据对象放到评论列表顶部 xxx.unshift(comment)
      this.commentList.unshift(comment)
      // 更新评论的总数量
      this.comment.reply_count++
      // 关闭发表评论弹出
      this.isPostShow = false
    }
  }
}
</script>

<style scoped lang="less">
.article-bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-sizing: border-box;
  height: 44px;
  border-top: 1px solid #d8d8d8;
  background-color: #fff;
  .comment-btn {
    width: 300px;
    height: 30px;
    border: 1px solid #eee;
    font-size: 15px;
    line-height: 23px;
    color: #a7a7a7;
  }
}
</style>
