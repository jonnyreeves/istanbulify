//   Copyright 2014 François de Campredon
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
/*jshint node:true*/

var istanbul = require('istanbul');
var through = require('through');
var path = require('path');
var esprima = require('esprima');
var minimatch = require('minimatch');


var instrumenter = new istanbul.Instrumenter();
function instrument(file, data) {
     return instrumenter.instrumentSync(data, file);
}

module.exports = function istanbulify(file, options) {
    var data = '';
    return through(write, end);

    function write (buf) { 
        data += buf; 
    }
    function end () {
        var src;
        try {
            src = (shouldIgnoreThisFile()) ? data : instrument(file, data);
        } catch (error) {
            this.emit('error', error);
        }
        this.queue(src);
        this.queue(null);
    }
    function shouldIgnoreThisFile() {
        return includesIgnoreComment() || isExcluded();
    }
    function includesIgnoreComment() {
        var syntax = esprima.parse(data, {comment: true});
        return syntax.comments && syntax.comments.some(function (comment) {
            return comment.type === 'Block' && /^\s*istanbulify +ignore +file\s*$/.test(comment.value);
        })
    }

    function isExcluded() {
        return getExcludeGlobs().some(function (glob) {
            return minimatch(path.relative(process.cwd(), file), glob);
        });
    }

    function getExcludeGlobs() {
        var value = options.exclude;

        if (!value) {
            return [];
        }
        else {
            return (Array.isArray(value)) ? value : [ value ];
        }
    }
};
