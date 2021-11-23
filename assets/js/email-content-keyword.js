function keywordConvertor(text, keyword){

  let MMtextMessage = "";
  MMtextMessage = text;
  function countOccurences(string, word) {
    return string.split(word).length - 1;
  }
  let countFN = countOccurences(MMtextMessage,"${nextAppDate}"); // 1
  for(let i = 0; i < countFN; i++){
    MMtextMessage = MMtextMessage.replace("${nextAppDate}", keyword);
  }
  return MMtextMessage;

}

module.exports = keywordConvertor;