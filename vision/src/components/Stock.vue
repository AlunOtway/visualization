<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Stock',
  data: function () {
    return {
      allData: null,
      chartInstance: null,
      currentIndex: 0,
      intervalFlag: null
    }
  },
  methods: {
    initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.stock_ref, this.theme)
      const initData = {
        title: {
          text: '▎库存销售量',
          left: 20,
          top: 20
        }
      }
      this.chartInstance.setOption(initData)
      this.startInterval()
      this.chartInstance.on('mouseover', () => {
        clearInterval(this.intervalFlag)
      })
      this.chartInstance.on('mouseout', () => {
        this.startInterval()
      })
      this.screenAdapt()
    },
    async getData (ret) {
      // const { data: ret } = await this.$http.get('stock')
      this.allData = ret
      this.updateChart()
    },
    updateChart () {
      const centerArr = [
        ['18%', '40%'],
        ['50%', '40%'],
        ['82%', '40%'],
        ['34%', '75%'],
        ['66%', '75%']
      ]
      const colorArr = [
        ['#4FF778', '#0BA82C'],
        ['#E5DD45', '#E8B11C'],
        ['#E8821C', '#E55445'],
        ['#5052EE', '#AB6EE5'],
        ['#23E5E5', '#2E72BF']
      ]
      const start = this.currentIndex * 5
      const end = (this.currentIndex + 1) * 5
      const currentShowList = this.allData.slice(start, end)
      const itemShowList = currentShowList.map((item, index) => {
        return {
          type: 'pie',
          center: centerArr[index],
          label: {
            position: 'center',
            color: colorArr[index][0]
          },
          data: [
            {
              name: item.name + '\n\n' + item.sales,
              value: item.sales,
              itemStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 1, 0, 0, [
                  {
                    offset: 0,
                    color: colorArr[index][0]
                  },
                  {
                    offset: 1,
                    color: colorArr[index][1]
                  }
                ])
              }
            },
            {
              value: item.stock,
              itemStyle: {
                color: '#333843'
              }
            }
          ],
          hoverAnimation: false,
          labelLine: {
            show: false
          }
        }
      })
      const updateData = {
        series: itemShowList
      }
      this.chartInstance.setOption(updateData)
    },
    screenAdapt () {
      const titleFontsize = this.$refs.stock_ref.clientWidth / 100 * 3.6
      const innerRadius = titleFontsize * 2.5
      const outterRadius = innerRadius * 1.125
      console.log(innerRadius, outterRadius)
      const adaptData = {
        title: {
          textStyle: {
            fontSize: titleFontsize
          }
        },
        series: [
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontsize / 1.5
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontsize / 1.5
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontsize / 1.5
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontsize / 1.5
            }
          },
          {
            type: 'pie',
            radius: [outterRadius, innerRadius],
            label: {
              fontSize: titleFontsize / 1.5
            }
          }
        ]
      }
      this.chartInstance.resize()
      this.chartInstance.setOption(adaptData)
    },
    startInterval () {
      if (this.intervalFlag) {
        clearInterval(this.intervalFlag)
      }
      this.intervalFlag = setInterval(() => {
        if (this.currentIndex === 0) {
          this.currentIndex = 1
        } else {
          this.currentIndex = 0
        }
        this.updateChart()
      }, 5000)
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
    this.$socket.registerCallBack('stockData', this.getData)
  },
  mounted () {
    this.initChart()
    this.$socket.send({
      action: 'getData',
      socketType: 'stockData',
      chartName: 'stock',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapt)
  },
  destroyed () {
    this.$socket.registerCallBack('stockData')
    clearInterval(this.intervalFlag)
  }
}
</script>

<style lang="less" scoped>

</style>
