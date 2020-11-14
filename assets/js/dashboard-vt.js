// Update dashboard lable
// lable - the lable that needs to be updated
//				- medical-check
//				- su-training
//				- ssm-training
// 				- overall-view
// newValues - format should be xxx / yyy (xxx - actual number / yyy - total number)
// newPercentage - calculated percentage of increase since the last snapshot
// newMessage - tagline for after the percentage

function updateDashboadLable(lableName,newValues, newPercentage, newMessage) {
	var attribute;
	if(newValues != null){
		$(lableName).text(newValues);
	}
	if(newPercentage != null){
		attribute = lableName.concat("-percentage");
		$(attribute).text(newPercentage);
	}
	if(newMessage != null){
		attribute = lableName.concat("-message");
		$(attribute).text(newMessage);
	}
}

function addDashboardLable(lableName,lableId,color,icon) {
	var cardHtml = '<div class="col-xl-3 col-md-6"><div class="card card-stats"><!-- Card body ';
	cardHtml = cardHtml.concat(lableName);
	cardHtml = cardHtml.concat('--><div class="card-body"><div class="row"><div class="col"><h5 class="card-title text-uppercase text-muted mb-0"> ');
	cardHtml = cardHtml.concat(lableName);
	cardHtml = cardHtml.concat('</h5><span class="h2 font-weight-bold mb-0" id="');
	cardHtml = cardHtml.concat(lableId);
	cardHtml = cardHtml.concat('">234 / 498</span></div><div class="col-auto"><div class="icon icon-shape bg-gradient-');
	cardHtml = cardHtml.concat(color); 
	cardHtml = cardHtml.concat(' text-white rounded-circle shadow"><i class="ni ni-');
	cardHtml = cardHtml.concat(icon);
	cardHtml = cardHtml.concat('"></i></div></div></div><p class="mt-3 mb-0 text-sm"><span class="text-success mr-2" id="');
	cardHtml = cardHtml.concat(lableId);
	cardHtml = cardHtml.concat('-percentage"><i class="fa fa-arrow-up"></i> 3.48%</span><span class="text-nowrap" id="');
	cardHtml = cardHtml.concat(lableId);
	cardHtml = cardHtml.concat('-message">Since last month</span></p></div></div></div>');
	$("#dashboard-vt").append(cardHtml);
}

function removeDashboardLables(){
	$("#dashboard-vt").empty();	
}

function setActiveNavPage(){
	var activePage = $("a#page-id").attr('href');
	activePage = activePage.substring(3, activePage.length);
	console.log("Active page: " + activePage);
	$('a.nav-link.active').removeClass('active');
	$('#' + activePage + ' a.nav-link').addClass('active');
}

$(document).ready(function(){
        var textContent = "500 / 500";
        $("#update-button").click(function(){
        	removeDashboardLables();
        	addDashboardLable("Medical check","medical-check","red","ambulance");
        	addDashboardLable("SU training","su-training","orange","atom");
        	addDashboardLable("ssm training","ssm-training","green","support-16");
        	addDashboardLable("Overall view","overall-view","info","chart-bar-32");
            updateDashboadLable("#medical-check","500 / 500", "42%","Changed from last week");
            updateDashboadLable("#su-training","500 / 500", "42%","Changed from last week");
            updateDashboadLable("#ssm-training","500 / 500", "42%","Changed from last week");
            updateDashboadLable("#overall-view","59%", "42%","Changed from last week");
        });
        $("#clear-button").click(function(){
            removeDashboardLables();
		});
		setActiveNavPage();
    });
