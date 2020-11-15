function logoutFromApp() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        window.location.href = "/";
        }
    };
    xhttp.open("POST", "/api/logout", true);
    xhttp.send();
    console.log("Logout pressed!");
}

$(document).ready(function(){
    $('#logout').click(function() {
        logoutFromApp();
        });
})