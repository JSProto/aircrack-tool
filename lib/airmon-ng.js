
const exec = require('child_process').exec;

const reMode = /(\w+) mode vif (\w+) (?:on|for) \[(\w+)\](\w+)(?: on \[(\w+)\](\w+))?/;


let stdOutParser = function (stdout) {
    let data = stdout.split(/\t+/).join(' & ').split('\n');
    let hasHitIfaces = false;

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

let shell = function () {
    let args = Array.from(arguments).join(' ');

    return new Promise((resolve, reject) => {
        exec('airmon-ng' + args, function(error, stdout, stderr){
            if (error) {
                reject(error);
            }
            else {
                if (stderr.length > 0) {
                    console.log(stderr);
                }

                resolve(stdout);
            }
        });
    });
};


let list = function() {
    return shell().then(stdOutParser);
};

let stop = function(interface) {
    return shell('stop', ...arguments).then(stdOutParser);
};

let start = function(interface, channel = null) {
    return shell('start', ...arguments).then(stdOutParser);
};

let check = function() {
    return shell('check');
};

let kill = function() {
    return shell('check', 'kill');
};

module.exports = {start, stop, list, check, kill};
