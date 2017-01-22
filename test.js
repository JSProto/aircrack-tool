
const Air = require('./');
// const AirTest = require('./test/');
const fs = require('fs');
const path = require('path');

// -c 11 --update 3 --wps -a

let fileCounter = 0;
let shell = new Air.dump(['wlan1', '-a', '--wps', '-c', '11', '--update', '3']);

shell.on('debug', function(){
    if ('exec' == name) return;
    let [name, action, ...args] = arguments;
    console.log(name, action, args);
});


shell.on('stderr', function(data){
    if (this._isDead) return;

    let filename  = [this._command, 'stderr', ++fileCounter, 'txt'].join('.');
    let filepath  = path.resolve(__dirname, './test/dump/', filename);
    // console.log(filepath);
    fs.writeFile(filepath, data, 'utf8', (err) => {
        if (err) throw err;
        this.debug('dump saved to ' + filepath);
    });
});



shell.exec(['./test/dump/airdump.txt']);


let cmd = `
    -i, --ivs
          It  only  saves  IVs  (only  useful  for  cracking).  If this option is specified, you have to give a dump prefix
          (--write option)

    -g, --gpsd
          Indicate that airodump-ng should try to use GPSd to get coordinates.

    -w <prefix>, --write <prefix>
          Is the dump file prefix to use. If this option is not given, it will only show data on the  screen.  Beside  this
          file a CSV file with the same filename as the capture will be created.

    -e, --beacons
          It will record all beacons into the cap file. By default it only records one beacon for each network.

    -u <secs>, --update <secs>
          Delay <secs> seconds delay between display updates (default: 1 second). Useful for slow CPU.

    --showack
          Prints  ACK/CTS/RTS  statistics.  Helps  in debugging and general injection optimization. It is indication if you
          inject, inject too fast, reach the AP, the frames are valid encrypted frames. Allows one to detect "hidden"  sta‐
          tions, which are too far away to capture high bitrate frames, as ACK frames are sent at 1Mbps.

    -h
          Hides known stations for --showack.

    --berlin <secs>
          Time  before removing the AP/client from the screen when no more packets are received (Default: 120 seconds). See
          airodump-ng source for the history behind this option ;).

    -c <channel>[,<channel>[,...]], --channel <channel>[,<channel>[,...]]
          Indicate the channel(s) to listen to. By default airodump-ng hop on all 2.4GHz channels.

    -b <abg>, --band <abg>
          Indicate the band on which airodump-ng should hop.
          It can be a combination of 'a', 'b' and 'g' letters  ('b'  and 'g' uses 2.4GHz and 'a' uses 5GHz).
          Incompatible with --channel option.

    -s <method>, --cswitch <method>
          Defines  the  way  airodump-ng  sets  the  channels when using more than one card.
          Valid values: 0 (FIFO, default value), 1 (Round Robin) or 2 (Hop on last).

    -r <file>
          Reads packet from a file.

    -x <msecs>
          Active Scanning Simulation (send probe requests and parse the probe responses).

    -M, --manufacturer
          Display a manufacturer column with the information obtained from the IEEE OUI list. See airodump-ng-oui-update(8)

    -U, --uptime
          Display APs uptime obtained from its beacon timestamp.

    -W, --wps
          Display a WPS column with WPS version, config method(s), AP Setup  Locked  obtained  from  APs  beacon  or  probe
          response (if any).

    --output-format <formats>
          Define  the  formats to use (separated by a comma). Possible values are: pcap, ivs, csv, gps, kismet, netxml. The
          default values are: pcap, csv, kismet, kismet-newcore.  'pcap' is for recording a capture in pcap  format,  'ivs'
          is for ivs format (it is a shortcut for --ivs). 'csv' will create an airodump-ng CSV file, 'kismet' will create a
          kismet csv file and 'kismet-newcore' will create the kismet netxml file. 'gps' is a shortcut for --gps.
          Theses values can be combined with the exception of ivs and pcap.

    -I <seconds>, --write-interval <seconds>
          Output file(s) write interval for CSV, Kismet CSV and Kismet NetXML in seconds (minimum: 1 second). By default: 5
          seconds. Note that an interval too small might slow down airodump-ng.

    --ignore-negative-one
          Removes the message that says 'fixed channel <interface>: -1'.

    Filter options:

    -t <OPN|WEP|WPA|WPA1|WPA2>, --encrypt <OPN|WEP|WPA|WPA1|WPA2>
          It will only show networks matching the given encryption. May be specified more than once: '-t OPN -t WPA2'

    -d <bssid>, --bssid <bssid>
          It will only show networks, matching the given bssid.

    -m <mask>, --netmask <mask>
          It will only show networks, matching the given bssid ^ netmask combination. Need --bssid (or -d) to be specified.

    -a
          It will only show associated clients.

    -N, --essid
          Filter APs by ESSID. Can be used several times to match a set of ESSID.

    -R, --essid-regex
          Filter APs by ESSID using a regular expression.`



// process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
    shell.kill();
    if (options.cleanup) console.log('process.exit clean');
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));
