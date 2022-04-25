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

// from 26-Aug-21 to 2021-09-21

function increaseNextMM (date){ //increments the year with one
  //the date type must be like this yyyy-mm-dd
  let year = `${date[2]}${date[3]}`;
  year = +year + 1;
  let year2 = year.toString();
  let nextYear = date[0] + date[1] + year2;
  let finalNextDate = date[8] + date[9] + "-" + date[5] + date[6] + "-" + nextYear;
  return finalNextDate;
}

const nameSelector = document.getElementById("dynamic_select3");
const email = document.getElementById("email2");
const restrictions = document.getElementById("restrictions");
const firstName = document.getElementById("firstName");
const familyName = document.getElementById("familyName");
const gid = document.getElementById("gid");
const supervisorEmail = document.getElementById("supervisorEmail");
const supervisor2 = document.getElementById("supervisor2");
const lastMM = document.getElementById("lastMM");
const nextMM = document.getElementById("nextMM");


email.value = nameSelector.selectedOptions[0].getAttribute("email");
restrictions.value = nameSelector.selectedOptions[0].getAttribute("restrictions");
firstName.value = nameSelector.selectedOptions[0].getAttribute("firstName");
familyName.value = nameSelector.selectedOptions[0].getAttribute("familyName");
gid.value = nameSelector.selectedOptions[0].getAttribute("gid");
supervisorEmail.value = nameSelector.selectedOptions[0].getAttribute("supervisorEmail");
supervisor2.value = nameSelector.selectedOptions[0].getAttribute("supervisor2");
lastMM.value = dateConversion(nameSelector.selectedOptions[0].getAttribute("lastMM"));
nextMM.value = increaseNextMM(dateConversion(nameSelector.selectedOptions[0].getAttribute("lastMM"))); //aici luam lastMM si ii incrementam anul cu 1
nextMM.innerHTML = increaseNextMM(dateConversion(nameSelector.selectedOptions[0].getAttribute("lastMM")));


nameSelector.onchange = (e) => {
  email.value = e.target.selectedOptions[0].getAttribute("email");
  restrictions.value = e.target.selectedOptions[0].getAttribute("restrictions");
  firstName.value = e.target.selectedOptions[0].getAttribute("firstName");
  gid.value = e.target.selectedOptions[0].getAttribute("gid");
  familyName.value = e.target.selectedOptions[0].getAttribute("familyName");
  supervisorEmail.value = e.target.selectedOptions[0].getAttribute("supervisorEmail");
  supervisor2.value = e.target.selectedOptions[0].getAttribute("supervisor2");
  lastMM.value = dateConversion(e.target.selectedOptions[0].getAttribute("lastMM"));
  // nextMM.value = dateConversion(e.target.selectedOptions[0].getAttribute("nextMM"));
  nextMM.innerHTML = increaseNextMM(dateConversion(e.target.selectedOptions[0].getAttribute("lastMM")));
  // console.log(dateConversion(nextMM.value));
  // console.log(dateConversion(lastMM.value));

  // console.log(supervisor2.value);
  // supervisor2.selectedIndex = 1;
  // supervisor2.value = "Ghi Cat";

  // console.log(supervisor2.value);

  // supervisor2.selectedOptions[0] = e.target.selectedOptions[0].getAttribute("supervisor2");
  // supervisor2.options[1].selected = true;
  // console.log(supervisor2.options.length);
  // console.log(supervisor2.options[2].innerHTML);
  // $("#supervisor2").val(1);
}

lastMM.onchange = (e) => { //cand se schimba data din last mm check se incrementeaza si cea de la next mm check
  nextMM.innerHTML = increaseNextMM(lastMM.value);
}