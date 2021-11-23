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

const nameSelector = document.getElementById("dynamic_select3");
const email = document.getElementById("email2");
const restrictions = document.getElementById("restrictions");
const firstName = document.getElementById("firstName");
const familyName = document.getElementById("familyName");
const supervisorEmail = document.getElementById("supervisorEmail");
const supervisor2 = document.getElementById("supervisor2");
const lastMM = document.getElementById("lastMM");
const nextMM = document.getElementById("nextMM");

// $( document ).ready(function() {
//   $("#supervisor2").val("hatz").change();
// });

email.value = nameSelector.selectedOptions[0].getAttribute("email");
restrictions.value = nameSelector.selectedOptions[0].getAttribute("restrictions");
firstName.value = nameSelector.selectedOptions[0].getAttribute("firstName");
familyName.value = nameSelector.selectedOptions[0].getAttribute("familyName");
supervisorEmail.value = nameSelector.selectedOptions[0].getAttribute("supervisorEmail");
supervisor2.value = nameSelector.selectedOptions[0].getAttribute("supervisor2");
lastMM.value = dateConversion(nameSelector.selectedOptions[0].getAttribute("lastMM"));
nextMM.value = dateConversion(nameSelector.selectedOptions[0].getAttribute("nextMM"));

// supervisor2.value = "Iftimoaia Mirela";
// supervisor2.value = "Ghi Cat";
nameSelector.onchange = (e) => {
  email.value = e.target.selectedOptions[0].getAttribute("email");
  restrictions.value = e.target.selectedOptions[0].getAttribute("restrictions");
  firstName.value = e.target.selectedOptions[0].getAttribute("firstName");
  familyName.value = e.target.selectedOptions[0].getAttribute("familyName");
  supervisorEmail.value = e.target.selectedOptions[0].getAttribute("supervisorEmail");
  supervisor2.value = e.target.selectedOptions[0].getAttribute("supervisor2");
  lastMM.value = dateConversion(e.target.selectedOptions[0].getAttribute("lastMM"));
  nextMM.value = dateConversion(e.target.selectedOptions[0].getAttribute("nextMM"));
  console.log(dateConversion(nextMM.value));
  console.log(dateConversion(lastMM.value));
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

