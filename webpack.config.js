const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
// const ImageminPlugin = require("imagemin-webpack-plugin").default;
// const ImageminMozjpeg = require("imagemin-mozjpeg");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const globule = require('globule');

const targetTypes = { ejs : 'html', js : 'js' };

const getEntriesList = (targetTypes) => {
  const entriesList = {};
  for(const [ srcType, targetType ] of Object.entries(targetTypes)) {
    const filesMatched = globule.find([`**/*.${srcType}`, `**/**/*.${srcType}`, `!**/_*.${srcType}`], { cwd : `${__dirname}/src` });

    for(const srcName of filesMatched) {
      const targetName = srcName.replace(new RegExp(`.${srcType}$`, 'i'), `.${targetType}`);
      entriesList[targetName] = `${__dirname}/src/${srcName}`;
    }
  }
  return entriesList;
};

console.log(__dirname)
const app = {
  mode: "production",

  //entry: "./src/index.js",
  // entry: "./src/index.ts",

  entry: {
    common: "./src/common/ts/app.ts",
    30: "./src/30/ts/app.ts",
    52: "./src/52/ts/app.ts",
    // 追加したいディレクトリをここに追記していく
  },

  devtool: "source-map",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: (pathData) => {
      return pathData.chunk.name === 'common' ? "common/js/app.js?[hash]" : "[name]/js/app.js?[hash]";
    },
  },

  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          fix: true, //autofixモードの有効化
          failOnError: true //エラー検出時にビルド中断
        }
      },

      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },

      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },

      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,

          {
            loader: "css-loader",
            options: {
              url: false
            }
          },

          "postcss-loader"
        ]
      },

      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false
            }
          },

          "postcss-loader",

          "sass-loader"
        ]
      },

      {
        test : /\.ejs$/,
        exclude: /node_modules/,
        use  : [
          'html-loader',
          'ejs-html-loader'
        ]
      }
    ]
  },

  //追加
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    publicPath: '/',
    open: true, //起動時にブラウザを開く
    overlay: true, //エラーをオーバーレイ表示
    watchContentBase: true
  },

  plugins: [
    new CleanWebpackPlugin({ verbose: true }),
    new MiniCssExtractPlugin({
      filename: "[name]/css/style.css?[hash]"
    }),

    new StyleLintPlugin({
      configFile: ".stylelintrc",
      fix: true //自動修正可能なものは修正
    })
  ],

  //import文で拡張子が.tsのファイルを解決する
  resolve: {
    extensions: [".ts", ".js", ".json"]
  }
};

Object.keys(app.entry).forEach((key) => {
  app.plugins.push(
    new HtmlWebpackPlugin({
      template: (key==='common') ?  './src/index.ejs' : './src/' + key + '/index.ejs', // Source
      filename: (key==='common') ?  './index.html' : './' + key + '/index.html', // Dist
      inject: true,
      chunks: [key], // insert to the root of output folder
    })
  );
})

/** Imageのコピー */
const assetList = []
Object.keys(app.entry).forEach((key) => {
  assetList.push(
    { from: './src/' + key + '/asset/', to: './' + key + '/asset' }
  )
})
console.log(assetList)
app.plugins.push(
  new CopyPlugin({
    patterns: assetList
  })
)

module.exports = app;
