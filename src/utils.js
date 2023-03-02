/**
 * 统计单词数量是否到达n
 * @param {*} text 输出文本
 * @param {*} n 单词数量,输入文本的单词到达n后结束遍历
 * @returns -1小于n 0等于n 1大于n
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
        return 1;
      }
    } else {
      wordStart = true;
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