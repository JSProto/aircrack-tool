
const AirAbstract = require('./air-abstract');

/**
 * Don't use argument -M (--manufacturer)
 */
class Airodump extends AirAbstract {
    constructor() {
        super(...arguments).on('stderr', data => this.emit('data', stdOutParser(data)));
        this._command = 'airodump-ng';
    }
};

let stdOutParser = function (data) {

    data = data.split('\n').map(d => d.trim());
    data = data.map((row) => {
        let cols = row.match(reAccessPoint);
        if (!cols) return false;

        cols = Array.from(cols).map(c => c === undefined ? null : String(c).trim());

        let [match, bssid, pwr, rxq, beacons, data, packets, channel, mb, enc, cipher, auth, uptime, wps, essid] = cols;

        return {bssid, pwr, rxq, beacons, data, packets, channel, mb, enc, cipher, auth, uptime, wps, essid};
    }).filter(row => !!row);


    return data;
};

let reAccessPoint = new RegExp([
    '([\\w:]+)',                        // 1, BSSID     MAC адрес точки доступа
    '(\\-\\d{1,2})',                    // 2, PWR       Уровень сигнала
    '(\\d+)',                           // 3, RXQ       Качество получения измеряется как процент пакетов успешно полученных за последние 10 секунд
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


module.exports = Airodump;
