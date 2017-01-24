
const AirWrapper = require('./air-wrapper');

class Aireplay extends AirWrapper {
    constructor() {
        super(...arguments).on('stdout', data => this.emit('data', stdOutParser(data)));
        this._command = 'aireplay-ng';
    }
};

let stdOutParser = function (data) {
    return data;
};

module.exports = Aireplay;
