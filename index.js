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
	watch: function(fileName, ms){
		var watcher = new events.EventEmitter(),
			currSize = -1,
			pulse,
			fileSizeChangeHandler,
			errorHandler,
			check;
		
		fileSizeChangeHandler = function(newSize) {
			if(currSize !== -1){
				watcher.emit('sizeChange',newSize);
			}
			currSize = newSize;
		};
	
		errorHandler = function(error) {
			watcher.emit('error',error);
		};
	
		check = function(){
			checkFileSize(fileName, currSize, fileSizeChangeHandler, errorHandler);
		};

		// Immediately check file size to set baseline
		check();

		watcher.go = function() { 
			pulse = setInterval( check, (ms || 1000)); 
		};
		
		watcher.stop = function() { pulse && clearInterval(pulse); };

		// Start watching automatically
		watcher.go();
		return watcher;
	}
};
