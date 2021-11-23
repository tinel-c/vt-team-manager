function reverseMMDateToDate( date ){
  let year = date[13]+date[14];
  let month = date[4]+date[5]+date[6];
  let day = date[8]+date[9];
  let anFinal = day + "-" + month + "-20" + year;
  return anFinal;
}

// 26-Jan-11

module.exports = reverseMMDateToDate;