const fs = require("fs");
const path = require("path");
const tokenize = require("./src/tokenizer.js");
const Interpreter = require("./src/interpreter.js");

const code = fs.readFileSync(process.argv[2], 'utf-8');

try {
    const tokens = tokenize(code);

    if (process.argv[3]) {
        console.log("[DEBUG]Tokens:", tokens);
    }
    const interp = new Interpreter();
    interp.execute(tokens);
} catch (e) {
    console.error("[FATAL ERROR]", e.message);
}