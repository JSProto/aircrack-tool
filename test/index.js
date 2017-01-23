
const fs = require('fs');
let Air = require('../');

let exec = function (files) {

    let streamName = (this._command == 'airodump-ng' ? 'stderr' : 'stdout');

    this.debug('exec', this._command);

    files.forEach((file) => {
	    fs.readFile(file, (error, data) => {
	        if (error) {
	            this.debug('error', error);
	            return this.emit('error', error);
	        }

	        data = data.toString('utf8');
	        this.debug(streamName, data);
	        if (!this._isDead) {
	            this.emit(streamName, data);
	        }

	    });
    });

    // this.debug('exit', 0);
    // this.emit('exit', 0);
    // this.debug('close', 0);
    return this;
};

Air.abstract.prototype.exec = exec;


module.exports = Air;
