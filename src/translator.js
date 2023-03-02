var CryptoJS = require("crypto-js");

var BASE_URL = 'https://dict.youdao.com/jsonapi_s?doctype=json&jsonversion=4';

function doTranslate(query,completion) {
  let translate_text = query.text || ''
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

  // 查字典,不查句子
  const body = Object.assign({}, {
    "q": translate_text,
    "keyfrom": "webdict",
    "sign": f,
    "client": "web",
    "t": time
  });
  $http.request({
    method: "POST",
    url: BASE_URL,
    header: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    },
    body: body,
    handler: function (resp) {
      if (resp.error) {
        completion({
          error: {
            type: resp.error.code || 'unknown',
            message: resp.error.localizedDescription || '未知错误',
            addtion: resp.error.localizedDescription,
          }
        });
      }
      const toDict = {
          word: translate_text,
          phonetics: [],
          parts: [],
          exchanges: [],
          additions: []
      }
      if (resp.data.ec && resp.data.ec.word && resp.data.ec.word.trs && resp.data.ec.word.trs.length) {
          const word = resp.data.ec.word
          if (word.usphone) {
            toDict.phonetics.push({
              "type": "us",
              "value": word.usphone,
              "tts": {
                  "type": "url",
                  "value": "https://dict.youdao.com/dictvoice?audio=" + word.usspeech
              }
            })
          }
          if (word.ukphone) {
            toDict.phonetics.push({
              "type": "uk",
              "value": word.ukphone,
              "tts": {
                  "type": "url",
                  "value": "https://dict.youdao.com/dictvoice?audio=" + word.ukspeech
              }
            })
          }
          word.trs.forEach(function (e) {
            toDict.parts.push({part: e.pos, means: [e.tran]})
          })
          if (word.wfs && word.wfs.length) {
            word.wfs.forEach(function (e) {
                toDict.exchanges.push({name: e.wf.name, words: [e.wf.value]})
            })
          }
          if (word.prototype) {
            toDict.exchanges.push({name: '原形', words: [word.prototype]})
          }
          toDict.additions.push({
            name: '标签',
            value: (resp.data.ec.exam_type ? resp.data.ec.exam_type.join('/') : '')
          })
          let toParagraphs = ['无'];
          if (resp.data.ec.web_trans) {
            toParagraphs = resp.data.ec.web_trans.join('、');
          }
          completion({
            result: {
              from: query.detectFrom,
              to: query.detectTo,
              fromParagraphs: translate_text.split('\n'),
              toParagraphs: toParagraphs,
              toDict: toDict,
            },
          });
      } else if (resp.data.typos && resp.data.typos.typo && resp.data.typos.typo.length) {
          // 优化未查询到单词时的模糊匹配
          resp.data.typos.typo.forEach(function (e) {
            toDict.exchanges.push({name: '您要找的是不是:' + e.trans, words: [e.word]})
          })
          // toDict.phonetics.push({
          //     "type": "us",
          //     "value": "未找到"
          // })
          toDict.parts.push({part: '抱歉,', means: ['未找到“' + translate_text + '”相关的词']})
          completion({
            result: {
              from: query.detectFrom,
              to: query.detectTo,
              fromParagraphs: translate_text.split('\n'),
              toParagraphs: ('抱歉没有找到“' + translate_text + '”相关的词').split('\n'),
              toDict: toDict,
            },
          });
      } else {
        if (resp.data.fanyi) {
          completion({
            result: {
              fromParagraphs: [resp.data.fanyi.input],
              toParagraphs: [ resp.data.fanyi.tran ]
            }
          })
          return;
        }
        $log.error('*********** 词典查询err ==> ' + JSON.stringify(resp.data))
        completion({
            error: {
                type: 'unknown',
                message: JSON.stringify(resp.data) || '未知错误',
                addtion: '未知错误',
            },
        });
      }
    }
  });
}

exports.doTranslate = doTranslate;