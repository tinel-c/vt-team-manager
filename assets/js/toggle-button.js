function addToggleButton(buttonName,buttonId,status) {
    var cardHtml = '<div class="toggle-btn';
    if (status == "active") {
        cardHtml = cardHtml.concat(' active"');
    } else if(status == "warning"){
        cardHtml = cardHtml.concat(' warning"');
    }
    cardHtml = cardHtml.concat('"><input type="checkbox" class="cb-value" /><span class="round-btn"></span></div>');
	$(buttonId).append(cardHtml);
}

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

$(document).ready(function(){
    //$('input.cb-value').prop("checked", true);
    addToggleButton("toggleButton",".toggleButton","");    
    configurePageButtons();
    $('.cb-value').click(function() {
        var mainParent = $(this).parent('.toggle-btn');
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