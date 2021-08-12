<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref">
    </div>
    <span class="iconfont my-arrow-left" @click="handleToLeft"  :style="comStyle">&#xe6eb;</span>
    <span class="iconfont my-arrow-right" @click="handleToRight" :style="comStyle">&#xe6ee;</span>
    <span class="title" v-bind:style='catNameStyle'> {{catName}}</span>
  </div>
</template>

<script>
import { getThemeObject } from '../util/theme_utils'
import { mapState } from 'vuex'
export default {
  name: 'Hot',
  data: function () {
    return {
      allData: null,
      chartInstance: null,
      currentIndex: 0,
      titleFontSize: 0
    }
  },
  computed: {
    catName: function () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.currentIndex].name
      }
    },
    comStyle: function () {
      return {
        'font-size': this.titleFontSize + 'px',
        color: getThemeObject(this.theme).titleColor
      }
    },
    catNameStyle: function () {
      return {
        'font-size': this.titleFontSize / 1.5 + 'px',
        color: getThemeObject(this.theme).titleColor
      }
    },
    ...mapState(['theme'])
  },
  watch: {
    theme: function () {
      this.chartInstance.dispose()
      this.initChart()
      this.screenAdapt()
      this.updateChart()
    }
  },
  methods: {
    async getData (ret) {
      // const { data: ret } = await this.$http.get('hot')
      console.log(ret)
      this.allData = ret
      this.updateChart()
    },
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, this.theme)
      const initData = {
        title: {
          text: '▎热销商品占比',
          top: 20,
          left: 20
        },
        legend: {
          icon: 'circle',
          top: '50'
        },
        tooltip: {
          show: true,
          formatter: (arg) => {
            const childrenArr = arg.data.children
            let template = `${arg.name}：${arg.percent}% </br>`
            let totalValue = 0
            childrenArr.forEach(item => {
              totalValue += item.value
            })
            childrenArr.forEach(item => {
              template += `- ${item.name}:${parseInt(item.value / totalValue * 10000) / 100} % </br>`
            })
            return template
          }
        },
        series: [
          {
            type: 'pie',
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            emphasis: {
              label: {
                show: true
              }
            }
          }
        ]
      }
      this.chartInstance.setOption(initData)
      this.screenAdapt()
    },
    updateChart () {
      const showIndexData = this.allData[this.currentIndex]
      const pieData = showIndexData.children.map(item => {
        return { name: item.name, value: item.value, children: item.children }
      })
      const legendData = showIndexData.children.map(item => {
        return item.name
      })
      const updateData = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: pieData
          }
        ]
      }
      this.chartInstance.setOption(updateData)
    },
    screenAdapt () {
      const titleFontSize = this.$refs.hot_ref.offsetWidth / 100 * 3.6
      this.titleFontSize = titleFontSize
      const adaptData = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemHeight: titleFontSize,
          itemWidth: titleFontSize,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        },
        series: [
          {
            radius: titleFontSize * 4.5,
            center: ['50%', '50%']
          }
        ]
      }
      this.chartInstance.setOption(adaptData)
      this.chartInstance.resize()
    },
    handleToLeft () {
      if (this.currentIndex > 0) {
        this.currentIndex--
      } else {
        this.currentIndex = this.allData.length - 1
      }
      this.updateChart()
    },
    handleToRight () {
      if (this.currentIndex < this.allData.length - 1) {
        this.currentIndex++
      } else {
        this.currentIndex = 0
      }
      this.updateChart()
    }
  },
  created () {
    this.$socket.registerCallBack('hotData', this.getData)
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'hotData',
      chartName: 'hot',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapt)
  },
  destroyed () {
    this.$socket.unregisterCallBack('hotData')
  }
}
</script>

<style lang='less' scoped>
.my-arrow-left{
  color: white;
  position: absolute;
  font-size: 50px;
  left: 15%;
  top:50%;
  transform: translateY(-50%);
  cursor: pointer;
  transform: rotate(90deg);
}
.my-arrow-right{
  color:white;
  position: absolute;
  right: 15%;
  top:50%;
  font-size: 50px;
  transform: translateY(-50%);
  transform: rotate(90deg);
  cursor: pointer;
}
.title{
  position: absolute;
  color: white;
  font-size: 30px;
  font-weight: bold;
  right: 10%;
  bottom: 10%;
}
</style>
