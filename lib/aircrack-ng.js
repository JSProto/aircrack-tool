
const AirAbstract = require('./air-abstract');

class Aircrack extends AirAbstract {
    constructor() {
        super(...arguments).on('stderr', data => {throw data})
            .on('stdout', data => this.emit('data', stdOutParser(data)));
        this._command = 'aircrack-ng';
    }
};

let stdOutParser = function (data) {
    return data;
};

module.exports = Aircrack;