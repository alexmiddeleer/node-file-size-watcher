var fileName = process.argv[2];

require('./index.js').makeFileWatcher(fileName, 1000).on('sizeChange',
	function callback(newSize){
		console.log('The file size changed to ' + newSize);
	}
).on('error',function(e) {
	console.error(e);
});

