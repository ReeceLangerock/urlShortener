var alphabet = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
var base = alphabet.length;

function decodeURL(str){
  var decodedURL = 0;
  while(str){
    var index = alphabet.indexOf(str[0]);
    var power = str.length-1;
    decodedURL += index * (Math.pow(base, power));
    str = str.substring(1);
  }
  return decodedURL;
}

function encodeURL(num){
  var encoded = '';
  while (num){
    var remainder = num % base;
    num = Math.floor(num / base);
    encoded = alphabet[remainder].toString() + encoded;
  }
  return encoded;
}

module.exports.encodeURL = encodeURL;
module.exports.decodeURL = decodeURL;
