/*jshint node: true*/

var log = require('./file2');
var log2 = require('./file3');
var log3 = require('./file4');

for (var i = 0; i < 10; i++) {
    if (i > 10) {
        log('i > 10');
    }
    log2('i = ' + i);
    log3('i = ' + i);
}
