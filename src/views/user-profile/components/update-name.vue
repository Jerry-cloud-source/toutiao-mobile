<template>
  <div class="update-name">
    <van-nav-bar
      title="修改昵称"
      left-text="取消"
      right-text="完成"
      @click-left="$emit('close')"
      @click-right="onConfirm"
    />

    <div class="van-field-wrap">
      <van-field
        v-model="localName"
        rows="2"
        autosize
        type="textarea"
        maxlength="7"
        placeholder="请输入昵称"
        show-word-limit
      />
    </div>
  </div>
</template>

<script>
import { updateUserProfile } from '@/api/user'
export default {
  name: 'UpdateName',
  props: {
    // 声明接收父组件 v-model 传递的 value 值
    value: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      localName: this.value
    }
  },
  methods: {
    async onConfirm () {
      // 请求提交更新用户昵称
      // 更新成功 -> 修改父组件的 name -> 关闭弹出层
      this.$toast.loading({
        message: '保存中',
        forbidclick: true // 禁止用户点击
      })
      try {
        await updateUserProfile({
          name: this.localName
        })
        this.$toast.success('保存成功')

        // 发布 input 事件，更新父组件 v-model 绑定的数据
        this.$emit('input', this.localName)
        this.$emit('close')
      } catch (err) {
        if (err && err.response && err.response.status === 409) {
          this.$toast.fail('昵称已存在')
        }
      }
    }
  }
}
</script>

<style scoped lang="less">
.van-field-wrap {
  padding: 10px;
}
</style>
