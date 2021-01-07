const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ImageminPlugin = require("imagemin-webpack-plugin").default;
const ImageminMozjpeg = require("imagemin-mozjpeg");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const globule = require('globule');

const targetTypes = { ejs : 'html', js : 'js' };

const getEntriesList = (targetTypes) => {
  const entriesList = {};
  for(const [ srcType, targetType ] of Object.entries(targetTypes)) {
    const filesMatched = globule.find([`**/*.${srcType}`, `!**/_*.${srcType}`], { cwd : `${__dirname}/src` });

    for(const srcName of filesMatched) {
      const targetName = srcName.replace(new RegExp(`.${srcType}$`, 'i'), `.${targetType}`);
      entriesList[targetName] = `${__dirname}/src/${srcName}`;
    }
  }
  return entriesList;
};

const app = {
  mode: "production",

  //entry: "./src/index.js",
  entry: "./src/index.ts",

  devtool: "source-map",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/main.js?[hash]"
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
      filename: "css/style.css?[hash]"
    }),

    // new CopyPlugin({
    //   patterns: [
    //     { from: "src/img", to: "img" },
    //     { from: "./src/favicon.png", to: "favicon.png" },
    //     { from: "./src/favicon.svg", to: "favicon.svg" }
    //   ]
    // }),

    // new ImageminPlugin({
    //   test: /\.(jpe?g|png|gif|svg)$/i,
    //   pngquant: {
    //     quality: "70-80"
    //   },
    //   gifsicle: {
    //     interlaced: false,
    //     optimizationLevel: 10,
    //     colors: 256
    //   },
    //   svgo: {},
    //   plugins: [
    //     ImageminMozjpeg({
    //       quality: 85,
    //       progressive: true
    //     })
    //   ]
    // }),

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

for(const [ targetName, srcName ] of Object.entries(getEntriesList({ ejs : 'html' }))) {
  app.plugins.push(new HtmlWebpackPlugin({
    filename : targetName,
    template : srcName
  }));
};

module.exports = app;
