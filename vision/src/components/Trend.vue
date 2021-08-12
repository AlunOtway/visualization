<template>
    <div class="com-container">
      <div class="trend-title">
        <div class="type-selector">
          <span :style="comStyle">{{'▎ ' + showTile}}</span><span class="iconfont icon" v-on:click="handleShowChoice" :style="comStyle">&#xe6eb;</span>
        </div>
        <div class="select-box" v-show="showFlag">
          <div v-for="item of typeList" :key="item.key" @click="handleSelect(item.key)" :style="itemChoice">{{item.text}} </div>
        </div>
      </div>
      <div class="com-chart" ref="trend_ref"></div>
    </div>
</template>
<script>
import { mapState } from 'vuex'
import { getThemeObject } from '../util/theme_utils'

export default {
  name: 'Trend',
  data: function () {
    return {
      chartInstance: null,
      allData: null,
      selectedType: 'map',
      showFlag: false,
      fontSize: null,
      itemChoice: null
    }
  },
  computed: {
    comStyle () {
      console.log(this.fontSize)
      return {
        fontSize: this.fontSize ? this.fontSize['font-size'] : '',
        color: getThemeObject(this.theme).titleColor
      }
    },
    typeList () {
      if (this.allData === null) {
        return []
      } else {
        return (this.allData.type).filter(item => item.key !== this.selectedType)
      }
    },
    showTile () {
      if (!this.allData) {
        return ''
      } else {
        return this.allData[this.selectedType].title
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
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, this.theme)
      const initData = {
        xAxis: {
          type: 'category',
          boundaryGap: false
        },
        grid: {
          left: '3%',
          right: '3%',
          top: '35%',
          bottom: '2%',
          containLabel: true
        },
        legend: {
          left: 20,
          top: '15%',
          icon: 'circle'
        },
        yAxis: {
          type: 'value'
        },
        tooltip: {
          show: true,
          trigger: 'axis'
        }
      }
      this.chartInstance.setOption(initData)
    },
    async getData (ret) {
      // const { data: retHttp } = await this.$http.get('trend')
      this.allData = ret
      this.updateChart()
    },
    updateChart () {
      const monthList = this.allData.common.month
      const map = this.allData[this.selectedType].data
      const nameList = map.map(item => item.name)
      const colorStartList = [
        'rgba(186, 85, 15,0.5)',
        'rgba(188, 35, 36,0.5)',
        'rgba(26, 181, 168,0.5)',
        'rgba(41, 89, 194,0.5)',
        'rgba(18, 130, 46,0.5)']
      const colorEndList = [
        'rgba(186, 85, 15,0)',
        'rgba(188, 35, 36,0)',
        'rgba(26, 181, 168,0)',
        'rgba(41, 89, 194,0)',
        'rgba(18, 130, 46,0)']
      const yValue = map.map((item, index) => {
        return {
          name: item.name,
          type: 'line',
          data: item.data,
          stack: this.selectedType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorStartList[4 - index]
              },
              {
                offset: 1,
                color: colorEndList[4 - index]
              }
            ])
          }
        }
      })
      const updateData = {
        legend: {
          data: nameList
        },
        xAxis: {
          data: monthList
        },
        series: yValue
      }
      this.chartInstance.setOption(updateData)
    },
    screenAdapt () {
      const zoomScale = this.$refs.trend_ref.offsetWidth / 100 * 3.6
      this.fontSize = {
        'font-size': zoomScale + 'px'
      }
      this.itemChoice = {
        'font-size': zoomScale + 'px',
        'margin-left': zoomScale + 'px'
      }
      const adaptData = {
        legend: {
          itemHeight: zoomScale,
          itemWidth: zoomScale,
          textStyle: {
            fontSize: zoomScale / 2
          }
        }
      }
      this.chartInstance.setOption(adaptData)
      this.chartInstance.resize()
    },
    handleSelect (type) {
      this.selectedType = type
      this.showFlag = false
      this.updateChart()
    },
    handleShowChoice () {
      this.showFlag = !this.showFlag
    }
  },
  created () {
    this.$socket.registerCallBack('trendData', this.getData)
  },
  mounted () {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'trendData',
      chartName: 'trend',
      value: ''
    })
    this.screenAdapt()
    window.addEventListener('resize', this.screenAdapt)
  },
  destroyed () {
    this.$socket.unregisterCallBack('trendData')
    window.addEventListener('resize', this.screenAdapt)
  }
}
</script>

<style lang="less" scoped>
.trend-title{
  position:absolute;
  top: 10px;
  left: 20px;
  z-index: 10;
  color: white;
  .type-selector{
    .icon{
      cursor: pointer;
    }
  }
  .select-box{
    background-color:rgba(34, 39, 51, 0.9) ;
  }
}
</style>
