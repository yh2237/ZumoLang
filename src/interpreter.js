const evaluate = require('./evaluator.js');
const execute = require('./executor.js');

class Interpreter {
    constructor() {
        this.cells = [];
        this.current = 0;
        this.functions = {};
    }

    _evaluate(expr, scope) {
        const evaluateFn = (e, s) => this._evaluate(e, s);
        return evaluate(expr, scope, this.cells, this.current, evaluateFn);
    }

    execute(tokens, scope = {}, isFunctionCall = false) {
        return execute(this, tokens, scope, isFunctionCall);
    }
}

module.exports = Interpreter;