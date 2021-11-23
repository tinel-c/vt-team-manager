const openModalButtons = document.querySelectorAll('[data-moodal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.moodalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.moodal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.moodal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}

//de aici e partea pentru delete onChange

const daySelector = document.getElementById("dynamic_select_delete");

async function firstIteration(){
  let response = await fetch(`http://localhost:8000/get-users-interval?interval=${daySelector.value}`);
  let data = await response.json();
  let users = document.getElementById("users");
  users.innerHTML = "";
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

firstIteration();
daySelector.onchange = async (e) => {
  let response = await fetch(`http://localhost:8000/get-users-interval?interval=${daySelector.value}`);
  let data = await response.json();
  let users = document.getElementById("users");
  users.innerHTML = "";
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