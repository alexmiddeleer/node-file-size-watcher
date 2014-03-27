node-file-size-watcher
===============

Watches files for size changes in Node.js. Tiny, unit tested, and no dependencies.

###Usage
`watch(fd, [interval], [onErr], [onReady])`

Returns an [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

 * fd - File descriptor (anything fs.stat accepts for a file descriptor)
 * interval - pause between checks in milliseconds.
 * onErr - Error handler.  Users can listen for `'error'` events themselves, but setting this avoids possible race conditions.
 * onRead - Same thing as onErr, but for `'ready'` event.

###Events

 * `'sizeChange'` - passes new size and old size to listeners.
 * `'ready'` - passes initial size to listeners (called only once).
 * `'error'` - Passes any error objects to listeners. Includes ENOENTs, so prepare for lots of those if the file is missing. Program will keep running regardless of whether this is listened to.

###Example

``` js
// Example usage:
// $node filename fileToWatch
// Then add some text to fileToWatch and save it.
var fileName = process.argv[2];

require('file-size-watcher').watch(fileName).on('sizeChange',
	function callback(newSize, oldSize){
		console.log('The file size changed to ' + newSize);
	}
);
```
