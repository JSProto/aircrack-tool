
const AirShell = require('./airshell');

class Airodump extends AirShell {
    constructor() {
        super(...arguments).on('stderr', data => this.emit('data', stdOutParser(data)));
        this._command = 'airodump-ng';
    }
};

let stdOutParser = function (data) {
    let hasHitIfaces = false;

    data = data.split(/\t+/).join(' & ').split('\n').map(d => d.trim());

    console.log(data);

return data;
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

module.exports = Airodump;
