node-file-size-watcher
===============

Watches files for size changes in Node.js. Tiny, unit tested, and no dependencies.

``` js
// Example usage:
// $node filename fileToWatch
// Then add some text to fileToWatch and save it.
var fileName = process.argv[2];

require('./index.js').watch(fileName).on('sizeChange',
	function callback(newSize){
		console.log('The file size changed to ' + newSize);
	}
);
```
