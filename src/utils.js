
/**
 * 统计单词数量是否到达n
 * @param {*} text 输出文本
 * @param {*} n 单词数量,输入文本的单词到达n后结束遍历
 * @returns true if the text's words > n, otherwise false
 */
function countWords(text,n) {
  let total = 0;
  let wordStart = false;
  for (let i=0;i<text.length;i++) {
    if (text.charAt(i) === ' ') {
      if (wordStart) {
        total += 1;
      }

      wordStart = false;
      if (total > n) {
        return true;
      }
    } else {
      wordStart = true;
    }
  }

  if (wordStart) {
    total += 1;
  }

  return total > n;
}

exports.countWords = countWords;