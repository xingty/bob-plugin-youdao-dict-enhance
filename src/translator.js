var webTranslate = require('./web-translator');
var apiTranslate = require('./open-translator');

var translators = [
  webTranslate,
  apiTranslate
];

function translate(text,from='auto',to='auto') {
  const showSentence = $option.showSentence === '1';
  const maxPhrs = $option.maxPhrs;
  const apiType = $option.api;
  for (const translator of translators) {
    if (translator.type === apiType) {
      return translator.doTranslate(
        text,from,to,$option.appid,$option.secret,
        showSentence,maxPhrs
      );
    }
  }

  return Promise.reject({
    type: 'unsupportLanguage',
    message: `Couldn't find any translators for "${apiType}"`
  });
}

exports.translate = translate;