'use strict';

const path = require('path');
const fs = require('fs');

const clone = require('clone');
const glyphCompose = require('@mapbox/glyph-pbf-composite');


const getFontPbf = (allowedFonts, fontPath, name, range, fallbacks) => new Promise((resolve, reject) => {
  if (!allowedFonts || (allowedFonts[name] && fallbacks)) {
    const filename = path.join(fontPath, name, `${range}.pbf`);
    if (!fallbacks) {
      fallbacks = clone(allowedFonts || {});
    }
    delete fallbacks[name];
    fs.readFile(filename, (err, data) => {
      if (err) {
        console.error(`ERROR: Font not found: ${name}`);
        if (fallbacks && Object.keys(fallbacks).length) {
          let fallbackName;

          let fontStyle = name.split(' ').pop();
          if (['Regular', 'Bold', 'Italic'].indexOf(fontStyle) < 0) {
            fontStyle = 'Regular';
          }
          fallbackName = `Noto Sans ${fontStyle}`;
          if (!fallbacks[fallbackName]) {
            fallbackName = `Open Sans ${fontStyle}`;
            if (!fallbacks[fallbackName]) {
              fallbackName = Object.keys(fallbacks)[0];
            }
          }

          console.error(`ERROR: Trying to use ${fallbackName} as a fallback`);
          delete fallbacks[fallbackName];
          getFontPbf(null, fontPath, fallbackName, range, fallbacks).then(resolve, reject);
        } else {
          reject(`Font load error: ${name}`);
        }
      } else {
        resolve(data);
      }
    });
  } else {
    reject(`Font not allowed: ${name}`);
  }
});

module.exports.fixTileJSONCenter = tileJSON => {
  if (tileJSON.bounds && !tileJSON.center) {
    const fitWidth = 1024;
    const tiles = fitWidth / 256;
    tileJSON.center = [
      (tileJSON.bounds[0] + tileJSON.bounds[2]) / 2,
      (tileJSON.bounds[1] + tileJSON.bounds[3]) / 2,
      Math.round(
        -Math.log((tileJSON.bounds[2] - tileJSON.bounds[0]) / 360 / tiles) /
        Math.LN2
      )
    ];
  }
};

module.exports.getFontsPbf = (allowedFonts, fontPath, names, range, fallbacks) => {
  const fonts = names.split(',');
  const queue = [];
  for (const font of fonts) {
    queue.push(
      getFontPbf(allowedFonts, fontPath, font, range, clone(allowedFonts || fallbacks))
    );
  }

  return Promise.all(queue).then(values => glyphCompose.combine(values));
};
