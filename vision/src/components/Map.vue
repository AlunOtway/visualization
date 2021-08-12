<template>
    <div class="com-container">
      <div class="com-chart" ref="map_ref" @dblclick.stop="reverseMap"></div>
    </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '../util/map_utils.js'
import { mapState } from 'vuex'
export default {
  name: 'Map',
  data: function () {
    return {
      chartInstance: null,
      allData: null,
      axios,
      mapData: {},
      clickFlag: null
    }
  },
  methods: {
    async initChart () {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, this.theme)
      const { data: ret } = await this.axios.get('http://localhost:8999/static/map/china.json')
      this.$echarts.registerMap('china', ret)
      const initOption = {
        title: {
          text: '▎商家分布图',
          top: 40,
          left: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          itemStyle: {
            areaColor: '#2e72bf',
            borderColor: '#393939'
          },
          top: '15%',
          bottom: '15%'
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstance.setOption(initOption)
      this.chartInstance.on('click', async args => {
        const provinceInfo = await getProvinceMapInfo(args.name)
        if (typeof provinceInfo.key === 'undefined') {
          return
        }
        if (!this.mapData[provinceInfo.key]) {
          const { data: ret } = await this.axios.get('http://localhost:8999/' + provinceInfo.path)
          this.mapData[provinceInfo.key] = ret
          this.$echarts.registerMap(provinceInfo.key, this.mapData[provinceInfo.key])
        }
        const flag = setTimeout(() => {
          const changeOption = {
            geo: {
              map: provinceInfo.key
            }
          }
          this.chartInstance.setOption(changeOption)
        }, 300)
        this.clickFlag = flag
      })
    },
    screenAdapt () {
      const titleFontsize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adaptData = {
        title: {
          textStyle: {
            fontSize: titleFontsize
          }
        },
        legend: {
          itemWidth: titleFontsize / 2,
          itemHeight: titleFontsize / 2,
          itemGap: titleFontsize / 2,
          textStyle: {
            fontSize: titleFontsize / 2
          }
        }
      }
      this.chartInstance.setOption(adaptData)
      this.chartInstance.resize()
    },
    async getData (ret) {
      // const { data: ret } = await this.$http('map')
      this.allData = ret
      this.updateChart()
    },
    updateChart () {
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        return {
          name: item.name,
          type: 'effectScatter',
          data: item.children,
          coordinateSystem: 'geo',
          rippleEffect: {
            scale: 8,
            brushType: 'stroke'
          }
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstance.setOption(dataOption)
    },
    reverseMap () {
      clearTimeout(this.clickFlag)
      const reverseOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstance.setOption(reverseOption)
    }
  },
  created () {
    this.$socket.registerCallBack('mapData', this.getData)
  },
  computed: {
    ...mapState(['theme'])
  },
  watch: {
    theme: function () {
      this.chartInstance.dispose()
      console.log(this.allData)
      this.initChart()
      this.updateChart()
      this.screenAdapt()
    }
  },
  mounted () {
    this.initChart()
    window.addEventListener('resize', this.screenAdapt)
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    this.screenAdapt()
  },
  destroyed () {
    this.$socket.unregisterCallBack('mapData')
    window.removeEventListener('resize', this.screenAdapt)
  }
}
</script>

<style scoped>

</style>
