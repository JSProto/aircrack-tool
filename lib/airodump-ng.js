
const AirAbstract = require('./air-abstract');

let reNoInterfaceSpecified = /No interface specified/;
/**
 * Don't use argument -M (--manufacturer)
 */
class Airodump extends AirAbstract {
    constructor() {
        super(...arguments).on('stderr', data => {
            if (reNoInterfaceSpecified.exec(data)) {
                throw new Error(reNoInterfaceSpecified.source);
            }

            data = stdErrParser(data);

            if (!data) return;

            this.emit('data', data);
        });

        this._command = 'airodump-ng';
    }
};


let stdErrParser = function (data) {

    data = data.split('\n').map(d => d.trim());

    let waps = data.map(row => row.match(reAccessPoint))
                        .filter(notEmpty)
                        .map(rowToCells)
                        .map(rowWapArrayToObject);

    if (!waps.length) return false;

    let clients = data.map(row => row.match(reClient))
                        .filter(notEmpty)
                        .map(rowToCells)
                        .map(rowStationArrayToObject);

    clients.forEach(client => {
        let wap = waps.find(ap => ap.bssid === client.bssid);
        if (wap) {
            wap.clients.push(client);
        }
    });

    return {waps, clients};
};

let notEmpty = function(row){
    return !!row;
};

let rowToCells = function(cells) {
    return Array.from(cells).map(cell => cell === undefined ? null : String(cell).trim());
};

let rowWapArrayToObject = function (array){
    let [match, bssid, pwr, rxq, beacons, data, packets, channel, mb, enc, cipher, auth, uptime, wps, essid] = array;
    return {bssid, pwr, rxq, beacons, data, packets, channel, mb, enc, cipher, auth, uptime, wps, essid, clients: []};
};

let rowStationArrayToObject = function (array){
    let [match, bssid, station, pwr, rate, lost, frames, probe] = array;
    return {bssid, station, pwr, rate, lost, frames, probe};
};

let reAccessPoint = new RegExp([
    '([\\w:]{17})',                     // 1, BSSID     MAC адрес точки доступа
    '(\\-\\d{1,2})',                    // 2, PWR       Уровень сигнала
    '(\\d+)?',                          // 3, RXQ       Качество получения измеряется как процент пакетов успешно полученных за последние 10 секунд
    '(\\d+)',                           // 4, Beacons   Количество маяков, отправленных ТД
    '(\\d+)',                           // 5, #Data     Количество захваченных пакетов данных
    '(\\d+)',                           // 6, #/s       Количество пакетов данных в секунду, измеренное за последние 10 секунд.
    '(\\d{1,2})',                       // 7, CH        Номер канала
    '([\\w\\d]+[\\s\\.]{1,2}?)',        // 8, MB        Максимальная скорость, поддерживаемая ТД
    '(\\w{3}\\d?)',                     // 9, ENC       Используемый алгоритм шифрования OPN, WEP, WPA/WPA2
    '(\\w{3,4})?',                      // 10, CIPHER   Обнаруженный шифр. CCMP, WRAP, TKIP, WEP, WEP40, или WEP104.
    '(\\w{3})?',                        // 11, AUTH     Используемый протокол аутентификации:
                                        //                  MGT (WPA/WPA2 используя отдельный сервер аутентификации),
                                        //                  SKA (общий ключ для WEP),
                                        //                  PSK (предварительно согласованный ключ для WPA/WPA2)
                                        //                  OPN (открытый для WEP).
    '(\\d+d\\s\\d+:\\d+:\\d+\\s+)?',    // 12, UPTIME
].join('\\s+') + [
    '([\\d\\.]+(?:\\s[\\w,]+)?\\s+)?',  // 13, WPS      поддерживаемая версия WPS и метод конфигурации:
                                        //                  USB = метод USB
                                        //                  ETHER = Ethernet
                                        //                  LAB = Label
                                        //                  DISP = Display
                                        //                  EXTNFC = Внешний NFC
                                        //                  INTNFC = Внутренний NFC
                                        //                  NFCINTF = Интерфейс NFC
                                        //                  PBC = Нажатием кнопки
                                        //                  KPAD = Keypad
                                        //                  Locked, отображается когда настройка ТД заблокирована.
    '(.+)'                              // 14, ESSID
].join(''));

let reClient = new RegExp([
    '([\\w:]{17})',         // 1, BSSID
    '([\\w:]{17})',         // 2, STATION
    '(-?\\d+)',             // 3, PWR
    '(\\w+\\s?-\\s?\\w+)',  // 4, Rate
    '(\\d+)',               // 5, Lost
    '(\\d+)',               // 6, Frames
].join('\\s+')
    + '(\\s+\\w+)?');       // 7, Probe

module.exports = Airodump;

