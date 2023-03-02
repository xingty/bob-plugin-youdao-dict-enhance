var config = require('./config.js');
var countWords = require('./utils').countWords
var doTranslate = require('./translator').doTranslate

function supportLanguages() {
	return config.supportedLanguages.map(([standardLang]) => standardLang);
}

var langMap = new Map(config.supportedLanguages);
// var langMapReverse = new Map(config.supportedLanguages.map(([standardLang, lang]) => [lang, standardLang]));

function translate(query, completion) {
	const targetLanguage = langMap.get(query.detectTo);
	if (!targetLanguage) {
		const err = new Error();
		Object.assign(err, {
				_type: 'unsupportLanguage',
				_message: '不支持该语种',
		});
		throw err;
	}	

	const type = $option.type;
	const text = query.text;
	if (type !== 'all') {
		if (countWords(text,parseInt(type)) >= 1) {
			completion({
				result: {
					toParagraphs: ['单词超过设置的数量'],
				}
			});
			return;
		}
	}

	doTranslate(query,completion);
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;