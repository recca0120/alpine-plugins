import DotJson from 'dot-json';
import { exec } from 'child_process';
import readline from 'readline';

export const runFromPackage = (pkg, command) => {
    exec(command, { cwd: __dirname + '/../packages/' + pkg });
};

export const run = command => {
    exec(command, { cwd: __dirname + '/..' });
};

export const writeToPackageDotJson = (pkg, key, value) => {
    let dotJson = new DotJson(`./packages/${pkg}/package.json`);

    dotJson.set(key, value).save();
};

export const getFromPackageDotJson = (pkg, key) => {
    let dotJson = new DotJson(`./packages/${pkg}/package.json`);

    return dotJson.get(key);
};

export const ask = async (message, callback) => {
    let line = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    line.question(message, answer => {
        if (['y', 'Y', 'yes', 'Yes', 'YES'].includes(answer)) callback();

        line.close();
    });
};