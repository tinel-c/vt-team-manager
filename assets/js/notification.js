function getNotifications() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        $('div.list-group').replaceWith(this.responseText)
        }
    };
    xhttp.open("GET", "/notification/allHtml", true);
    xhttp.send();
}

function updateNoOfNotifications() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        var numberJSON = JSON.parse( this.responseText );
        console.log(numberJSON);
        $('h6.text-sm strong.text-primary').replaceWith('<strong class="text-primary">' + numberJSON.RESULT + '</strong>')
        }
    };
    xhttp.open("GET", "/notification/notificationNo", true);
    xhttp.send();
}

$(document).ready(function(){
    window.setInterval(function(){
        /// call your function here
        getNotifications();
        updateNoOfNotifications();
      }, 10000);
})