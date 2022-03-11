function longYearDate (date){ // date at the initial moment is 28-Feb-23
  if(date == "-"){
    return "-";
  } else {
    let finalDate = "";
    for (let i = 0 ; i < 7 ; i++){
      finalDate = finalDate + date[i]; //finalDate becomes 28-Feb-
    }
    finalDate = finalDate + "20" + date[7] + date[8];
    return finalDate;
  }
}

module.exports = longYearDate;