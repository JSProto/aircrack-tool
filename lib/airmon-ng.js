

const AirWrapper = require('./air-wrapper');

const reNotFound = /wireless tools not found/i;
const reMode = /(\w+) mode vif (\w+) (?:on|for) \[(\w+)\](\w+)(?: on \[(\w+)\](\w+))?/;


class Airmon extends AirWrapper {
    constructor() {
        super(...arguments).on('stdout', data => {
            if (reNotFound.exec(data)) {
                throw new Error(data);
            }
            this.emit('data', stdOutParser(data));
        });

        this._command = 'airmon-ng';
    }

    static list() {
        return new Airmon();
    }

    static stop(wlan) {
        return new Airmon('stop', ...arguments);
    }

    static start(wlan, channel = null) {
        return new Airmon('start', ...arguments);
    }
};


let stdOutParser = function (data) {
    let hasHitIfaces = false;

    data = data.split(/\t+/).join(' & ').split('\n');

    data = data.filter((row) => {
        if (row === '') return false;
        if (row === 'PHY & Interface & Driver & Chipset') {
            hasHitIfaces = true;
            return false;
        }

        return hasHitIfaces && true;
    });

    let rows = data.map(rowArrayToObject);

    let ifaces = rows.filter(row => !!row.phy);

    rows.filter(row => !row.phy)
        .map(rowStatusArrayToObject).forEach((row) => {
            if (!row.mode) return;

            ifaces.forEach(iface => {
                if (iface.phy === row.phy) {
                    if (row.status == 'enabled') {
                        iface.mode = row.mode;
                    }

                    if (row.mode == 'monitor') {
                        if (row.status == 'enabled' && row.given) {
                            iface.given = row.given;
                        }

                        iface.description = row.description;
                    }
                }
            });
        });

    return ifaces;
};

let rowArrayToObject = function (array){
    let [phy, iface, driver, chipset] = array.split(' & ');
    return phy ? {phy, iface, driver, chipset} : array;
};

let rowStatusArrayToObject = function (array){
    let [description, mode, status, phy, iface, phy2, iface2] = reMode.exec(array) || [];
    return {mode, status, phy, iface, given: iface2, description};
};

module.exports = Airmon;
