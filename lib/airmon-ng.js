
const exec = require('child_process').exec;

let reMode = /(\w+) mode vif (\w+) (?:on|for) \[(\w+)\](\w+)(?: on \[(\w+)\](\w+))?/;

let parseStdOut = function (stdout) {
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
        let [status, mode, action, phy, iface, phy2, iface2] = reMode.exec(row) || [];
        return {mode, action, phy, iface, given: iface2, status};
    }).forEach((row) => {
        if (!row.mode) return;

        ifaces.forEach(iface => {
            if (iface.phy === row.phy) {
                if (row.action == 'enabled') {
                    iface.mode = row.mode;
                }

                if (row.mode == 'monitor') {
                    iface.action = row.action;

                    if (row.action == 'enabled' && row.given) {
                        iface.given = row.given;
                    }

                    iface.status = row.status;
                }
            }
        });
    });

    return ifaces;
};

let resultProcessor = function(interface, callBack){
    return function(error, stdout, stderr) {
        if(error !== null) {
            console.log('exec error: ' + error);
            callBack(error);
        }
        else {
            let ifaces = parseStdOut(stdout);
            let currentInterface = ifaces.filter(iface => interface === iface.iface).pop() || {};

            callBack(null, ifaces, currentInterface);
        }
    };
};

let shell = function (args) {
    return new Promise((resolve, reject) => {
        exec('airmon-ng' + args.join(' '), function(error, stdout, stderr){
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
}


let list = function(callBack) {
    return shell([]).then(parseStdOut);
};
let stop = function(interface, callBack) {
    return shell(['stop', interface]).then(parseStdOut);
};

let start = function(interface, callBack) {
    return shell(['start'].concat(interface)).then(parseStdOut);
};

// let list = function(callBack) {
//     exec('airmon-ng', resultProcessor(null, callBack));
// };

// let stop = function(interface, callBack) {
//     exec('airmon-ng stop ' + interface, resultProcessor(interface, callBack));
// };

// let start = function(interface, callBack) {
//     exec('airmon-ng start ' + (Array.isArray(interface) ? interface.join(' ') : interface), resultProcessor(interface, callBack));
// };

module.exports = {start, stop, list};

