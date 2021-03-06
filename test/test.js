// requires mocha (npm install mocha -g)
var assert = require('assert'),
	fs = require('fs'),
	fn = 'test/testfile',
	fsw = require('../index.js'),
	watcher;

function makeFileGrow (txt, cb) {
	fs.appendFile(fn, txt, function(err) {
		cb(err);
	}); 
}

function makeFileShrink (txt, cb) {
	fs.truncate(fn, 1, function(err) {
		cb(err);
	}); 
}

function listenForSizeChange (watcher, cb) {
	var notDone = true,
		currSize = watcher.info().size;
	watcher.once('sizeChange', function(newSize){
		notDone = false;
		cb(newSize-currSize);	
	});
	watcher.once('error',function(e) {
		if (notDone) throw(e);
	});
	setTimeout(function tooSlow() {
		if(notDone)	throw("test timed out");
	}, 2000);
}

function ignoreSizeChange (watcher, cb) {
	var notDone = true;
	watcher.once('sizeChange', function(){
		if (notDone) throw("test failed.. to time out");
	});
	watcher.once('error',function(e) {
		if (notDone) throw(e);
	});
	setTimeout(function tooSlow() {
		notDone = false;
		cb();
	}, 500);
}

function emoteSuccess (testDesc) {
	console.log("Test Passed.");
}

// First just create a file to test with
before(function(done){
	console.log("Creating a test file");
	makeFileGrow("Creating a file\n", function() {
		watcher = fsw.watch(fn, 100);
		done();
	});
});

// Test to see if watcher detects file growth.  
describe('watcher',function(){
	describe('#changes', function(){
		var desc1 = "Test 1: File grows, watcher detects this.";
		it(desc1, function(done) {
			console.log(desc1);
			listenForSizeChange(watcher, function(sizeChange) {
				assert((sizeChange>0),"File size is positive");
				emoteSuccess(desc1);
				done();
			});
	
			makeFileGrow("testing...\n", function afterGrow(err) {
				if (err) { 
					done(err);
				} 
			});
		});

		var desc2 = "Test 2: File grows, watcher detects this.";
		it(desc2, function(done) {
			console.log(desc2);
			listenForSizeChange(watcher, function(sizeChange) {
				assert((sizeChange>0),"File size is positive");
				emoteSuccess(desc2);
				done();
			});
	
			makeFileGrow("testing... 2\n", function afterGrow(err) {
				if (err) { 
					done(err);
				} 
			});
		});

		var desc3 = "Test 3: File shrinks, watcher detects this.";
		it(desc3, function(done) {
			console.log(desc3);
			listenForSizeChange(watcher, function(sizeChange) {
				assert((sizeChange<0),"File size is negative");
				emoteSuccess(desc3);
				done();
			});
	
			makeFileShrink("testing... 3\n", function afterAfterShrink(err) {
				if (err) { 
					done(err);
				} 
			});
		});
	});

	describe("controlling",function(){

		var desc4 = "Test 4: stop watcher"
		it(desc4,function(done) {
			console.log(desc4);
			watcher.stop();
			ignoreSizeChange(watcher, function() {
				emoteSuccess(desc4);
				done();
			});

			makeFileGrow("testing... 4\n", function afterGrow(err) {
				if (err) { 
					done(err);
				} 
			});
		});

		var desc5 = "Test 5: resume watcher"
		it(desc5,function(done) {
			console.log(desc5);
			watcher.go();
			listenForSizeChange(watcher, function(sizeChange) {
				assert((sizeChange>0),"File size is positive");
				emoteSuccess(desc5);
				done();
			});

			makeFileGrow("testing... 5\n", function afterAfterShrink(err) {
				if (err) { 
					done(err);
				} 
			});
		});
	});

	describe('other stuff',function() {
		var desc6 = "Testing info()";
		it(desc6, function() {
			console.log(desc6);
			console.log("Size of file is: " + watcher.info().size + " bytes");
			assert(watcher.info().size>0,"Watcher.info reports positive size");
			emoteSuccess(desc6);
		});
	
		// Delete file then test to make sure watcher emits an error event
		var desc7 ='Testing error event emission';
		it(desc7, function(done) {
			console.log(desc7);
			watcher.on('error',function(e) {
				console.log("watcher correctly saw error: " + e);
				assert(e.toString()!=="","Testing error msg existence");
				done();
				emoteSuccess(desc7);
				watcher.stop();
				watcher.removeAllListeners();
			});
			console.log("Removing test file...");
			fs.unlink(fn, function(e) {
				if(e) throw(e);
			});
		});

		var desc8 ='Try running on nonexistent file';
		var newWatcher;
		it(desc8, function(done) {
			console.log(desc8);
			newWatcher = fsw.watch('test/doesNotExist.log',100);
			newWatcher.on('error',function(e) {});
			setTimeout(function() {
				emoteSuccess(desc8);
				done();
			}, 200);
		});

		var desc9 ='Watcher detects file appearing out of nonexistence as a size change.';
		it(desc9, function(done) {
			console.log(desc9);
			fn = 'test/doesNotExist.log';
			listenForSizeChange(newWatcher, function(sizeChange) {
				assert((sizeChange>0),"File size is positive");
				emoteSuccess(desc9);
				done();
			});
			makeFileGrow("testing...\n", function afterGrow(err) {
				if (err) { 
					done(err);
				} 
			});
		});
	});
});

after(function(done) {
	fs.unlink(fn, function(e) {
		if(e) throw(e);
		done();
	});
});
