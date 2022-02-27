function capitalizeTheFirstLetterOfEachWord(words) {
  //
  var separateWord = words.toLowerCase().split("-");
  // var separateWord = words.toLowerCase().split("-").join(" ").split(" ") ;
  for (var i = 0; i < separateWord.length; i++) {
    separateWord[i] = separateWord[i].charAt(0).toUpperCase() + separateWord[i].substring(1);
  }
  let word = separateWord.join("-");
  // console.log(word);
  let separateWord2 = word.split(" ");
  for (var i = 0; i < separateWord2.length; i++) {
    separateWord2[i] = separateWord2[i].charAt(0).toUpperCase() + separateWord2[i].substring(1);
  }
  let word2 = separateWord2.join(" ");
  let separateWord3 = word2.split(" ");
  for (var i = 0; i < separateWord3.length; i++) {
    separateWord3[i] = separateWord3[i].charAt(0).toUpperCase() + separateWord3[i].substring(1);
  }
  let word3 = separateWord3.join(" ");
  return word3;
}

module.exports = capitalizeTheFirstLetterOfEachWord;