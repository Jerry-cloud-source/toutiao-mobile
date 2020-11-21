<template>
  <div class="my-container">
    <van-cell-group v-if="user" class="my-info">
      <van-cell class="base-info" center :border="false">
        <van-image
          class="avatar"
          slot="icon"
          fit="cover"
          round
          :src="currentUser.photo"
        />
        <div class="name" slot="title">{{ currentUser.name }}</div>
        <van-button class="update-btn" size="small" round to="/user/profile"
          >编辑资料</van-button
        >
      </van-cell>
      <van-grid :border="false" class="data-info">
        <van-grid-item class="data-info-item">
          <div class="text-wrap" slot="text">
            <div class="number">{{ currentUser.art_count }}</div>
            <div class="text">头条</div>
          </div>
        </van-grid-item>
        <van-grid-item class="data-info-item">
          <div class="text-wrap" slot="text">
            <div class="number">{{ currentUser.follow_count }}</div>
            <div class="text">关注</div>
          </div>
        </van-grid-item>
        <van-grid-item class="data-info-item">
          <div class="text-wrap" slot="text">
            <div class="number">{{ currentUser.fans_count }}</div>
            <div class="text">粉丝</div>
          </div>
        </van-grid-item>
        <van-grid-item class="data-info-item">
          <div class="text-wrap" slot="text">
            <div class="number">{{ currentUser.like_count }}</div>
            <div class="text">获赞</div>
          </div>
        </van-grid-item>
      </van-grid>
    </van-cell-group>

    <div class="not-login" v-else>
      <div
        @click="
          $router.push({
            name: 'login',
            query: {
              redirect: '/my'
            }
          })
        "
      >
        <img class="mobile" src="@/assets/mobile.png" alt="" />
      </div>

      <div class="text">登录 / 注册</div>
    </div>

    <van-grid class="nav-grid mb-8" :column-num="2">
      <van-grid-item
        class="nav-grid-item"
        icon-prefix="toutiao"
        icon="shoucang"
        text="收藏"
      />
      <van-grid-item
        class="nav-grid-item"
        icon-prefix="toutiao"
        icon="lishi"
        text="历史"
      />
    </van-grid>

    <van-cell class="nav-van-cell mb-8" title="消息通知" is-link url="/" />
    <van-cell
      class="nav-van-cell mb-8"
      title="小智同学"
      is-link
      to="/user/chat"
    />
    <van-cell
      class="logout-cell"
      title="退出登录"
      v-if="user"
      @click="onLogout"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getCurrentUser } from '@/api/user'
export default {
  name: 'MyIndex',
  data () {
    return {
      currentUser: {} // 当前登录用户信息
    }
  },
  methods: {
    async loadCurrentUser () {
      const { data } = await getCurrentUser()
      // console.log(data)
      this.currentUser = data.data
    },
    onLogout () {
      // 提示用户确认是否退出
      this.$dialog
        .confirm({
          title: '退出提示',
          message: '您确认退出吗'
        })
        .then(() => {
          // 确认执行这里
          // 清除用户登录状态
          this.$store.commit('setUser', null)
        })
    }
  },
  computed: {
    ...mapState(['user'])
  },
  activated () {
    if (this.user) {
      this.loadCurrentUser()
    }
  }
}
</script>

<style scoped lang="less">
.my-container {
  .my-info {
    background: url('../../assets/banner.png') no-repeat;
    background-size: cover;
    .base-info {
      background-color: unset;
      box-sizing: border-box;
      height: 115px;
      padding-top: 38px;
      padding-bottom: 18px;
      .avatar {
        box-sizing: border-box;
        width: 88px;
        height: 88px;
        border: 1px solid #fff;
        margin-right: 16px;
      }
      .name {
        font-size: 18px;
        color: #fff;
      }
      .update-btn {
        height: 26px;
        font-size: 16px;
        color: #666;
      }
    }
    .data-info {
      height: 100px;
      .data-info-item {
        color: #fff;
        .text-wrap {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          .number {
            font-size: 18px;
          }
          .text {
            font-size: 16px;
          }
        }
      }
    }
    /deep/ .van-grid-item__content {
      background-color: unset;
    }
  }
  .not-login {
    height: 260px;
    background: url('../../assets/banner.png') no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .mobile {
      width: 88px;
      height: 88px;
      margin-bottom: 10px;
    }
    .text {
      font-size: 18px;
      color: #fff;
    }
  }
  /deep/.nav-grid {
    height: 88px;
    .nav-grid-item {
      .toutiao {
        font-size: 26px;
      }
      .toutiao-shoucang {
        color: #eb5253;
      }
      .toutiao-lishi {
        color: #ff9d1d;
      }
      .van-grid-item__text {
        font-size: 16px;
        color: #333;
      }
    }
  }
  .nav-van-cell {
    height: 48px;
    font-size: 16px;
  }
  .logout-cell {
    text-align: center;
    color: #d86262;
    font-size: 16px;
  }
  .mb-8 {
    margin-bottom: 8px;
  }
}
</style>
