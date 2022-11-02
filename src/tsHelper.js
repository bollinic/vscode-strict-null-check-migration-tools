// @ts-check
const path = require('path');
const ts = require('typescript');
const fs = require('fs');

module.exports.getImportsForFile = function getImportsForFile(file, srcRoot) {
    // console.log(file);
    const fileInfo = ts.preProcessFile(fs.readFileSync(file).toString());
    // console.log(fileInfo.importedFiles);
    return fileInfo.importedFiles
        .map(importedFile => importedFile.fileName)
        .filter(fileName => !/css/.test(fileName)) // remove css imports
        .filter(x => /\//.test(x)) // remove node modules (the import must contain '/')
        .filter(x => !/@elastic/.test(x))
        .filter(x => !/@eui/.test(x)) 
        .filter(x => !/emotion/.test(x)) 
        .filter(x => !/unfetch\/polyfill/.test(x)) 
        .filter(x => !/json/.test(x)) 
        .filter(x => !/svg/.test(x)) 
        .filter(x => !/png/.test(x)) 
        .filter(x => !/loadable/.test(x)) 
        .filter(x => !/lodash/.test(x)) 
        .filter(x => !/brace/.test(x)) 
        .filter(x => !/txt/.test(x)) 
        .filter(x => !/launchdarkly/.test(x)) 
        .map(fileName => {
            if (/(^\.\/)|(^\.\.\/)/.test(fileName)) {
                return path.join(path.dirname(file), fileName);
            }
            if (/^public/.test(fileName)) {
                return path.join(srcRoot, fileName);
            }
            return fileName;
        }).map(fileName => {
            let newFileName;
            if (fileName.match(/@/)) {
                newFileName = fileName.replace('@', srcRoot)
            } else {
                newFileName = fileName
            }
            if (fs.existsSync(`${newFileName}.tsx`)) {
                return `${newFileName}.tsx`;
            }
            if (fs.existsSync(`${newFileName}.ts`)) {
                return `${newFileName}.ts`;
            }
            if (fs.existsSync(`${newFileName}/index.ts`)) {
                return `${newFileName}/index.ts`;
            }
            if (fs.existsSync(`${newFileName}/index.tsx`)) {
                return `${newFileName}/index.tsx`;
            }
            if (fs.existsSync(`${newFileName}.js`)) {
                return `${newFileName}.js`;
            }
            if (fs.existsSync(`${newFileName}.d.ts`)) {
                return `${newFileName}.d.ts`;
            }
            throw new Error(`Unresolved import ${newFileName} in ${file}`);
        });
};
