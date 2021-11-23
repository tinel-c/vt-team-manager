$(document).ready(function () {
  $(".l-layout").slick({
    slidesToShow: 1,
    adaptiveHeight: true,
    autoplay: false,
    prevArrow: ".arrow_prev",
    nextArrow: ".arrow_next",
    draggable: false,
  });
});

const nameSelector = document.getElementById("dynamic_select");
const email = document.getElementById("email");

email.value = nameSelector.selectedOptions[0].getAttribute("email");

nameSelector.onchange = (e) => {
  email.value = e.target.selectedOptions[0].getAttribute("email");
}
