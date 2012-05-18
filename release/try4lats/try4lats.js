$(document).ready( function() {
	$("table.horizonalpanel > tbody > tr > td").click( function(e) {
		$("table.horizonalpanel > tbody > tr > td.selected").removeClass("selected");
		$(this).addClass("selected");
	});
	$("table.verticalpanel > tbody > tr").click( function(e) {
		$("table.verticalpanel > tbody > tr.selected").removeClass("selected");
		$(this).addClass("selected");
	});
});