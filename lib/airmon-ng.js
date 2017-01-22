

const AirAbstract = require('./air-abstract');

const reNotFound = /Wireless tools not found/;
const reMode = /(\w+) mode vif (\w+) (?:on|for) \[(\w+)\](\w+)(?: on \[(\w+)\](\w+))?/;


class Airmon extends AirAbstract {
    constructor() {
        super(...arguments).on('stdout', data => {
            if (reNotFound.exec(data)) {
                throw new Error(data);
            }
            else {
                this.emit('data', stdOutParser(data));
            }
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

    static check() {
        return new Airmon('check');
    }

    static kill() {
        return new Airmon('check', 'kill');
    }
};


let stdOutParser = function (data) {
    let hasHitIfaces = false;

    data = data.split(/\t+/).join(' & ').split('\n');

    let rows = data.filter((row) => {
        if (row === '') return false;
        if (row === 'PHY & Interface & Driver & Chipset') {
            hasHitIfaces = true;
            return false;
        }

        return hasHitIfaces && true;
    }).map((row)=>{
        let [phy, iface, driver, chipset] = row.split(' & ');
        return phy ? {phy, iface, driver, chipset} : row;
    });

    let ifaces = rows.filter(row => !!row.phy);

    rows.filter(row => !row.phy).map((row) => {
        let [description, mode, status, phy, iface, phy2, iface2] = reMode.exec(row) || [];
        return {mode, status, phy, iface, given: iface2, description};
    }).forEach((row) => {
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


module.exports = Airmon;
