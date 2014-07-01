/*jshint node:true*/

var test = require('tape').test;
var browserify = require('browserify');
var vm = require('vm');
var fs = require('fs');

function makeBundle(file, options, cb) {
    if (!cb) {
        cb = options;
        options = {};
    }
    var b = browserify();
    b.add(__dirname + '/' + file);
    b.transform(options, __dirname + '/..');
    b.bundle(function (err, src) {
        if (err) {
            cb(err);
        }
        else {
            cb(null, generateCoverageReport(src));
        }
    });
}

function generateCoverageReport(src) {
    var sandBox = {
        __coverage__: null,
        console: {
            log: function () { }
        }
    };
    vm.runInNewContext(src, sandBox);
    return sandBox.__coverage__;
}

function reportContainsFile(coverageReport, filename) {
    return __dirname + '/' + filename in coverageReport;
}

test('test instrumentation is added', function (t) {
    t.plan(1);
    var expected = JSON.parse(fs.readFileSync(__dirname + '/expectedCoverage.json', 'UTF-8').replace(/\{\{dirname\}\}/g, __dirname));

    makeBundle('samples/file1.js', function (err, coverage) {
        if (err) {
            t.fail(err);
        }
        else {
            t.deepEqual(coverage, expected);
        }
    });
});

test('file is excluded via `istanbulify ignore file` block comment', function (t) {
    t.plan(1);

    makeBundle('samples/file1.js', function (err, coverage) {
        if (err) {
            t.fail(err);
        }
        else {
            t.ok(!reportContainsFile(coverage, 'samples/file2.js'), 'file excluded by comment block');
        }
    });
});

test('file is excluded via `exclude` glob', function (t) {
    t.plan(1);

    makeBundle('samples/file1.js', { exclude: '**/f*3.js' }, function (err, coverage) {
        if (err) {
            t.fail(err);
        }
        else {
            t.ok(!reportContainsFile(coverage, 'samples/file3.js'), 'file excluded by exclude glob');
        }
    });
});

test('multiple exclude globs can be supplied as an Array', function (t) {
    t.plan(1);

    makeBundle('samples/file1.js', { exclude: [ '**/file3.js', '**/file4.js' ] }, function (err, coverage) {
        if (err) {
            t.fail(err);
        }
        else {
            t.ok(!(reportContainsFile(coverage, 'samples/file3.js') || reportContainsFile(coverage, 'samples/file4.js')
            ), 'both files excluded by exclude glob');
        }
    });
});

test('file exclude globs are relative to the current working directory', function (t) {
    t.plan(1);

    makeBundle('samples/file1.js', { exclude: 'test/samples/file3.js' }, function (err, coverage) {
        if (err) {
            t.fail(err);
        }
        else {
            t.ok(!reportContainsFile(coverage, 'samples/file3.js'), 'exclude glob based on current working directory');
        }
    });
});