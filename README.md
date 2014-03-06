node-file-size-watcher
===============

Watches files for growth in Node.

``` js
// Example usage (run with "node filename fileToWatch")
var fileName = process.argv[2];

require('file-size-watcher').makeFileWatcher(fileName, 1000).on('sizeChange',
	function callback(newSize){
		console.log('The file size changed to ' + newSize);
	}
).on('error',function(e) {
	console.error(e);
});
```
