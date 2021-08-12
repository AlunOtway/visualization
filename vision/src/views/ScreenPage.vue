<template>
  <div :style="backgroundStyle" class="screen-container" >
    <header class="screen-header">
      <div>
        <img :src='titleDecorate' alt="">
        <span :style="comStyle" class="title">电商平台实时监控系统</span>
        <div class="title-right">
          <img :src="switchIcon"  class="qiehuan" @click="handleChangeTheme">
          <span :style="comStyle" class="datetime">{{formatDateTime}}</span>
        </div>
      </div>
    </header>
    <div class="screen-body">
      <section class="screen-left">
        <div id="left-top" :class="[fullScreenStatus.trend?'fullscreen':'']">
          <Trend ref="trend"></Trend>
          <div class="resize">
            <span
              :style="comStyle"
              @click="handleScreenScale('trend')"
              :class="['iconfont',fullScreenStatus.trend?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="left-bottom" :class="[fullScreenStatus.seller?'fullscreen':'']">
          <Seller ref="seller"></Seller>
          <div class="resize">
            <span
              :style="comStyle"
              @click="handleScreenScale('seller')"
              :class="['iconfont',fullScreenStatus.seller?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-middle">
        <div id="middle-top" :class="[fullScreenStatus.map?'fullscreen':'']">
          <Map ref="map"></Map>
          <div class="resize">
            <!--icon-expand-alt-->
            <!--icon-compress-alt-->
            <span
              :style="comStyle"
              @click="handleScreenScale('map')"
              :class="['iconfont',fullScreenStatus.map?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="middle-bottom" :class="[fullScreenStatus.rank?'fullscreen':'']">
          <Rank ref="rank"></Rank>
          <div class="resize">
            <span
              :style="comStyle"
              @click="handleScreenScale('rank')"
              :class="['iconfont',fullScreenStatus.rank?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
      <section class="screen-right">
        <div id="right-top" :class="[fullScreenStatus.hot?'fullscreen':'']">
          <Hot ref="hot"></Hot>
          <div class="resize">
            <span
              :style="comStyle"
              @click="handleScreenScale('hot')"
              :class="['iconfont',fullScreenStatus.hot?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
        <div id="right-bottom" :class="[fullScreenStatus.stock?'fullscreen':'']">
          <Stock ref="stock"></Stock>
          <div class="resize">
            <span
              :style="comStyle"
              @click="handleScreenScale('stock')"
              :class="['iconfont',fullScreenStatus.stock?'icon-compress-alt':'icon-expand-alt']"
            ></span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
<script>
import Hot from '@/components/Hot.vue'
import Map from '@/components/Map.vue'
import Rank from '@/components/Rank.vue'
import Seller from '@/components/Seller.vue'
import Stock from '@/components/Stock.vue'
import Trend from '@/components/Trend.vue'
import { getThemeObject } from '../util/theme_utils'
import { mapState } from 'vuex'
export default {
  name: 'ScreenPage',
  data: function () {
    return {
      fullScreenStatus: {
        trend: false,
        seller: false,
        map: false,
        rank: false,
        hot: false,
        stock: false
      },
      titleDecorate: '/static/img/header_border_dark.png',
      datetime: Date.now(),
      intervalFlag: null
    }
  },
  computed: {
    switchIcon: function () {
      return '/static/img/' + getThemeObject(this.theme).switchIcon
    },
    backgroundStyle: function () {
      return {
        'background-color': getThemeObject(this.theme).backgroundColor
      }
    },
    comStyle: function () {
      return {
        color: getThemeObject(this.theme).titleColor
      }
    },
    formatDateTime: function () {
      const now = new Date(this.datetime)
      const year = now.getFullYear()
      const month = now.getMonth()
      const date = now.getDate()
      const hours = now.getHours()
      const minute = now.getMinutes()
      const second = now.getSeconds()
      return `${year}-${month}-${date} ${hours}:${minute}:${second}`
    },
    ...mapState(['theme'])
  },
  components: {
    Hot,
    Map,
    Rank,
    Seller,
    Stock,
    Trend
  },
  created () {
    this.$socket.registerCallBack('fullScreen', this.receiveData)
    this.$socket.registerCallBack('themeChange', this.receiveThemeChange)
  },
  mounted () {
    this.dateTimeRunner()
  },
  destroyed () {
    this.$socket.registerCallBack('fullScreen')
    this.$socket.unregisterCallBack('themeChange')
    clearInterval(this.intervalFlag)
  },
  methods: {
    receiveThemeChange () {
      this.$store.commit('changeTheme')
    },
    dateTimeRunner () {
      this.intervalFlag = setInterval(() => {
        this.datetime = Date.now() + 1000
      }, 1000)
    },
    handleChangeTheme () {
      this.$socket.send({
        action: 'themeChange',
        socketType: 'themeChange',
        chartName: '',
        value: ''
      })
    },
    handleScreenScale (e) {
      const targetValue = !this.fullScreenStatus[e]
      console.log(e)
      this.$socket.send({
        action: 'fullScreen',
        socketType: 'fullScreen',
        chartName: e,
        value: targetValue
      })
    },
    receiveData (receiveData) {
      console.log(receiveData)
      const charName = receiveData.chartName
      const value = receiveData.value
      this.fullScreenStatus[charName] = value
      this.$nextTick(() => {
        this.$refs[charName].screenAdapt()
      })
    }
  }
}
</script>

<style lang="less" scoped >
  .fullscreen {
    position: fixed!important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    z-index: 100;
  }
  .screen-container {
    width: 100%;
    height: 100%;
    padding: 0 20px;
    background-color: #161522;
    color: #fff;
    box-sizing: border-box;
  }
  .screen-header {
    width: 100%;
    height: 64px;
    font-size: 20px;
    position: relative;
    > div {
      img {
        position: absolute;
        height: 100%;
        width: 100%;
      }
    }
    .title {
      position: absolute;
      font-weight: bold;
      left: 50%;
      top: 50%;
      font-size: 30px;
      transform: translate(-50%, -50%);
    }
    .title-right {
      display: flex;
      align-items: center;
      position:absolute;
      right: 0px;
      top: 50%;
      transform: translateY(-80%);
    }
    .qiehuan {
      position:relative;
      width: 28px;
      height: 21px;
      cursor: pointer;
    }
    .datetime {
      position:relative;
      margin-left: 10px;
      display: inline-block;
      font-size: 15px
    }
    .logo {
      position: absolute;
      left: 0px;
      top: 50%;
      transform: translateY(-80%);
      img {
        height: 35px;
        width: 128px;
      }
    }
  }
  .screen-body {
    width: 100%;
    height: 100%;
    display: flex;
    margin-top: 10px;
    section > div{
    }
    .screen-left {
      height: 100%;
      width: 27.6%;
      #left-top {
        height: 53%;
        position: relative;
      }
      #left-bottom {
        height: 31%;
        margin-top: 25px;
        position: relative;
      }
    }
    .screen-middle {
      height: 100%;
      width: 41.5%;
      margin-left: 1.6%;
      margin-right: 1.6%;
      #middle-top {
        width: 100%;
        height: 56%;
        position: relative;
      }
      #middle-bottom {
        margin-top: 25px;
        width: 100%;
        height: 28%;
        position: relative;
      }
    }
    .screen-right {
      height: 100%;
      width: 27.6%;
      #right-top {
        height: 46%;
        position: relative;
      }
      #right-bottom {
        height: 38%;
        margin-top: 25px;
        position: relative;
      }
    }
  }
  .resize {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
  }
</style>
