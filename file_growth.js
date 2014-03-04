// -----------------------------------------------------
// Returns an event emitter. Usage:  
// require('fileWatcher')(fileName, cb).on('sizeChanged',
//    function callback(newSize){
//    console.log('The file size changed to ' + newSize);
//    }
// );
//
// cb should be of the form: function(error) {...}
// -----------------------------------------------------
var events = require('events'),
	fs = require('fs');

function checkFileSize (fn, oldSize, cb, onErr) {
	fs.stat(fn, function(error, info){
		if (error) {
			onErr(error);
		} else {
			if(info.size != oldSize){
				cb(info.size);
			}
		}
	});
}

module.exports = {
	makeFileWatcher: function(fileName, ms){
		var watcher = new events.EventEmitter(),
			currSize = -1;
		
		var fileSizeChangeHandler = function(newSize) {
			if(currSize !== -1){
				watcher.emit('sizeChange',newSize);
			}
			currSize = newSize;
		};
	
		var errorHandler = function(error) {
			watcher.emit('error',error);
		};
	
	setInterval(function(){
			checkFileSize(fileName, currSize, fileSizeChangeHandler, errorHandler);
		}, (ms || 1000));
	
		return watcher;
	}
};
