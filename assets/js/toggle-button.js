// Function to trigger the correct configuration for the buttons at the load of the page
// current available configuration for the buttons
// * warning
// * active
// PUG usage div.toggleButton.warning
function configurePageButtons(){
    $( ".toggleButton.warning div" ).each(function( index ) {
        $(this).addClass("warning");
      });
    $( ".toggleButton.active div" ).each(function( index ) {
        $(this).addClass("active");
      });
      $( ".toggleButton.active div input.cb-value" ).each(function( index ) {
        $(this).prop( "checked", true );
      });
}

//goes inside the page and adds all the buttons inside the page
//the necessary html code is added to the page based on the buttonId
// Eg. div.toggleButton will expand to the correct html output
function addToggleButtons(buttonId) {
    var cardHtml = '<div class="toggle-btn"><input type="checkbox" class="cb-value" /><span class="round-btn"></span></div>';
    $(buttonId).append(cardHtml);
    configurePageButtons();
}

$(document).ready(function(){
    //$('input.cb-value').prop("checked", true);
    addToggleButtons(".toggleButton");    
    $('.cb-value').click(function() {
        var mainParent = $(this).parent('.toggle-btn');
        // add actions when the buttons are pressed / depressed
        if($(mainParent).find('input.cb-value').is(':checked')) {
        $(mainParent).addClass('active');
        $(mainParent).removeClass('warning');
        console.log("Add: "+$(mainParent).closest('.id').attr('id')+" "+$(mainParent).closest('td').attr("class"));
        //TODO add code to add person to database
        } else {
        $(mainParent).removeClass('active');
        console.log("Remove: "+$(mainParent).closest('.id').attr('id')+" "+$(mainParent).closest('td').attr("class"));
        //TODO add code to add person to remove person to database
        }
    })
})