/**
 * 请求模块
 */
import axios from 'axios'
import JSONbig from 'json-bigint'
import { Toast } from 'vant'
import router from '@/router'

// 在非组件模块中获取 store 必须通过导入
// 这里单独加载 store, 和在组件中 this.$store 是一个东西
import store from '@/store'

const request = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/', // 基础路径  牢记不能多空格
  transformResponse: [
    function (data) {
      // 后端返回的数据可能不是 JSON 格式字符串
      // 如果不是的话，那么 JSONbig.parse 调用就会报错
      // 所以我们使用 try-catch 来捕获异常，处理异常的发生
      try {
        // 如果转换成功，则直接把结果返回
        return JSONbig.parse(data)
      } catch (err) {
        // console.log('转换失败', err)
        // 如果转换失败了，则进入这里
        // 我们在这里把数据原封不动的直接返回给请求使用
        return data
      }

      // axios 默认在内部使用 JSON.parse 来转换处理原始数据
      // return JSON.parse(data)
    }
  ]
})

const refreshTokenReq = axios.create({
  baseURL: 'http://ttapi.research.itcast.cn/'
})

// 请求拦截器
request.interceptors.request.use(
  function (config) {
    const { user } = store.state

    // 如果用户已登录，统一给接口设置 token
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
    // 处理完之后一定要把 config 返回，否则请求发不出去
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  function (response) {
    // 响应成功进入这里

    return response
  },
  async function (error) {
    // 响应失败进入这里
    // 超过 2xx 的状态码都会进入这里
    const status = error.response.status
    if (status === 400) {
      // 客户端请求参数错误
      Toast.fail('客户端请求参数错误')
    } else if (status === 401) {
      // token 无效
      // 如果没有 user 或者 user.token 直接去登录
      // 如果有 refresh_token, 则请求获取新的token
      // 拿到新的 token 之后把它更新到容器中
      // 把失败的请求重新发出去
      const { user } = store.state
      if (!user || !user.token) {
        // 直接跳转到登录页
        return redirectLogin()
      }

      try {
        const { data } = await refreshTokenReq({
          method: 'PUT',
          url: '/app/v1_0/authorizations',
          headers: {
            Authorization: `Bearer ${user.refresh_token}`
          }
        })
        // 拿到新的 token 之后把它更新到容器中
        // console.log(data)
        user.token = data.data.token
        store.commit('setUser', user)

        // 把失败的请求重新发出去
        // err.config 是本次请求的相关配置信息对象
        return request(error.config)
      } catch (err) {
        // 刷新 token 都失败了，直接跳转到登录页
        redirectLogin()
      }
    } else if (status === 403) {
      // 没有权限操作
      Toast.fail('没有权限操作')
    } else if (status >= 500) {
      // 服务端异常
      Toast.fail('服务端异常，请稍后重试')
    }

    // 抛出异常
    return Promise.reject(error)
  }
)

function redirectLogin () {
  router.replace({
    name: 'login',
    // 传递查询参数，查询参数已 ？ 作为分隔符放到 url 后面
    // router.currentRoute 和我们在组件中获取的 this.$route 是一个东西
    query: {
      // 数据名是自己起的
      redirect: router.currentRoute.fullPath
    }
  })
}

// 导出
export default request
