function dateToDate( date ){
  let day = date[0]+date[1];
  let month = date[3]+date[4]+date[5];
  let year = date[7]+date[8];
  if (month == "Jan" || month == "jan") {
    month = "01";
  }
  if (month == "Feb" || month == "feb") {
    month = "02";
  }
  if (month == "Mar" || month == "mar") {
    month = "03";
  }
  if (month == "Apr" || month == "apr") {
    month = "04";
  }
  if (month == "May" || month == "may") {
    month = "05";
  }
  if (month == "Jun" || month == "jun") {
    month = '06';
  }
  if (month == "Jul" || month == "jul") {
    month = '07';
  }
  if (month == "Aug" || month == "aug") {
    month = '08';
  }
  if (month == "Sep" || month == "sep") {
    month = '09';
  }
  if (month == "Oct" || month == "oct") {
    month = '10';
  }
  if (month == "Nov" || month == "nov") {
    month = '11';
  }
  if (month == "Dec" || month == "dec") {
    month = '12';
  }
  let anFinal = "20" + year + "-" + month + "-" + day;
  return anFinal;

}

// 26-Jan-11

module.exports = dateToDate;