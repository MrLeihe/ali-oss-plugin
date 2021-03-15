## ali-oss-upload-plugin

A webpack plugin to upload assets to aliyun oss

一个上传文件到 `阿里云oss` 的 `webpack` 插件。

### 使用

1. 安装包

```bash
$ npm install ali-oss-upload-plugin or yarn add ali-oss-upload-plugin
```

2. 在 config 文件中引入，添加到 plugins

```javascript
const AliOssPlugin = require('ali-oss-upload-plugin')

// webpack config, oss 配置
const { OSS } = require('./oss')

new AliOssPlugin({
  region: OSS.REGION,
  accessKeyId: OSS.ACCESS_KEY_ID,
  accessKeySecret: OSS.ACCESS_KEY_SECRET,
  bucket: OSS.BUCKET,
  ossPath: OSS.PREFIX,
})

// oss.js，记得添加到 .gitignore，不要暴露到外网
module.exports = {
  OSS: {
    ACCESS_KEY_ID: 'your key',
    ACCESS_KEY_SECRET: 'your secret',
    BUCKET: 'your bucket',
    REGION: 'oss-cn-shenzhen',
    PREFIX: '要上传到的 oss 目录',
  },
}
```

### options 说明

|      参数       |           说明           |  类型   |         默认值         | 是否必填 |
| :-------------: | :----------------------: | :-----: | :--------------------: | :------: |
|     region      |      阿里云上传区域      | String  |    oss-cn-hangzhou     |          |
|   accessKeyId   |   阿里云的 accessKeyId   | String  |           -            |    是    |
| accessKeySecret | 阿里云的 accessKeySecret | String  |           -            |    是    |
|     bucket      |    上传到哪个 bucket     | String  |           -            |    是    |
|      debug      |         调试开关         | Boolean |         false          |          |
|     ossPath     | 上传到 bucket 的哪个目录 | String  | ''（不传则默认根目录） |          |
|    patterns     |    需要上传的文件规则    |  Array  |                        |          |
|     verbose     |     是否展示详细日志     | Boolean |          true          |          |
|     timeout     |       上传超时时间       | Number  |      60（单位秒）      |          |
|    overwrite    |     是否覆盖同名文件     | Boolean |         false          |          |
