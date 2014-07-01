Istanbulify
===========

browserify v2 plugin that allows you to instrument your source using [istanbul](https://github.com/gotwarlost/istanbul)

Instalation:
============

```
npm install istanbulify
```

Usage:
============
To instrument your source during the browserify bundling simply use the `-t`options of browserify passing istanbulify as argument: 

```
browserify -t istanbulify myfile.js > bundle.js
```

Ignoring files :
============

To ignore a file during bundling either add a block comments containing `/* istanbulify ignore file */ ` in your file
or pass one or more patterns as a transform argument:

```
browserify -t [ istanbullify -exclude test/**/*.js ] myfile.js > bundle.js
```


Credits:
=======

The code of this module has been greatly inspired by [coffeify](https://github.com/substack/coffeeify).