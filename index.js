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
			currSize = -1,
			pulse,
			fileSizeChangeHandler,
			errorHandler,
			movement;
		
		fileSizeChangeHandler = function(newSize) {
			if(currSize !== -1){
				watcher.emit('sizeChange',newSize);
			}
			currSize = newSize;
		};
	
		errorHandler = function(error) {
			watcher.emit('error',error);
		};
	
		movement = function(){
			checkFileSize(fileName, currSize, fileSizeChangeHandler, errorHandler);
		};

		watcher.go = function() { 
			pulse = setInterval( movement, (ms || 1000)); 
		};
		
		watcher.stop = function() { pulse && clearInterval(pulse); };

		watcher.go();
		return watcher;
	}
};
