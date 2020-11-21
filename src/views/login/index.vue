<template>
  <div class="login-container">
    <van-nav-bar
      class="app-nav-bar"
      title="登录 / 注册"
      left-arrow
      @click-left="$router.back()"
    />

    <!-- 登录表单 -->
    <!--
      基于 Vant 的表单验证
      1、使用 van-form 组件包裹所有的表单项 van-field
      2、给 van-form 绑定 submit 事件，当表单提交的时候会触发 submit 事件
         提示：只有表单验证通过时，它才会调用 submit 事件
      3、使用 Field 的 rules 属性定义校验规则
     -->
    <van-form
      :show-error="false"
      :show-error-message="false"
      validate-first
      ref="login-form"
      @submit="onLogin"
      @failed="onFailed"
    >
      <van-field
        v-model="user.mobile"
        icon-prefix="toutiao"
        left-icon="shouji"
        placeholder="请输入手机号"
        center
        name="mobile"
        :rules="formRules.mobile"
      />
      <van-field
        v-model="user.code"
        clearable
        icon-prefix="toutiao"
        left-icon="yanzhengma"
        placeholder="请输入验证码"
        center
        name="code"
        :rules="formRules.code"
      >
        <template #button>
          <van-button
            size="small"
            class="send-btn"
            round
            :loading="isSendSmsLoading"
            v-if="isCountDownShow"
            @click.prevent="onSendSms"
            >发送验证码</van-button
          >
          <van-count-down
            :time="1000 * 60"
            format="ss s"
            v-else
            @finish="isCountDownShow = false"
          />
        </template>
      </van-field>
      <div class="login-btn-wrap">
        <van-button class="login-btn" type="info" block>登录</van-button>
      </div>
    </van-form>
  </div>
</template>

<script>
import { login, sendSms } from '@/api/user'
import { Toast } from 'vant'
export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '17090086870', // 手机号
        code: '246810' // 验证码
      },
      formRules: {
        mobile: [
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3|5|7|8|9]\d{9}$/, message: '手机号格式错误' }
        ],
        code: [
          { required: true, message: '请输入验证码' },
          { pattern: /^\d{6}$/, message: '验证码格式错误' }
        ]
      },
      isCountDownShow: true, // 控制倒计时和发送按钮的显示状态
      isSendSmsLoading: false // 发送验证码按钮 loading 状态
    }
  },
  methods: {
    async onLogin () {
      Toast.loading({
        message: '登录中...',
        forbidClick: true, // 禁止点击背景
        duration: 0 // 展示时长(ms)，值为 0 时，toast 不会消失
      })
      // 1.找到数据接口
      // 2.封装请求方法
      // 3.调用登录接口
      // 4.处理响应数据
      try {
        const res = await login(this.user)
        // console.log(res)
        Toast.success('登陆成功')

        // 将后端返回的用户登录状态（token 等数据）放到 Vuex 容器中
        this.$store.commit('setUser', res.data.data)

        // 清除 layout 的缓存，让它重新渲染
        this.$store.commit('removeCachePage', 'LayoutIndex')

        // 登录成功，跳转回原来的页面
        // this.$router.back() // 先用这种方式，不太好
        this.$router.push(this.$route.query.redirect || '/')
      } catch (err) {
        // console.log('登录失败', err)
        Toast.fail('登录失败，手机号或验证码错误')
      }
    },
    onFailed (err) {
      // console.log('验证失败', err)
      if (err.errors[0]) {
        this.$toast({
          message: err.errors[0].message,
          position: 'top'
        })
      }
    },
    async onSendSms () {
      // 校验手机号
      // 验证通过 -> 请求发送验证码 -> 用户接收短信 -> 输入验证码 -> 请求登录
      // 请求发送验证码 -> 隐藏发送按钮，显示倒计时
      // 倒计时结束 -> 隐藏倒计时，显示发送按钮

      // console.log('发送按钮')
      // this.$refs['login-form'].validate('mobile').then(
      //   data => {
      //     console.log(data)
      //   }
      // )

      try {
        await this.$refs['login-form'].validate('mobile')
        // 验证通过，请求发送验证码
        this.isSendSmsLoading = true // 展示按钮的 loading 状态，防止网路过慢用户多次点击触发行为
        await sendSms(this.user.mobile)

        // 短信发出去了，隐藏发送按钮，显示倒计时
        this.isCountDownShow = false

        // 倒计时结束 -> 隐藏倒计时，显示发送按钮（监听倒计时结束用 finish 事件处理）
      } catch (err) {
        // try 里面任何代码的错误都会进入 catch
        // 不同的错误需要有不同的提示，就需要判断
        // console.log('验证失败', err)
        // console.dir(err)
        // this.$toast({
        //   message: err.message,
        //   position: 'top'
        // })

        let message = ''
        if (err && err.name === 'mobile') {
          message = err.message
        } else {
          message = '获取验证码失败，请稍后重试'
        }
        this.$toast({
          message,
          position: 'top'
        })
      }
      // 关闭发送按钮的 loading 状态
      this.isSendSmsLoading = false
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  .send-btn {
    width: 86px;
    height: 30px;
    background-color: #ededed;
    .van-button__text {
      font-size: 11px;
      color: #666;
    }
  }
  .login-btn-wrap {
    padding: 26px 16px;
    .login-btn {
      background-color: #6db4fb;
      border: none;
      border-radius: 5px;
      .van-button__text {
        font-size: 16px;
      }
    }
  }
}
</style>
