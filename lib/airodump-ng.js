
const AirShell = require('./airshell');

class Airodump extends AirShell {
    constructor() {
        super().on('stderr', data => this.emit('data', stdOutParser(data)));
        this._command = 'airodump-ng';
    }
};

let stdOutParser = function (data) {
    return data;
};

module.exports = Airodump;
