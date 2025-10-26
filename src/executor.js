function _readExpression(tokens, startIndex, endChar = ';') {
    const exprTokens = [];
    let i = startIndex;
    let parenCount = 0;
    while (i < tokens.length) {
        const token = tokens[i];
        if (token === '(') parenCount++;
        if (token === ')') parenCount--;
        if (parenCount === 0 && token === endChar) {
            break;
        }
        if (parenCount < 0) {
            break;
        }
        exprTokens.push(token);
        i++;
    }
    const consumed = exprTokens.length + (tokens[i] === endChar ? 1 : 0);
    return { expression: exprTokens.join(' '), consumed };
}

function _findMatchingBrace(tokens, startIndex) {
    let braceCount = 1;
    let i = startIndex + 1;
    while (i < tokens.length && braceCount > 0) {
        if (tokens[i] === "{") braceCount++;
        else if (tokens[i] === "}") braceCount--;
        i++;
    }
    return i - 1;
}

function execute(interpreter, tokens, scope = {}, isFunctionCall = false) {
    let i = 0;
    let returnValue = undefined;

    while (i < tokens.length) {
        const token = tokens[i];
        switch (token) {
            case "ｽﾞｽﾞ":
            case "ｽﾞﾓ": {
                const { expression, consumed } = _readExpression(tokens, i + 1);
                returnValue = interpreter.cells[interpreter.current] = interpreter._evaluate(expression, scope);
                i += 1 + consumed;
                break;
            }
            case "ｽﾞズ":
            case "ｽﾞモ": {
                const cellIndex = interpreter._evaluate(tokens[i + 2], scope);
                const { expression, consumed } = _readExpression(tokens, i + 4);
                interpreter.cells[cellIndex] = interpreter._evaluate(expression, scope);
                i += 4 + consumed;
                break;
            }
            case "ズｽﾞ": {
                const { expression, consumed } = _readExpression(tokens, i + 1);
                interpreter.current += interpreter._evaluate(expression, scope);
                i += 1 + consumed;
                break;
            }
            case "ズﾓ": {
                const { expression, consumed } = _readExpression(tokens, i + 1);
                interpreter.current = interpreter._evaluate(expression, scope);
                i += 1 + consumed;
                break;
            }
            case "ズモ": {
                const { expression, consumed } = _readExpression(tokens, i + 1);
                console.log(interpreter._evaluate(expression, scope));
                i += 1 + consumed;
                break;
            }
            case "ズズ":
                console.log(interpreter.cells[interpreter.current] ?? "");
                i++;
                break;

            case "モｽﾞ": {
                i++;
                const condResult = _readExpression(tokens, i + 1, ')');
                const conditionExpr = condResult.expression;
                i += 1 + condResult.consumed;

                const bodyStart = i;
                const bodyEnd = _findMatchingBrace(tokens, bodyStart);
                const bodyTokens = tokens.slice(bodyStart + 1, bodyEnd);

                if (interpreter._evaluate(conditionExpr, scope)) {
                    interpreter.execute(bodyTokens, scope);
                    i = bodyEnd + 1;
                    while (i < tokens.length && tokens[i] === 'else') {
                        i++;
                        if (tokens[i] === 'モｽﾞ') {
                            i++;
                            const skipCondEnd = _readExpression(tokens, i, ')').consumed;
                            i += skipCondEnd;
                        }
                        const skipBodyEnd = _findMatchingBrace(tokens, i);
                        i = skipBodyEnd + 1;
                    }
                } else {
                    i = bodyEnd + 1;
                    if (i < tokens.length && tokens[i] === 'else') {
                        i++;
                        if (tokens[i] === 'モｽﾞ') {
                            continue;
                        } else {
                            const elseBodyStart = i;
                            const elseBodyEnd = _findMatchingBrace(tokens, elseBodyStart);
                            const elseBodyTokens = tokens.slice(elseBodyStart + 1, elseBodyEnd);
                            interpreter.execute(elseBodyTokens, scope);
                            i = elseBodyEnd + 1;
                        }
                    }
                }
                continue;
            }

            case "モﾓ": {
                i++;
                i++;
                const initExpr = _readExpression(tokens, i, ';').expression;
                i += _readExpression(tokens, i, ';').consumed;
                const condExpr = _readExpression(tokens, i, ';').expression;
                i += _readExpression(tokens, i, ';').consumed;
                const incExpr = _readExpression(tokens, i, ')').expression;
                i += _readExpression(tokens, i, ')').consumed;

                const bodyStart = i;
                const bodyEnd = _findMatchingBrace(tokens, bodyStart);
                const bodyTokens = tokens.slice(bodyStart + 1, bodyEnd);

                for (interpreter._evaluate(initExpr, scope); interpreter._evaluate(condExpr, scope); interpreter._evaluate(incExpr, scope)) {
                    interpreter.execute(bodyTokens, scope);
                }
                i = bodyEnd + 1;
                break;
            }

            case "モズ": {
                const funcName = tokens[i + 1];
                const argName = tokens[i + 3];
                let bodyStart = i + 5;
                while (tokens[bodyStart] !== '{') bodyStart++;

                const bodyEnd = _findMatchingBrace(tokens, bodyStart);
                const bodyTokens = tokens.slice(bodyStart + 1, bodyEnd);
                interpreter.functions[funcName] = { argName, bodyTokens };
                i = bodyEnd + 1;
                break;
            }
            case "モモ": {
                const callName = tokens[i + 1];
                const { expression, consumed } = _readExpression(tokens, i + 2, ';');
                const callArgExpr = expression.slice(expression.indexOf('(') + 1, expression.lastIndexOf(')')).trim();

                const func = interpreter.functions[callName];
                if (func) {
                    const argValue = interpreter._evaluate(callArgExpr, scope);
                    const newScope = { ...scope };
                    newScope[func.argName] = argValue;

                    const savedCells = JSON.parse(JSON.stringify(interpreter.cells));
                    const savedCurrent = interpreter.current;

                    returnValue = interpreter.execute(func.bodyTokens, newScope, true);

                    interpreter.cells = savedCells;
                    interpreter.current = savedCurrent;
                }
                i += 1 + consumed;
                break;
            }
            default:
                i++;
                break;
        }
    }
    if (isFunctionCall) {
        return returnValue;
    }
}

module.exports = execute;