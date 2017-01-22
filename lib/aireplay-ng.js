const AirShell = require('./airshell');

class Aireplay extends AirShell {
    constructor() {
        super().on('stdout', data => this.emit('data', stdOutParser(data)));
        this._command = 'aireplay-ng';
    }
};

let stdOutParser = function (data) {
    return data;
};

module.exports = Aireplay;
