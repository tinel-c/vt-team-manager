const openModalButtons2 = document.querySelectorAll('[data-moodal-target2]');
const closeModalButtons2 = document.querySelectorAll('[data-close-button2]');
const overlay2 = document.getElementById('overlay2');
console.log("primul din edit modal");
openModalButtons2.forEach(button => {
  button.addEventListener('click', () => {
    // console.log("am deschis openModalButtons2")
    const modal = document.querySelector(button.dataset.moodalTarget2)
    openModal2(modal)
    
  })
})

overlay2.addEventListener('click', () => {
  const modals = document.querySelectorAll('.moodal2.active')
  modals.forEach(modal => {
    closeModal2(modal)
  })
})

closeModalButtons2.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.moodal2')
    closeModal2(modal)
  })
})

function openModal2(modal) {
  
  if (modal == null) return
  modal.classList.add('active')
  overlay2.classList.add('active')
  // console.log("am dat openModal cu add");
}

function closeModal2(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay2.classList.remove('active')
  // console.log("am dat openModal cu remove");
}
console.log("al doilea din edit modal");
//de aici e partea pentru delete onChange

const daySelector2 = document.getElementById("dynamic_select");
const startHourInput = document.getElementById("edit-starting-hour");
const endHourInput = document.getElementById("edit-ending-hour");

// console.log(daySelector2.value);
async function firstIteration2(){
  // let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}`);
  let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}?newStartingHour=${startHourInput.value}?newEndingHour=${endHourInput.value}`);
  let data = await response.json();
  let users = document.getElementById("users2");
  users.innerHTML = "";
  // console.log(startHourInput.value);
  // console.log(endHourInput.value);
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("p");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = name + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
  }
}

firstIteration2();
daySelector2.onchange = async (e) => {
  let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}?newStartingHour=${startHourInput.value}?newEndingHour=${endHourInput.value}`);
  // let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}`);
  let data = await response.json();
  let users = document.getElementById("users2");
  users.innerHTML = "";
  // console.log(startHourInput.value);
  // console.log(endHourInput.value);
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("p");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = name + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
  }
}

startHourInput.onchange = async (e) => {
  let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}?newStartingHour=${startHourInput.value}?newEndingHour=${endHourInput.value}`);
  // let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}`);
  let data = await response.json();
  let users = document.getElementById("users2");
  users.innerHTML = "";
  // console.log(startHourInput.value);
  // console.log(endHourInput.value);
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("p");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = name + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
  }
}

endHourInput.onchange = async (e) => {
  let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}?newStartingHour=${startHourInput.value}?newEndingHour=${endHourInput.value}`);
  // let response = await fetch(`http://localhost:8000/get-users-interval-edit?interval=${daySelector2.value}`);
  let data = await response.json();
  let users = document.getElementById("users2");
  users.innerHTML = "";
  // console.log(startHourInput.value);
  // console.log(endHourInput.value);
  for(let i = 0; i < data.length ; i++){
    let p = document.createElement("p");
    let name = data[i].Name;
    let sh = new Date(data[i].Starting_Hour);
    let eh = new Date(data[i].Ending_Hour);
    let startingHour = sh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let endingHour = eh.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12 : false});
    let text = name + ", " + startingHour + "-" + endingHour;
    p.innerHTML = text;
    users.appendChild(p);
  }
}
// console.log("ultimul din edit modal");