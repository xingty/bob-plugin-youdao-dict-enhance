var webTranslate = require('./web-translator').doTranslate;
var apiTranslate = require('./open-translator').doTranslate;

function translate(text,from='auto',to='auto') {
  let doTranslate = $option.api === 'web-api' ? webTranslate : apiTranslate;
  return doTranslate(text,from,to,$option.appid,$option.secret);
}

exports.translate = translate;