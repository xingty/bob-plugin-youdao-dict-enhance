var webTranslate = require('./web-translator');
var apiTranslate = require('./open-translator');

var translators = [webTranslate,apiTranslate];

function translate(text,from='auto',to='auto') {
  const apiType = $option.api;
  for (const translator of translators) {
    $log.info(JSON.stringify(translator));
    if (translator.type === apiType) {
      return translator.doTranslate(text,from,to,$option.appid,$option.secret);
    }
  }

  return Promise.reject({
    type: 'unsupportLanguage',
    message: `Couldn't find any translators for "${apiType}"`
  });
}

exports.translate = translate;