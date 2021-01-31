module.exports = {
  publicPath: './',
  outputDir: 'dist',
  assetsDir: '',
  lintOnSave: false,
  runtimeCompiler: false,
  productionSourceMap: true,
  devServer: {
    open: true, // npm run serve后自动打开页面
    host: '0.0.0.0', // 匹配本机IP地址(默认是0.0.0.0)
    port: 8080, // 开发服务器运行端口号
    proxy: null,
  },
};
