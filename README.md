# SplitChunkPlugin for Webpack 3

This plugin move common module to common chunk.

## Requirements

This module requires a minimum of Webpack v3.0.0.

## Getting Started

To begin, you'll need to install `webpack-split-chunk-plugin`:

```console
$ npm install webpack-split-chunk-plugin --save-dev
```

Then add the plugin to your `webpack` config. For example:

**webpack.config.js**

```js
const SplitChunkPlugin = require('webpack-split-chunk-plugin');

module.exports = {
  //...
  plugins: [
    new SplitChunkPlugin()
  ]
};
```

And run `webpack` via your preferred method.

## Options

### `maxChunkSize`

Type: `Number`
Default: `100 * 1024 bytes`

The size of chunk considered as target.

```js
// in your webpack.config.js
new SplitChunkPlugin({
  maxChunkSize: 100 * 1024
})
```

### `maxSize`

Type: `Number`
Default: `30 * 1024 bytes`

The maximum size of common chunk before new common chunk will be created.

```js
// in your webpack.config.js
new SplitChunkPlugin({
  maxSize: 50 * 1024
})
```

### `minModules`

Type: `Number`
Default: `10`

The min occurrences of module in chunk. If module occurrences is bigger than minModules, it will be considered as target.

```js
// in your webpack.config.js
new SplitChunkPlugin({
  minModules: 10
})