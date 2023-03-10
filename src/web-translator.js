var CryptoJS = require("crypto-js");
var request = require('./api-request');

var BASE_URL = 'https://dict.youdao.com/jsonapi_s?doctype=json&jsonversion=4';

function doTranslate(text,from, to) {
  let translate_text = text || ''
  let y = ["option_avatar", "nickname"]
      , w = "Mk6hqtUp33DGGtoS63tTJbMUYjRrG1Lu"
      , v = "webdict"
      , _ = "web"
  const h = function (t) {
      return CryptoJS.MD5(t.toString()).toString(CryptoJS.enc.Hex);
  }
  let time = "".concat(translate_text).concat(v).length % 10,
    r = "".concat(translate_text).concat(v),
    o = h(r),
    n = "".concat(_).concat(translate_text).concat(time + '').concat(w).concat(o),
    f = h(n)
  const body = Object.assign({}, {
    "q": translate_text,
    "keyfrom": "webdict",
    "sign": f,
    "client": "web",
    "t": time
  });

  return doQuery(body);
}

async function doQuery(body) {
  try {
    let resp = await request.query(body,BASE_URL);
    return Promise.resolve(parseResponse(resp.data,body.q));
  } catch(err) {
    return Promise.reject(err);
  }
}

function parseResponse(data,text) {
	let additions = [];
	let phonetics = [];
	let exchanges = [];
	let parts = [];
	let toParagraphs = [];
	let fromParagraphs = [ text ];
  let relatedWordParts = [];

  function hasWord() {
    return data.ec && data.ec.word && 
      data.ec.word.trs && data.ec.word.trs.length;
  }

  function hasTypos() {
    return data.typos && data.typos.typo && data.typos.typo.length
  }

  if (hasWord()) {
    const word = data.ec.word
    if (word.usphone) {
      phonetics.push({
        "type": "us",
        "value": word.usphone,
        "tts": {
            "type": "url",
            "value": "https://dict.youdao.com/dictvoice?audio=" + word.usspeech
        }
      })
    }

    if (word.ukphone) {
      phonetics.push({
        "type": "uk",
        "value": word.ukphone,
        "tts": {
            "type": "url",
            "value": "https://dict.youdao.com/dictvoice?audio=" + word.ukspeech
        }
      })
    }

    word.trs.forEach(function (e) {
      parts.push({part: e.pos, means: [e.tran]})
    })

    if (word.wfs && word.wfs.length) {
      word.wfs.forEach(function (e) {
          exchanges.push({name: e.wf.name, words: [e.wf.value]})
      })
    }

    if (word.prototype) {
      exchanges.push({name: '??????', words: [word.prototype]})
    }

    if (data.ec.exam_type) {
      additions.push({
        name: '??????',
        value: (data.ec.exam_type ? data.ec.exam_type.join('/') : '')
      })
    }

    if (data.phrs && data.phrs.phrs) {
      let phrs = data.phrs.phrs;
      let webtrs = '';
      // let len = Math.min(10,phrs.length);
      let len = phrs.length;
      for (let i=1;i<=len;i++) {
        let item = phrs[i-1];
        webtrs += `${i}) ${(item.headword+'').toLowerCase()}: ${item.translation}  `
      }

      additions.push({
        name: "??????",
        value: webtrs
      });
    }

    if (data.rel_word && data.rel_word.rels) {
      data.rel_word.rels.forEach(item => {
        let part = item.rel.pos;
        let words = item.rel.words.map(w => {
          return {
            word: w.word,
            means: [w.tran]
          }
        })
        relatedWordParts.push({ part, words })
      });
    }

    if (data.ec.web_trans) {
      toParagraphs.push(data.ec.web_trans.join('???'));
    }
  } else if (data.fanyi) {
    toParagraphs.push(data.fanyi.tran);
  } else if (hasTypos()) {
    // ??????????????????????????????????????????
    parts.push({part: '', means: ['??????,????????????' + text + '???????????????, ?????????????????????: ']})

    data.typos.typo.forEach( e => {
      exchanges.push({name: e.trans, words: [e.word]})
    });
  }

  if (toParagraphs.length === 0) {
    toParagraphs.push('???');
  }

  return {
    toDict: {
      word: text,
      phonetics,
      parts,
      exchanges,
      additions,
      relatedWordParts
    },
    fromParagraphs,
    toParagraphs
  }
}

exports.doTranslate = doTranslate;