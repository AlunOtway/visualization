const WebSocket = require('ws')
const wss = new WebSocket.Server({'port': 9998})
const path = require('path')
const fileUtil = require('../utils/file_utils')
module.exports.listen = () => {
    wss.on('connection',client => {
        console.log("连接成功")
        client.on('message', async msg => {
            const res = JSON.parse(msg)
            const {action, socketType, chartName, value} = res
            //如否action是‘getData’则根据chartName拼接地址，将获取到json数据插入到msg对象的data属性当中，并将插入后的对象转换成JSON字符串响应回客户端。
            if (action == 'getData'){
                let filePath = `../data/${chartName}.json`
                filePath = path.join(__dirname,filePath)
                const fileData = await fileUtil.getFileJsonData(filePath)
                res.data = fileData
                client.send(JSON.stringify(res))
            //如否action不是‘getData’则根则原封不动的发送到每个连接成功的客户端；
            }else {
                wss.clients.forEach(client => {
                    client.send(JSON.stringify(res))
                })
            }
        })
    })
}