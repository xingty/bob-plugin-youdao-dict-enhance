
var HEADER = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
}

function query(body,url,method='POST',header=HEADER) {
  return new Promise((resolve,reject) => {
    $http.request({
      method,
      url,
      header,
      body,
      handler: function(resp) {
        if (resp.error) {
          reject({
            type: resp.error.statusCode === 500 ? 'api' : 'network',
            message: resp.error.localizedDescription,
            addtion: resp.error.localizedDescription,
            cause: resp.error
          });
        } else if (!resp.data) {
          reject({
            type: 'api',
            message: 'API返回数据内容为空',
            cause: resp
          })
        } else {
          resolve(resp);
        }
      }
    });
  });
}

exports.query = query;