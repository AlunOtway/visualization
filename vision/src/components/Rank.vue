<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref">
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Rank',
  data: function () {
    return {
      chartInstance: null,
      allData: null,
      startValue: 0,
      endValue: 9,
      intervalFlag: null
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.rank_ref, this.theme)
      const initData = {
        title: {
          text: '▎地区销售排行',
          top: 20,
          left: 20
        },
        xAxis: {
          type: 'category'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          type: 'bar'
        }],
        tooltip: {
          show: true
        },
        grid: {
          left: '5%',
          right: '5%',
          top: '40%',
          bottom: '5%',
          containLabel: true
        }
      }
      this.chartInstance.setOption(initData)
    },
    async getData (ret) {
      // const { data: ret } = await this.$http('rank')
      this.allData = ret
      this.updateChart()
      this.screenAdapt()
    },
    updateChart () {
      const rankAllData = this.allData.sort((a, b) => {
        return b.value - a.value
      })
      const xAixsValue = rankAllData.map(item => {
        return item.name
      })
      const yAixsValue = rankAllData.map(item => {
        return item.value
      })
      const colorArr = [
        ['#0BA82C', '#4FF778'], ['#2E72bF', '#23E5E5'], ['#5052EE', '#AB6EE5']
      ]
      const upDateData = {
        xAxis: {
          data: xAixsValue
        },
        series: [
          {
            data: yAixsValue,
            itemStyle: {
              color: arg => {
                let targetColorArr = null
                if (arg.value > 300) {
                  targetColorArr = colorArr[0]
                } else if (arg.value > 200) {
                  targetColorArr = colorArr[1]
                } else {
                  targetColorArr = colorArr[2]
                }
                return new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: targetColorArr[0]
                  },
                  {
                    offset: 1,
                    color: targetColorArr[1]
                  }
                ])
              }
            }
          }
        ],
        dataZoom: {
          show: false,
          startValue: this.startValue,
          endValue: this.endValue
        }
      }
      this.chartInstance.setOption(upDateData)
      this.startInterval()
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.intervalFlag)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
    },
    screenAdapt () {
      const titleFontsize = this.$refs.rank_ref.offsetWidth / 100 * 3.6
      const adaptData = {
        title: {
          textStyle: {
            fontSize: titleFontsize
          }
        },
        series: [
          {
            barWidth: titleFontsize,
            itemStyle: {
              barBorderRadius: [titleFontsize / 2, titleFontsize / 2, 0, 0]
            }
          }
        ]
      }
      this.chartInstance.setOption(adaptData)
      this.chartInstance.resize()
    },
    startInterval () {
      if (this.intervalFlag !== null) {
        clearInterval(this.intervalFlag)
      }
      this.intervalFlag = setInterval(() => {
        this.endValue++
        this.startValue++
        if (this.endValue > this.allData.length - 1) {
          this.endValue = 9
          this.startValue = 0
        }
        const intervalData = {
          dataZoom: {
            startValue: this.startValue,
            endValue: this.endValue
          }
        }
        this.chartInstance.setOption(intervalData)
      }, 2000)
    }
  },
  computed: {
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
  created () {
    this.$socket.registerCallBack('rankData', this.getData)
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'rankData',
      chartName: 'rank',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapt)
  },
  destroyed () {
    this.$socket.unregisterCallBack('rankData')
    window.removeEventListener('resize', this.screenAdapt)
    clearInterval(this.intervalFlag)
  }
}
</script>

<style lang="less"  scoped>

</style>
