node-file-size-watcher
===============

Watches files for growth in Node.

``` js
// Example usage:
// $node filename fileToWatch
// Then add some text to fileToWatch and save it.
var fileName = process.argv[2];

require('./index.js').watch(fileName, 1000).on('sizeChange',
	function callback(newSize){
		console.log('The file size changed to ' + newSize);
	}
).on('error',function(e) {
	console.error(e);
});
```
