var config = require('./config.js');
var countWords = require('./utils').countWords;
var translator = require('./translator');

function supportLanguages() {
	return config.supportedLanguages.map(([standardLang]) => standardLang);
}

var langMap = new Map(config.supportedLanguages);
// var langMapReverse = new Map(config.supportedLanguages.map(([standardLang, lang]) => [lang, standardLang]));

async function translate(query, completion) {
	const supportedLanguages = langMap.get(query.detectTo);
	const from = query.detectFrom;
	if (!supportedLanguages) {
		completion({
			error: {
				type: 'unsupportLanguage',
				message: '不支持该语种'
			}
		});
	}	

	const wordNumbers = parseInt($option.type);
	const text = query.text;
	if (wordNumbers > 0 && countWords(text,wordNumbers) >= 1) {
		completion({
			error: {
				type: 'unsupportLanguage',
				message: '翻译的单词超过设置的数量上限'
			}
		});
		return;
	}

	try {
		let result = await translator.translate(text,query.detectFrom,query.detectTo);
		completion({ result });
	} catch(err) {
		let type = err.type || 'unknown';
		let message = err.message || '未知错误';
		completion({
			error: {
				type,
				message
			}
		});
	}
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;