//--------------------GOTO LINE X------------------------

function needToMove(grammaticalLine) {
    const lineNumberRegex = /line (\d+)/i;
    const match = grammaticalLine.match(lineNumberRegex);
    if (match) return match[1]
    else return null
}

function moveCursorToLine(lineNumber, vscode) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = new vscode.Position(lineNumber - 1, 0);
        const newSelection = new vscode.Selection(position, position);
        editor.selection = newSelection;
        editor.revealRange(newSelection);
    }
}

function handleCursorMove(grammaticalLine, vscode) {
    const lineNumber = needToMove(grammaticalLine)
    if (lineNumber != null) {
        moveCursorToLine(lineNumber, vscode)
        return true
    }
    else return false;

}


//--------------------SELECT LINES FROM X TO Y------------------------
function needToSelect(grammaticalLine) {
    const selectLinesRegex = /^\s*(select|choose) (line|lines)(?: from)? (\d+) to (\d+)\s*$/i;
    const match = grammaticalLine.match(selectLinesRegex);
    if (match) {
        return [match[3], match[4]];
    } else {
        return null;
    }
}

function selectLines(startLine, endLine, vscode) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const startPosition = new vscode.Position(startLine - 1, 0);
        const endPosition = new vscode.Position(endLine - 1, 0);
        const range = new vscode.Range(startPosition, endPosition);
        editor.selection = new vscode.Selection(range.start, range.end);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
    }
}

function handleSelection(grammaticalLine, vscode) {
    const lineNumbers = needToSelect(grammaticalLine)
    if (lineNumbers != null) {
        selectLines(parseInt(lineNumbers[0]), parseInt(lineNumbers[1]) + 1, vscode)
        return true
    }
    else return false;
}

//--------------------------COPY-------------------------------------
function needToCopy(grammaticalLine) {
    const copyRegex = /copy\s+from\s+line\s+(\d+) to (\d+)/i;
    const match = grammaticalLine.match(copyRegex);
    if (match) {
        const startLine = parseInt(match[1]);
        const endLine = parseInt(match[2]);
        console.log(startLine, endLine);
        return { startLine, endLine };
    }
    return null

}

function copy(startLine, endLine, vscode) {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const linesText = [];
    for (let lineNumber = startLine - 1; lineNumber < endLine; lineNumber++) {
        const lineText = document.lineAt(lineNumber).text;
        linesText.push(lineText);
    }
    const linesContent = linesText.join('\n');
    vscode.env.clipboard.writeText(linesContent);
    vscode.window.showInformationMessage(`Lines from ${startLine} to ${endLine} copied to clipboard.`);

}

function handleCopy(grammaticalLine, vscode) {
    const lines = needToCopy(grammaticalLine)

    if (lines != null) {
        copy(lines.startLine, lines.endLine, vscode)
        return true
    }
    else return false;

}


//--------------------------PASTE-------------------------------------
function needToPaste(grammaticalLine) {
    const pasteRegex = /\bpaste(?:\s+(?:at|to)\s+line)?\s+(\d+)/i;
    const match = grammaticalLine.match(pasteRegex);
    if (match) {
        const lineNumber = parseInt(match[1]);
        return lineNumber
    }
    return null
}
async function paste(lineNumber, vscode) {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    try {

        const clipboardContent = await vscode.env.clipboard.readText();
        const position = new vscode.Position(lineNumber - 1, 0);
        const edit = new vscode.TextEdit(new vscode.Range(position, position), clipboardContent);
        const editBuilder = new vscode.WorkspaceEdit();
        editBuilder.set(document.uri, [edit]);

        await vscode.workspace.applyEdit(editBuilder);
        vscode.window.showInformationMessage(`Clipboard content pasted at line ${lineNumber}.`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error reading clipboard: ${error.message}`);
    }
}

function handlePaste(grammaticalLine, vscode) {

    const lineNumber = needToPaste(grammaticalLine)
    if (lineNumber != null) {
        paste(lineNumber, vscode)
        return true
    }
    else return false;
}


//--------------------------UNDO-------------------------------------
function needToUndo(grammaticalLine) {
    const undoRegex = /\bundo\b/i;
    const match = grammaticalLine.match(undoRegex);
    if (match) {
        return true
    }
    return false
}

function handleUndo(grammaticalLine, vscode) {
    if (needToUndo(grammaticalLine)) {
        vscode.commands.executeCommand('undo');
        return true
    }
    else return false;
}


//--------------------------REDO-------------------------------------
function needToRedo(grammaticalLine) {
    const undoRegex = /\bredo\b/i;
    const match = grammaticalLine.match(undoRegex);
    if (match) {
        return true
    }
    return false
}

function handleRedo(grammaticalLine, vscode) {
    if (needToRedo(grammaticalLine)) {
        vscode.commands.executeCommand('redo');
        return true
    }
    else return false;
}


//--------------------PRINT X------------------------
function handlePrint(grammaticalLine) {

    const printRegex = /^(print|log|output|console\.log|console|)\s+(.+)$/i;
    const printMatch = grammaticalLine.match(printRegex);
    if (printMatch) {
        return `console.log('${printMatch[2]}');\n`;
    }
    else return false
}


module.exports = function convertGrammaticalLineToCode(vscode, grammaticalLine) {
    let executedInternalCommand = false

    if (handleCopy(grammaticalLine, vscode) || handlePaste(grammaticalLine, vscode) || handleUndo(grammaticalLine, vscode) || handleRedo(grammaticalLine, vscode) || handleCursorMove(grammaticalLine, vscode) || handleSelection(grammaticalLine, vscode)) {
        executedInternalCommand = true
    }

    if (handlePrint(grammaticalLine)) return handlePrint(grammaticalLine)

    if (executedInternalCommand) { return executedInternalCommand }
    return null;
};



//handled commands:
// go to line x
// print x
// select lines x to y
//copy from line x to y
//paste at line x
//undo
//redo

