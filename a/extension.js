const vscode = require('vscode');
const WebSocket = require('ws');

function activate(context) {
	const websocket = new WebSocket('ws://localhost:5000/ws');

	websocket.on('open', () => {
		console.log('WebSocket connection established');
		vscode.window.showInformationMessage('WebSocket connection established.');
	});

	websocket.on('message', (data) => {
		console.log(`Received: ${data}`);
		const message = JSON.parse(data.toString('utf-8'));
		vscode.window.showInformationMessage(message.message);
	});

	websocket.on('close', () => {
		console.log('WebSocket connection closed');
	});

	websocket.on('error', (error) => {
		console.error(`WebSocket error: ${error}`);
	});

	context.subscriptions.push({
		dispose: () => { websocket.close(); }
	});
}

module.exports = {
	activate
};
