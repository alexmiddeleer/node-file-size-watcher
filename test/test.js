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

function listenForSizeChange (watcher, cb) {
	var notDone = true
	watcher.on('sizeChange', function(){
		notDone = false;
		cb();	
	});
	watcher.on('error',function(e) {
		throw(e);
	});
	setTimeout(function tooSlow() {
		if(notDone)	throw("test timed out");
	}, 2000);
}

// -------------------------------------------------------
// First just create a file to test with
// -------------------------------------------------------
beforeEach(function(done){
	makeFileGrow("Creating a file\n", done);
});

// -------------------------------------------------------
// Test to see if watcher detects file growth.  
// -------------------------------------------------------
describe('watch',function(){
	describe('#growth', function(){
		it('should see file grow', function(done) {
			var watcher = fsw.watch(fn, 1000);
			listenForSizeChange(watcher, function() {
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

// -------------------------------------------------------
// Remove the testing file after tests finish
// -------------------------------------------------------
afterEach(function(done) {
	fs.unlink(fn, function(e) {
		done();
	});
});
