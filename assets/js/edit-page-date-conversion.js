function dateConversion (date){
  let day = date[0]+date[1];
  let year = "20"+date[7]+date[8];
  let month = date[3]+date[4]+date[5];
  if (month == "Jan" || month == "jan") {
    month = '01';
  }
  if (month == "Feb" || month == "feb") {
    month = '02';
  }
  if (month == "Mar" || month == "mar") {
    month = '03';
  }
  if (month == "Apr" || month == "apr") {
    month = '04';
  }
  if (month == "May" || month == "may") {
    month = '05';
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
  let finalDate = year + "-" + month + "-" + day;
  return finalDate;
}

// din 26-Aug-21 in 2021-09-21