let allUsersCount = document.getElementById("allUsersCount").value;
console.log(allUsersCount);
let subordinatesCount = document.getElementById("subordinatesCount").value;
console.log(subordinatesCount);
let subordinatesExpired = document.getElementById("subordinatesExpired").value;
console.log(subordinatesExpired);
let allUsersExpired = document.getElementById("allUsersExpired").value;
console.log(allUsersExpired);

var xValues = ["All users", "expired appointments", "Subordinates", "Subordinates expired appointments"];
var yValues = [allUsersCount, allUsersExpired, subordinatesCount, subordinatesExpired];
var barColors = ["red", "green","blue","orange"];

new Chart("myChart", {
  type: "horizontalBar",
  data: {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  },
  options: {
    legend: {display: false},
    title: {
      display: false,
      text: "World Wine Production 2018"
    }
  }
});