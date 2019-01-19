/**
 * MaterialDesignIcons
 */

const request = require('request');
const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl');

const repo = {
    default: 'MaterialDesign',
    light: 'MaterialDesignLight',
};

/**
 * Hits the specified URL, and returns the JSON-decoded response.
 */
const getJson = (url) => {
    return new Promise((resolve, reject) => {
        request({url, json: true}, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode !== 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }

            resolve(body);
        });
    });
};

/**
 * Returns that latest known version for the specified flavour.
 */
const getLatestVersion = async (flavour = 'default') => {
    const packageJsonUrl = `https://raw.githubusercontent.com/Templarian/${repo[flavour]}-SVG/master/package.json`;

    const body = await getJson(packageJsonUrl);
    return body.version;
};

/**
 * Downloads the meta.json file for the specified version and flavour.
 */
const getMeta = async (version, flavour = 'default') => {
    const url = `http://cdn.materialdesignicons.com/${flavour === 'light' ? 'light/' : ''}${version}/meta.json`;
    return await getJson(url);
};

/**
 * Downloads the SVG ZIP file for the specified flavour in the specified path.
 */
const downloadSvgZip = async(destPath, flavour = 'default') => {
    const url = `https://github.com/Templarian/${repo[flavour]}-SVG/archive/master.zip`;

    return new Promise((resolve, reject) => {
        request(url)
            .on('response', (res) => {
                res.pipe(fs.createWriteStream(destPath));
            })
            .on('end', () => {
                resolve();
            })
    });
};

const downloadWebfontZip = async(destPath, flavour = 'default') => {
    const url = `https://github.com/Templarian/${repo[flavour]}-Webfont/archive/master.zip`;

    return new Promise((resolve, reject) => {
        request(url)
            .on('response', (res) => {
                res.pipe(fs.createWriteStream(destPath));
            })
            .on('end', () => {
                resolve();
            })
    });
};

const extractZip = async(zipPath, destDir, filePattern) => {
    // Extract ZIP
    return new Promise((resolve, reject) => {
        yauzl.open(zipPath, (err, zipfile) => {
            if (err) throw err;

            zipfile
                .on('entry', (entry) => {
                    if (filePattern.test(entry.fileName)) {
                        zipfile.openReadStream(entry, function(err, readStream) {
                            if (err) throw err;

                            readStream.pipe(fs.createWriteStream(`${destDir}/${path.basename(entry.fileName)}`));
                        });
                    }
                })
                .on('close', () => {
                    resolve();
                });
        });
    });
};

module.exports = {
    getLatestVersion,
    getMeta,
    downloadSvgZip,
    downloadWebfontZip,
    extractZip,
};
