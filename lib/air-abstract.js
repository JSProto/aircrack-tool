
const EventEmitter = require('events');
const spawn = require('child_process').spawn;
const reRunAsRoot = /Run it as root/;

class AirAbstract extends EventEmitter {

    constructor() {
        super();

        let [...args] = arguments;
        this._args = args;
        this._isDead = false;
        this._stdDump = false;
        this._command = null;

        return this.on('kill', () => this._isDead = true);
    }

    debug() {
        return this.emit('debug', this._command, ...arguments);
    }

    kill() {
        this.debug('kill');
        return  this.emit('kill');
    }

    exec() {

        if (!this._command)
            throw new Error('_command not defined!');

        let child = spawn(this._command, this._args);

        this.debug('exec', child, this._args);

        child.stdout.setEncoding('utf8');
        child.stderr.setEncoding('utf8');

        let processor = function(streamName) {
            return (data) => {
                data = data.toString('utf8');

                if (reRunAsRoot.exec(data))
                    throw new Error(data);

                this.debug(streamName, data);
                if (!this._isDead) {
                    this.emit(streamName, data);
                }
            }
        };

        child.stdout.on('data', processor.call(this, 'stdout'));
        child.stderr.on('data', processor.call(this, 'stderr'));

        child.on('error', error => this.debug('error', error) && this.emit('error', error));
        child.on('exit', code => this.debug('exit', code) && this.emit('exit', code));
        child.on('close', code => this.debug('close', code));

        return this.once('kill', () => child.kill());
    }
};

module.exports = AirAbstract;
