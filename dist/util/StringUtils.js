"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function camelCase(str, firstCapital) {
    if (firstCapital === void 0) { firstCapital = false; }
    return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2, offset) {
        if (firstCapital === true && offset === 0)
            return p1;
        if (p2)
            return p2.toUpperCase();
        return p1.toLowerCase();
    });
}
exports.camelCase = camelCase;
//# sourceMappingURL=StringUtils.js.map