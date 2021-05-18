const path = require('path');
// 引入path模块
function resolve(dir) {
  return path.join(__dirname, dir);// path.join(__dirname)设置绝对路径
}

module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: '',
  lintOnSave: true,
  runtimeCompiler: false,
  productionSourceMap: true,
  devServer: {
    open: true, // npm run serve后自动打开页面
    host: '0.0.0.0', // 匹配本机IP地址(默认是0.0.0.0)
    port: 8080, // 开发服务器运行端口号
    proxy: null,
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('./src'))
      .set('components', resolve('./src/components'))
      .set('views', resolve('src/views'))
      .set('assets', resolve('src/assets'));
  },
};
