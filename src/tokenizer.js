function tokenize(code) {
    const tokens = [];
    let position = 0;

    const zumoCommands = ["ｽﾞｽﾞ", "ｽﾞﾓ", "ｽﾞズ", "ｽﾞモ", "ﾓｽﾞ", "ﾓﾓ", "ﾓズ", "ﾓモ", "ズｽﾞ", "ズﾓ", "ズズ", "ズモ", "モｽﾞ", "モﾓ", "モズ", "モモ"];
    zumoCommands.sort((a, b) => b.length - a.length);

    while (position < code.length) {
        let char = code[position];

        if (/\s/.test(char)) {
            position++;
            continue;
        }
        if (code.substring(position, position + 2) === '//') {
            while (position < code.length && code[position] !== '\n') {
                position++;
            }
            continue;
        }

        let commandFound = false;
        for (const command of zumoCommands) {
            if (code.startsWith(command, position)) {
                tokens.push(command);
                position += command.length;
                commandFound = true;
                break;
            }
        }
        if (commandFound) {
            continue;
        }

        if (char === '"') {
            let value = '';
            position++;
            while (position < code.length && code[position] !== '"') {
                value += code[position];
                position++;
            }
            position++;
            tokens.push(`"${value}"`);
            continue;
        }

        let match = code.substring(position).match(/^[-]?\d+(\.\d+)?/);
        if (match) {
            tokens.push(match[0]);
            position += match[0].length;
            continue;
        }

        match = code.substring(position).match(/^[a-zA-Z_][a-zA-Z0-9_]*/);
        if (match) {
            tokens.push(match[0]);
            position += match[0].length;
            continue;
        }

        const operators = ['==', '!=', '<', '>', '+', '-', '*', '/', '%', '=', '(', ')', '{', '}', '[', ']', ';', ','];
        let foundOperator = false;
        for (const op of operators) {
            if (code.startsWith(op, position)) {
                tokens.push(op);
                position += op.length;
                foundOperator = true;
                break;
            }
        }
        if (foundOperator) {
            continue;
        }

        throw new Error(`Unknown token at position ${position}: ${code.substring(position, position + 10)}`);
    }
    return tokens;
}

module.exports = tokenize;
