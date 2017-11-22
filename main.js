var cheerio = require('cheerio')
var xlsx = require('xlsx-writestream');
/*
1, 下载网页
2, 分析网页内容
3, 用库读取网页并获取我们想要的内容
4, 保存我们想要的内容
*/

// ES5 定义一个类
// var Movie = function() {
//     this.name = ''
//     this.score = 0
//     this.quote = ''
//     this.ranking = 0
//     this.coverUrl = ''
// }

// ES6 定义一个类
class Movie {
    constructor() {
        this.duty = ''
        this.money = ''
        this.name = ''
        this.where = ''
        this.time = ''
    }
}

// 引入自己写的模块的 log 函数
var log = require('./utils').log
var cached_url = require('./utils').cached

var movieFromDiv = function(div) {
    var e = cheerio.load(div)
    // 创建一个类的实例并且获取数据
    // 这些数据都是从 html 结构里面人工分析出来的
    var movie = new Movie()
    movie.duty = e('.job-new-con-title').text()
    movie.money = e('.job-new-con-pay').text()
    movie.name = e('.job-new-con-conpany').text()
    movie.where = e('.job-new-con-area').text()
    movie.time = e('.job-new-con-time').text()
    return movie
}

var moviesFromUrl = function(url) {
    // 把数据缓存起来
    var body = cached_url(url)
    // log('body 解码后', body)
    // cheerio.load 用来把 HTML 文本解析为一个可以操作的 DOM
    var e = cheerio.load(body)
    // 可以使用选择器语法操作 cheerio 返回的对象
    var movieDivs = e('tr')
    var movies = []
    for (var i = 0; i < movieDivs.length; i++) {
        var div = movieDivs[i]
        // 获取到 div 的 html 内容
        // 然后扔给 movieFromDiv 函数来获取到一个 movie 对象
        var m = movieFromDiv(div)
        movies.push(m)
    }
    return movies
}

// 下载封面图
var downloadCovers = function(movies) {
    // 注意, request 是用来下载图片用的库, 这是另一个库了
    var request = require('request')
    var fs = require('fs')
    for (var i = 0; i < movies.length; i++) {
        var m = movies[i]
        var url = m.coverUrl
        var path = m.name.split('/')[0] + '.jpg'
        // 下载图片并保存的套路
        // log('url ', typeof url, url)
        request(url).pipe(fs.createWriteStream(path))
    }
}

var __main = function() {
    // 主函数
    var movies = []
    for (var i = 1; i < 100; i++) {
        var url = `http://hot.xmfish.com/chanel/job/search.html?page=${i}&sid=ff23c966b3c13254ab868c1cc7d3ba76`
        var ms = moviesFromUrl(url)
        movies = movies.concat(ms)
        // 到出表格文件
        xlsx.write('mySpreadsheet.xlsx', movies, function (err) {
            // Error handling here
        });
        // 引入自己的模块, 必须是 ./ 开头
        var utils = require('./utils')
        utils.save('fish.json', movies)
    }
    // 把 ms 数组里面的元素都添加到 movies 数组中

    // 下载封面图片
    // downloadCovers(movies)
}

__main()
