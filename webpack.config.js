module.exports = {
    entry: './src/app.js',
    output: {
        path: './dist',
        filename: 'app.bundle.js',
        publicPath: '/dist/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        },
        {
            test: /bootstrap/,
            loader: 'imports?jQuery=jquery,$=jquery,this=>window'
        },
        {
            test: /\.scss$/,
            loaders: ["style", "css", "sass"]
        }]
    }
}
