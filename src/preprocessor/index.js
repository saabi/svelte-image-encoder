const fs = require('fs')
const path = require('path');
const ts = require('typescript')
const tsConfig = require('../../tsconfig.json')

module.exports = {
preprocess: {
    script: ({ content, attributes, filename }) => {
    let transpiled
    if (attributes.src) {
        const filePath = path.resolve(path.dirname(filename), attributes.src)
        console.log(filename);
        transpiled = ts.transpileModule(fs.readFileSync(filePath).toString(), tsConfig)
    } 
    else if (attributes.type === 'typescript') {
        transpiled = ts.transpileModule(content, tsConfig)
    }
    else {
        return {code: content};
    }
    return {
        code: transpiled.outputText,
        map: transpiled.sourceMapText
    };
    }
}
}