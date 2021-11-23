// const nameSelector = document.getElementById("dynamic_select");
// const email = document.getElementById("email");

// email.value = nameSelector.selectedOptions[0].getAttribute("email");

// nameSelector.onchange = (e) => {
//   email.value = e.target.selectedOptions[0].getAttribute("email");
// }

document.getElementById(downloadexcel).addEventListener('click', function() {
  var table2excel = new Table2Excel();
  table2excel.export(document.querySelectorAll("example-table"));
});