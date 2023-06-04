var CryptoJS = require("crypto-js");
var request = require('./api-request');

var BASE_URL = 'https://openapi.youdao.com/api';
var SIGN_TYPE = 'v3';

function doTranslate(text,from,to,appID,secret,showSentence,showPhrs) {
  let salt = CryptoJS.lib.WordArray.random(16).toString();
  let curtime = Math.round(new Date().getTime() / 1000);
  let str = appID + truncate(text) + salt + curtime + secret;
  let sign = CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);

  let body = {
    q: text,
    appKey: appID,
    salt: salt,
    from: from,
    to: to,
    sign: sign,
    signType: SIGN_TYPE,
    curtime: curtime
  }

  return doQuery(body,showSentence,showPhrs);
}

async function doQuery(body,showSentence,showPhrs) {
  try {
    let resp = await request.query(body,BASE_URL);
    let data = resp.data;
    if (data.errorCode !== '0') {
      return Promise.reject({
        type: 'api',
        message: JSON.stringify(data)
      });
    }
    //官网描述查询正确query一定存在
    if (!data || !data.query) {
      return Promise.reject({
        type: 'notFound',
        message: '找不到词汇 [ ' + body.q +' ]'
      });
    }
    return Promise.resolve(parseResponse(data,showSentence,showPhrs));
  } catch(err) {
    return Promise.reject(err);
  }
}

function parseResponse(data,showSentence,showPhrs) {
	let basic = data.basic;
	let additions = [];
	let phonetics = [];
	let exchanges = [];
	let parts = [];
	let toParagraphs = [];
	let fromParagraphs = data.returnPhrase || [ data.query ];

	if (basic) {
    phonetics.push({
      type: 'us',
      value: basic['us-phonetic'],
      tts: {
        type: "url",
        value: "https://dict.youdao.com/dictvoice?audio=" + data.query + "&type=2"
      }
    });
  
    phonetics.push({
      type: 'uk',
      value: basic['uk-phonetic'],
      tts: {
        type: "url",
        value: "https://dict.youdao.com/dictvoice?audio=" + data.query + "&type=1"
      }
    });

    if (basic.exam_type) {
      additions.push({ name: '标签', value: basic.exam_type.join('/') });
    }

    if (basic.wfs) {
      basic.wfs.forEach(item => {
        exchanges.push({ name: item.wf.name, words: [ item.wf.value ] });
      });
    }
  
    if (basic.explains) {
      basic.explains.forEach(item => {
        parts.push(explainToPart(item))
      });
    }
  }

	if (showPhrs && data.web) {
    let webtrs = '';
    // let len = Math.min(10,data.web.length);
    let len = data.web.length;
    for (let i=1;i<=len;i++) {
      let item = data.web[i-1];
      webtrs += `${i}) ${(item.key+'').toLowerCase()}: ${item.value.join('、')}  `
    }

    additions.push({
      name: "词组",
      value: webtrs
    });
	} 
  
  if (data.translation) {
		toParagraphs.push(data.translation.join('、'));
	}

  if (toParagraphs.length === 0) {
    toParagraphs.push('无');
  }

  return {
    toDict: {
      word: data.query,
      phonetics,
      parts,
      exchanges,
      additions
    },
    fromParagraphs,
    toParagraphs,
  };
}

function explainToPart(item) {
	let index = item.indexOf('.');

	return {
		part: item.substring(0,index+1),
		means: [ item.substring(index+1).trim() ]
	}
}

function truncate(text) {
  let len = text.length;
  if(len <= 20) {
    return text;
  }
  return text.substring(0, 10) + len + text.substring(len-10, len);
}


module.exports = {
  type: 'open-api',
  doTranslate: doTranslate
}