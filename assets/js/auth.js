/* Function to delete the authentification cookie
   releases the cookie from the browser
   Redirect to the login page
*/
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
    // add the logout function to the logout button
    $('#logout').click(function() {
        logoutFromApp();
        });
})