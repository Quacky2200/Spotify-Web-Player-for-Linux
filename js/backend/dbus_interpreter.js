/*
 * @author Matthew James <Quacky2200@hotmail.com>
 * DBus Message Interpreter Language 
 * These are the messages that are 'encoded'/'decoded' by 
 * the DBus Service & Spotify Web Player so that they can
 * communicate over two different processes.
 *
 * Communication
 * The communication is simple, we just need to parse strings.
 * These strings are formatted like so:
 * message-data {hello:world}
 * the key 'message-data' tells us we would like to intepret a
 * message sent in/out. The string JSON afterwards tells us the
 * actual data being sent.
 * 
 * Data
 * The JSON string has a standard format of
 * {"command": "doSomething", args: {"key":"test"}}
 */
const interpreter = {
	/*
	 * Encapsulate an event object into a sendable string for decapsulation
         */
 	encapsulate: (data) => {
 		return 'message-data ' + JSON.stringify(data) + '\n';
 	},
	/*
	 * Try to get a message from the data string given
	 * @params data {String}
         */
 	decapsulate: (data) => {
	 	var match = data.toString().match(/(?:message\-data) (\{.*\})\n/);
	 	return (match ? JSON.parse(match[1]) : null)
 	},
	/*
	 * Setup handlers on a process I/O. 
         * MUST PASS A STDIN/STDOUT object!
         * @params std {object} The STDIN/STDOUT object
         * @params handlers {object} The dictionary of event handlers to be handled
	 */
	handle: (std, handlers) => {
	    std.on('data', function(data){
	        var message = interpreter.decapsulate(data.toString());
	        //Try processing the command/event
	        if(message && message.command && handlers.hasOwnProperty(message.command)) handlers[message.command](message.args);
	    });	
	},
	/*
	 * Send a message to a process 
         * MUST PASS A STDIN/STDOUT object!
         * @params std {object} The STDIN/STDOUT object
         * @params command {string} The event to be sent over and emit
	 * @params args {object} The dictionary of event handlers arguments to be sent
	 */
	send: (std, command, args) => {
	    std.write(interpreter.encapsulate({command: command, args: args}));
	}
 };
module.exports = interpreter;
