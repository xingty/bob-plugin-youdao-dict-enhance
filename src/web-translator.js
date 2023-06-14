var CryptoJS = require("crypto-js");
var request = require('./api-request');

var BASE_URL = 'https://dict.youdao.com/jsonapi_s?doctype=json&jsonversion=4';

function doTranslate(text,from, to,appId,secret,showSentence,maxPhrs,showLabel,showRelWords) {
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

  return doQuery(body,showSentence,maxPhrs,showLabel,showRelWords);
}

async function doQuery(body,showSentence,maxPhrs,showLabel,showRelWords) {
  try {
    let resp = await request.query(body,BASE_URL);
    return Promise.resolve(parseResponse(resp.data,body.q,showSentence,maxPhrs,showLabel,showRelWords));
  } catch(err) {
    return Promise.reject(err);
  }
}

function parseResponse(data,text,showSentence,maxPhrs,showLabel,showRelWords) {
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
      exchanges.push({name: '原形', words: [word.prototype]})
    }

    if (showLabel && data.ec.exam_type) {
      additions.push({
        name: '标签',
        value: (data.ec.exam_type ? data.ec.exam_type.join('/') : '')
      })
    }

    //添加例句
    if (showSentence > 0 && data.collins) {
      let entries = data.collins.collins_entries || [];
      let sentences = entries.filter(entry => 'entries' in entry).reduce((acc,cur) => {
        acc = acc.concat(cur.entries.entry);
        return acc;
      },[]);

      let map = sentences.filter(s => {
        if (!s.tran_entry) { return false; } 

        let trans = s.tran_entry[0];
        if (!trans.pos_entry || !trans.exam_sents) { return false; }

        return true;
      }).reduce((acc,sentence) => {
        let trans = sentence.tran_entry[0];
        let pos_entry = trans.pos_entry;
        let tips = pos_entry.pos_tips || '';
        let key = `${tips}(${pos_entry.pos.toLowerCase()}): `;
        if (!acc.get(key)) {
          acc.set(key,[]);
        }
        
        trans.exam_sents.sent.forEach(example => {
          let value = `${example.eng_sent} (${example.chn_sent})\n`;
          acc.get(key).push(value);
        });

        return acc;
      },new Map());

      if (map.size > 0) {
        additions.push({ name: '例句',value: '⬇️' });
        map.forEach((val,name) => {
          let value = val.join('\n');
          additions.push({ name,value });
        })
      }
    }

    //添加词组
    if (maxPhrs > 0 && data.phrs && data.phrs.phrs) {
      let phrs = data.phrs.phrs;
      let webtrs = '';
      let len = Math.min(maxPhrs,phrs.length);
      for (let i=1;i<=len;i++) {
        let item = phrs[i-1];
        webtrs += `[${i}] ${(item.headword+'').toLowerCase()}: ${item.translation}  \n`
      }

      additions.push({
        name: "词组",
        value: webtrs
      });
    }
    
    if (showRelWords && data.rel_word && data.rel_word.rels) {
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
      toParagraphs.push(data.ec.web_trans.join('、'));
    }
  } else if (data.fanyi) {
    toParagraphs.push(data.fanyi.tran);
  } else if (hasTypos()) {
    // 优化未查询到单词时的模糊匹配
    parts.push({part: '', means: ['抱歉,未找到“' + text + '”相关的词, 您要找的是不是: ']})

    data.typos.typo.forEach( e => {
      exchanges.push({name: e.trans, words: [e.word]})
    });
  } else if (data.ce && data.ce.word) {
    let phases = '';
    let words = data.ce.word.trs.map(w => {
      phases += w['#text'] + '、 ';
      return {
        word: w['#text'],
        means: [w['#tran']]
      }
    });

    toParagraphs.push(phases);
    relatedWordParts.push({ part: 'dict', words });
  }

  if (toParagraphs.length === 0) {
    toParagraphs.push('无');
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

module.exports = {
  type: 'web-api',
  doTranslate: doTranslate
}