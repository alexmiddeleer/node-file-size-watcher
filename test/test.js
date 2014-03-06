// requires mocha (npm install mocha -g)
var assert = require('assert'),
	fs = require('fs'),
	fn = 'test/testfile',
	fsw = require('../index.js')

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
		throw(e);
	});
	setTimeout(function tooSlow() {
		if(notDone)	throw("test timed out");
	}, 2000);
}

function emoteSuccess (testDesc) {
	console.log("Test Passed.");
}

// First just create a file to test with
before(function(done){
	console.log("Creating a test file");
	makeFileGrow("Creating a file\n", function() {
		watcher = fsw.watch(fn, 1000);
		done();
	});
});

// Test to see if watcher detects file growth.  
describe('watching',function(){
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
	
			makeFileShrink("testing... 2\n", function afterAfterShrink(err) {
				if (err) { 
					done(err);
				} 
			});
		});
	});
});

// Remove the testing file after tests finish
after(function(done) {
	console.log("Removing test file...");
	fs.unlink(fn, function(e) {
		done();
	});
});
