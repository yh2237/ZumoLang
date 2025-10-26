function evaluate(expr, scope, cells, current, evaluateFn) {
    if (!expr || expr.trim() === '') return undefined;

    const scopeKeys = Object.keys(scope);
    const scopeValues = Object.values(scope);

    let processedExpr = expr.replace(/ﾓモ\s+"([^"]*)"\s+(\w+)/g, (match, val, type) => {
        if (type === 'inc') {
            return cells.findIndex(c => c == val);
        }

        return -1;
    });

    const assignmentMatch = processedExpr.match(/^(ｽﾞモ|ｽﾞズ)\s*\[\s*(.*?)\s*\]\s*=\s*(.*)$/);
    if (assignmentMatch) {
        const [, command, indexExpr, valueExpr] = assignmentMatch;
        const index = evaluateFn(indexExpr, scope);
        const value = evaluateFn(valueExpr, scope);
        cells[index] = value;
        return value;
    }

    const safeExpr = processedExpr
        .replace(/ﾓﾓ\s*\[\s*(.*?)\s*\]/g, (match, p1) => `cells[${evaluateFn(p1, scope)}]`)
        .replace(/ﾓｽﾞ/g, `cells[current]`)
        .replace(/ﾓズ/g, `current`);

    try {
        const func = new Function(...scopeKeys, "cells", "current", `return ${safeExpr}`);
        return func(...scopeValues, cells, current);
    } catch (e) {
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return expr.slice(1, -1);
        }
        if (!isNaN(parseFloat(expr)) && isFinite(expr)) {
            return parseFloat(expr);
        }
        console.error(`[ERROR] Failed to evaluate expression: "${expr}" with safe expression: "${safeExpr}"`, e);
        return undefined;
    }
}

module.exports = evaluate;