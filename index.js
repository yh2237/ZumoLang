const fs = require("fs");
const yaml = require('js-yaml');
const tokenize = require("./src/tokenizer.js");
const Interpreter = require("./src/interpreter.js");

const config = yaml.load(fs.readFileSync('config/config.yml', 'utf8'));

if (!process.argv[2]) {
    console.log("How to use: zumo <File Path> <debug>");
    process.exit(0);
} else if (process.argv[2] === "-v" || process.argv[2] === "--version") {
    console.log(`Version: ${config.version}`);
    process.exit(0);
} else {

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
}