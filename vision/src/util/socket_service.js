export default class SocketService {
  // 单例模式
  static instance = null
  ws = null
  connected = false
  callBackMapping = {}
  retrySendCount = 0
  retryConnectCount = 0
  static get Instance () {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  connect () {
    if (!window.WebSocket) {
      return console.log('您的浏览器不支持WebSocket')
    }
    this.ws = new window.WebSocket('ws://localhost:9998')
    this.ws.onopen = () => {
      console.log('连接成功')
      this.connected = true
      this.retryConnectCount = 0
    }
    this.ws.onclose = () => {
      this.connected = false
      this.retryConnectCount++
      setTimeout(() => {
        this.connect()
      }, 500 * this.retryConnectCount)
      console.log('连接失败')
    }
    this.ws.onmessage = (msg) => {
      const receiveData = JSON.parse(msg.data)
      const { action, socketType } = receiveData
      console.log(action, socketType)
      if (this.callBackMapping[socketType]) {
        if (action === 'getData') {
          const { data: chartData } = receiveData
          this.callBackMapping[socketType].call(this, JSON.parse(chartData))
        } else if (action === 'fullScreen') {
          this.callBackMapping[socketType].call(this, receiveData)
        } else if (action === 'themeChange') {
          this.callBackMapping[socketType].call(this, receiveData)
        }
      }
    }
  }

  registerCallBack (socketType, callback) {
    this.callBackMapping[socketType] = callback
  }

  unregisterCallBack (socketType) {
    this.callBackMapping[socketType] = null
  }

  send (data) {
    if (this.connected === true) {
      this.ws.send(JSON.stringify(data))
      this.retrySendCount = 0
    } else {
      this.retrySendCount++
      setTimeout(() => {
        this.send(data)
      }, 500 * this.trySendCount)
    }
  }
}
