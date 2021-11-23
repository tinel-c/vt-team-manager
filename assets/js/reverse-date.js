function reverseDateToDate( date ){
  let year = date[2]+date[3];
  let month = date[5]+date[6];
  let day = date[8]+date[9];
  if (month == "01") {
    month = "Jan";
  }
  if (month == "02") {
    month = "Feb";
  }
  if (month == "03") {
    month = "Mar";
  }
  if (month == "04") {
    month = "Apr";
  }
  if (month == "05") {
    month = "May";
  }
  if (month == "06") {
    month = 'Jun';
  }
  if (month == "07") {
    month = 'Jul';
  }
  if (month == "08") {
    month = 'Aug';
  }
  if (month == "09") {
    month = 'Sep';
  }
  if (month == "10") {
    month = 'Oct';
  }
  if (month == "11") {
    month = 'Nov';
  }
  if (month == "12") {
    month = 'Dec';
  }
  // let anFinal = "20" + year + "-" + month + "-" + day;
  let anFinal = day + "-" + month + "-" + year;
  return anFinal;

}

// 26-Jan-11

module.exports = reverseDateToDate;