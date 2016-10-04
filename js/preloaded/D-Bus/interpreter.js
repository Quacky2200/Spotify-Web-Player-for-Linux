const EventEmitter = require('events');

class DBusInterpreter extends EventEmitter {
    constructor(stdin, stdout){
        super();
        this.stdin = stdin;
        this.stdout = stdout;
        if(this.stdin) this.stdin.on('data', (data) => {
            var message = this.decapsulate(data.toString());
            if(message) {
                //console.log('Emit command: ' + message.command);
                this.emit(message.command, message.args);
            }
        });
    }
    /*
     * Encapsulate an event object into a sendable string for decapsulation
     */
    encapsulate(data) {
        return 'message-data ' + JSON.stringify(data) + '\n';
    }
    /*
     * Try to get a message from the data string given
     * @params data {String}
     */
    decapsulate(data) {
        var match = data.toString().match(/(?:message\-data) (\{.*\})\n/);
        return (match ? JSON.parse(match[1]) : null)
    }
    /*
     * Try to send a command message out to STDOUT
     */
    send(command, args){
        //console.log('Sending command \'' + command + '\'');
        if(this.stdout) this.stdout.write(this.encapsulate({command: command, args: args}));
    }
}
module.exports = DBusInterpreter;