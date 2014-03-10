var events = require('events'),
	fs = require('fs');

function checkFileSize (fn, oldSize, cb, onErr) {
	fs.stat(fn, function(error, info){
		if (error) {
			onErr(error);
			// If file missing, we'll just say it's size changed to 0.
			// The ENOENT will also be emitted.
			if (error.code=="ENOENT") {
				if(0 != oldSize){
					cb(0);
				}
			};
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
			check,
			going = false;
		
		fileSizeChangeHandler = function(newSize) {
			if(currSize !== -1){
				watcher.emit('sizeChange', newSize, currSize);
			} else {
				watcher.emit('ready', newSize);
			}
			currSize = newSize;
		};
	
		errorHandler = function(error) {
			watcher.emit('error',error);
		};
	
		check = function(){
			checkFileSize(fileName, currSize, fileSizeChangeHandler, errorHandler);
		};

		watcher.go = function() { 
			if (!going) pulse = setInterval( check, (ms || 1000)); 
			going = true;
		};
		
		watcher.stop = function() { 
			pulse && clearInterval(pulse); 
			going = false;
		};

		watcher.info = function() {
			return {
				size: currSize
			};
		};

		// Immediately check file size to set baseline.  Then start watching on an interval.
		check();
		watcher.once('ready',function() { watcher.go(); });
		watcher.once('error',function() { watcher.go(); });
		return watcher;
	}
};
