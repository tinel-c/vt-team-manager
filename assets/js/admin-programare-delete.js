const formalNameSelector = document.getElementById("dynamic_select");
const deleteAppointment = document.getElementById("deleteTimeSlot");
const formalName = document.getElementById("formalNameForDeletedAppointment");
const hiddenOrNot = document.getElementById("hiddenOrNot");
const hiddenDeleteTimeSlot = document.getElementById("hiddenDeleteTimeSlot");

// function HiddenIteration(date){
//   if(date != ""){
//     console.log("avem date");
//   } else {
//     console.log("nu avem date");
//   }
// }

async function firstIteration(){
  let response = await fetch(`http://localhost:8000/get-users-appointments?selectedName=${formalNameSelector.value}`);
  let data = await response.json();
  if(data==""){
    hiddenOrNot.style.display = "none";
    console.log("nu avem date");
  } else {
    hiddenOrNot.style.display = "flex";
    console.log("avem date");
  }
  let users = document.getElementById("users");
  users.innerHTML = "";
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("strong");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = sh.toLocaleString('en-us', {weekday:'long'})+", "+sh.getUTCDate()+" "+sh.toLocaleString('en', { month: 'short' })+" "+sh.getUTCFullYear() + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
    deleteAppointment.value = sh;
    hiddenDeleteTimeSlot.value = sh;
    formalName.value = name;
  }
}

firstIteration();
formalNameSelector.onchange = async (e) => {
  let response = await fetch(`http://localhost:8000/get-users-appointments?selectedName=${formalNameSelector.value}`);
  let data = await response.json();
  if(data==""){
    hiddenOrNot.style.display = "none";
    console.log("nu avem date");
  } else {
    hiddenOrNot.style.display = "flex";
    console.log("avem date");
  }

  let users = document.getElementById("users");
  users.innerHTML = "";
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("strong");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = sh.toLocaleString('en-us', {weekday:'long'})+", "+sh.getUTCDate()+" "+sh.toLocaleString('en', { month: 'short' })+" "+sh.getUTCFullYear() + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
    deleteAppointment.value = sh;
    hiddenDeleteTimeSlot.value = sh;
    formalName.value = name;
  }
}