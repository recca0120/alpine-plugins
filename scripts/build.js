import { writeToPackageDotJson } from './utils.js';
import fs from 'fs';
import brotliSize from 'brotli-size';
import * as esbuild from 'esbuild';

([
    // Packages:
    'errors',
    'modal',
    'pagination',
]).forEach(pkg => {
    if (!fs.existsSync(`./packages/${pkg}/dist`)) {
        fs.mkdirSync(`./packages/${pkg}/dist`, 0o744);
    }

    // Go through each file in the package's "build" directory
    // and use the appropriate bundling strategy based on its name.
    fs.readdirSync(`./packages/${pkg}/builds`).forEach(file => {
        bundleFile(pkg, file);
    });
});

function bundleFile(pkg, file) {
    // Based on the filename, give esbuild a specific configuration to build.
    ({
        // This output file is meant to be loaded in a browser's <script> tag.
        'cdn.js': () => {
            build({
                entryPoints: [`packages/${pkg}/builds/${file}`],
                outfile: `packages/${pkg}/dist/${file}`,
                bundle: true,
                platform: 'browser',
                define: { CDN: 'true' },
            });

            // Build a minified version.
            build({
                entryPoints: [`packages/${pkg}/builds/${file}`],
                outfile: `packages/${pkg}/dist/${file.replace('.js', '.min.js')}`,
                bundle: true,
                minify: true,
                platform: 'browser',
                define: { CDN: 'true' },
            }).then(() => {
                outputSize(pkg, `packages/${pkg}/dist/${file.replace('.js', '.min.js')}`);
            });

        },
        // This file outputs two files: an esm module and a cjs module.
        // The ESM one is meant for "import" statements (bundlers and new browsers)
        // and the cjs one is meant for "require" statements (node).
        'module.js': () => {
            build({
                entryPoints: [`packages/${pkg}/builds/${file}`],
                outfile: `packages/${pkg}/dist/${file.replace('.js', '.esm.js')}`,
                bundle: true,
                platform: 'neutral',
                mainFields: ['module', 'main'],
            });

            build({
                entryPoints: [`packages/${pkg}/builds/${file}`],
                outfile: `packages/${pkg}/dist/${file.replace('.js', '.cjs.js')}`,
                bundle: true,
                target: ['node10.4'],
                platform: 'node',
            }).then(() => {
                writeToPackageDotJson(pkg, 'main', `dist/${file.replace('.js', '.cjs.js')}`);
                writeToPackageDotJson(pkg, 'module', `dist/${file.replace('.js', '.esm.js')}`);
            });
        },
    })[file]();
}

async function build(options) {
    options.define || (options.define = {});

    const watch = process.argv.includes('--watch');

    // options.define['ALPINE_VERSION'] = `'${getFromPackageDotJson('alpinejs', 'version')}'`;
    options.define['process.env.NODE_ENV'] = watch ? `'production'` : `'development'`;

    const context = await esbuild.context({
        logLevel: watch ? 'info' : 'warning',
        // external: ['alpinejs'],
        ...options,
    });

    if (watch) {
        await context.watch();
    } else {
        await context.rebuild();
        await context.dispose();
    }
}

function outputSize(pkg, file) {
    let size = bytesToSize(brotliSize.sync(fs.readFileSync(file)));

    console.log('\x1b[32m', `${pkg}: ${size}`);
}

function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) return `${bytes} ${sizes[i]}`;
    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}