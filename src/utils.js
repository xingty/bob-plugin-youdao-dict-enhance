
const SEPARATORS_EN = new Set([
  ',','.','!','?',' '
])

const SEPARATORS_ZH = new Set([
  '\uff0c','。','\uff01','\uff1f'
])

/**
 * 统计单词数量是否到达n
 * @param {*} text 输出文本
 * @param {*} n 单词数量,输入文本的单词到达n后结束遍历
 * @returns -1小于n 0等于n 1大于n
 */
function countWords(text,n) {
  let total = 0;
  let wordStart = false;
  let hasConnector = false;
  for (let i=0;i<text.length;i++) {
    let c = text.charAt(i);
    let chatCode = text.charCodeAt(i);

    if (c === '-') {
      hasConnector = true;
      continue;
    }
    
    if (SEPARATORS_EN.has(c) || chatCode > 127) {
      //处理"connec- tor"这种情况
      if (hasConnector) { continue; }

      //处理"connec -tor"这种情况
      if (c === ' ' && i < text.length-2) {
        if (text.charAt(i+1) === '-') {
          continue;
        }
      }

      if (wordStart) {
        total += 1;
      }

      if (chatCode > 127 && !SEPARATORS_ZH.has(c)) {
        total += 1
      }

      wordStart = false;
      if (total > n) {
        return 1;
      }
    } else {
      wordStart = true;
      hasConnector = false;
    }
  }

  if (wordStart) {
    total += 1;
  }

  if (total < n) {
    return -1;
  } else if (total == n) {
    return 0;
  } else {
    return 1;
  }
}

exports.countWords = countWords;