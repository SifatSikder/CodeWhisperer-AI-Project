const vscode = require('vscode');
const WebSocket = require('ws');
const { executeCommand } = require('./utils/executeCommands');

// function activate(context) {
// 	const ws = new WebSocket.Server({ port: 8000 });
// 	ws.on('connection', (websocket) => {
// 		websocket.on('message', (message) => {
// 			console.log(message.toString('utf-8'));
// 			const command = message.toString('utf-8')
// 			executeCommand(vscode, command);
// 		});
// 	});
// }
function activate(context) {
	const command = 'paste to line 23';
	// const command = 'copy from line 4 to 7'
	executeCommand(vscode, command);

}
module.exports = { activate };




