'use strict';

// Thanks to broofa & co.
// https://github.com/broofa/node-mime/blob/master/types/mime.types
var map = {
  'bmp': 'image/bmp',
  'cgm': 'image/cgm',
  'g3': 'image/g3fax',
  'gif': 'image/gif',
  'ief': 'image/ief',
  'jpe': 'image/jpeg',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'ktx': 'image/ktx',
  'png': 'image/png',
  'btif': 'image/prs.btif',
  'sgi': 'image/sgi',
  'svg': 'image/svg+xml',
  'svgz': 'image/svg+xml',
  'tiff': 'image/tiff',
  'tif': 'image/tiff',
  'psd': 'image/vnd.adobe.photoshop',
  'uvi': 'image/vnd.dece.graphic',
  'uvvi': 'image/vnd.dece.graphic',
  'uvg': 'image/vnd.dece.graphic',
  'uvvg': 'image/vnd.dece.graphic',
  'sub': 'image/vnd.dvb.subtitle',
  'djv': 'image/vnd.djvu',
  'djvu': 'image/vnd.djvu',
  'dwg': 'image/vnd.dwg',
  'dxf': 'image/vnd.dxf',
  'fbs': 'image/vnd.fastbidsheet',
  'fpx': 'image/vnd.fpx',
  'fst': 'image/vnd.fst',
  'mmr': 'image/vnd.fujixerox.edmics-mmr',
  'rlc': 'image/vnd.fujixerox.edmics-rlc',
  'mdi': 'image/vnd.ms-modi',
  'wdp': 'image/vnd.ms-photo',
  'npx': 'image/vnd.net-fpx',
  'wbmp': 'image/vnd.wap.wbmp',
  'xif': 'image/vnd.xiff',
  'webp': 'image/webp',
  '3ds': 'image/x-3ds',
  'ras': 'image/x-cmu-raster',
  'cmx': 'image/x-cmx',
  'fh': 'image/x-freehand',
  'fhc': 'image/x-freehand',
  'fh4': 'image/x-freehand',
  'fh5': 'image/x-freehand',
  'fh7': 'image/x-freehand',
  'ico': 'image/x-icon',
  'sid': 'image/x-mrsid-image',
  'pcx': 'image/x-pcx',
  'pic': 'image/x-pict',
  'pct': 'image/x-pict',
  'pnm': 'image/x-portable-anymap',
  'pbm': 'image/x-portable-bitmap',
  'pgm': 'image/x-portable-graymap',
  'ppm': 'image/x-portable-pixmap',
  'rgb': 'image/x-rgb',
  'tga': 'image/x-tga',
  'xbm': 'image/x-xbitmap',
  'xpm': 'image/x-xpixmap',
  'xwd': 'image/x-xwindowdump'
};

module.exports = function(path) {
  var ext = path.replace(/^.*\./, '').toLowerCase();
  if(map.hasOwnProperty(ext)) {
    return map[ext];
  } else {
    // Reasonable default for images?
    return 'image/png';
  }
};