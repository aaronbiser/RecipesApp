

$(document).ready(function() {
	
	//Toggle active state of Category Menu
	$('.category-selection ul li').click(function() {
		
		$(this).addClass('active');
		$('.category-selection ul li').not(this).removeClass('active');
		
	});
	
});



$(window).load(function() {
	
	$('.wrapper').fadeTo(500, 1);
	$('#loader').fadeOut(200, 0);
	
});


/*function adaptiveSizing() {

	var mainHeight = $('main').outerHeight();
	$('header').css("height", mainHeight);

}
$(window).load(adaptiveSizing);
$(window).resize(adaptiveSizing);*/


