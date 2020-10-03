'use strict'
const fs = require('fs')
const path = require('path')

/*      outcome/
 * Create the folders in the path by creating each path in turn
 */
function ensureExists(path_, cb) {
    try {
        path_ = path.normalize(path_)
    } catch(err) {
        return cb(err)
    }
    let p = path_.split(path.sep)
    if(p[0] == '.') p.shift() // Don't create current directory
    else if(p[0] == '') { // Absolute path
        p.shift()
        p[0] = path.sep + p[0]
    }
    ensure_exists_1(p, 1)

    function ensure_exists_1(p, upto) {
        if(p.length < upto) cb(null, path_)
        else {
            let curr = path.join.apply(path, p.slice(0,upto))
            fs.mkdir(curr, '0777', (err) => {
                if (err && err.code != 'EEXIST' && err.code != 'EPERM') cb(err)
                else ensure_exists_1(p, upto+1)
            })
        }
    }
}

function sanitizeFilename(n) {
    let illegalRe = /[\/\?<>\\:\*\|"]/g;
    let controlRe = /[\x00-\x1f\x80-\x9f]/g;
    let reservedRe = /^\.+$/;
    let windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    let windowsTrailingRe = /[\. ]+$/

    return n
            .replace(illegalRe, '')
            .replace(controlRe, '')
            .replace(reservedRe, '')
            .replace(windowsReservedRe, '')
            .replace(windowsTrailingRe, '')
}

module.exports = {
    ensureExists,
    sanitizeFilename,
}
