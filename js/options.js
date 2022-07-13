// JobCalendar
//
// JavaScript application to record, classify and visualize jobs and tasks
// Based on fullcalendar.io JS library
//
// Author: Guilhem Mariotte
// Date: June 2022
// 
//-----------------------------------------------------------------------------------




//-----------------------------------------------------------------------------------
// Open tabs
function openTab(evt, tab_id) {
	// Declare all variables
	var i, tabcontent, tablinks;
	// Get all elements with class="tabcontent" and hide them
	tabcontent = document.getElementsByClassName("tabcontent");
	for (var i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	// Get all elements with class="tablinks" and remove the class "active"
	tablinks = document.getElementsByClassName("tablinks");
	for (var i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	// Show the current tab, and add an "active" class to the button that opened the tab
	document.getElementById(tab_id).style.display = "block";
	evt.currentTarget.className += " active";
}


// Expand panel
function expandPanel(panel_id) {
	var el = document.getElementById(panel_id);
	if (el.className.indexOf("w3-show") == -1) {
	  	el.className += " w3-show";
	} else {
	  	el.className = el.className.replace(" w3-show", " w3-hide");
	}
}


// Filter entries (on key up)
function filterEntries(evt) {
	// input value (currently entered)
	var inputvalue = evt.currentTarget.value.toUpperCase();
	// parent div
	var listparent = evt.currentTarget.parentNode;
	var listdiv = listparent.getElementsByTagName("div")[0];
	// list elements
	var buttons = listdiv.getElementsByTagName("button");
	for (var i = 0; i < buttons.length; i++) {
		txtvalue = buttons[i].innerHTML;
		if (txtvalue.toUpperCase().indexOf(inputvalue) > -1) {
			buttons[i].style.display = "";
		} else {
			buttons[i].style.display = "none";
		}
	}
}



//-----------------------------------------------------------------------------------
// Options
function enableEdition(evt) {
	if (evt.currentTarget.checked) {
		calendar.setOption("editable", true);
		calendar.setOption("selectable", true);
	} else {
		calendar.setOption("editable", false);
		calendar.setOption("selectable", false);
	}
	calendar.render();
}

function showAllGroups(evt) {
	if (evt.currentTarget.checked) {
		calendar.setOption("filterResourcesWithEvents", false);
	} else {
		calendar.setOption("filterResourcesWithEvents", true);
	}
	calendar.render();
}

function enablePopup(evt) {
	if (evt.currentTarget.checked) {
		calendar.setOption('eventDidMount', function(arg){
			if (arg.event.id != ""){
				setTooltip(arg);
			}
		});
	} else {
		calendar.setOption('eventDidMount', function(arg){});
	}
}

function setDateClick(evt) {
	if (evt.currentTarget.checked) {
		root_css.style.setProperty("--overflowtype", "visible");
	} else {
		root_css.style.setProperty("--overflowtype", "hidden");
	}
}

function changeFontsize(evt) {
	var fontsize = String(evt.currentTarget.value) + "px";
	root_css.style.setProperty("--itemfontsize", fontsize);
	calendar.render();
}


// Set tooltip
function setTooltip(arg) {
	arg.el.classList.add("tooltip");
	var tooltip_content = document.createElement("p");
	var tooltip_text = arg.event.extendedProps.task;
	tooltip_text = tooltip_text + "</br>" + String(arg.event.extendedProps.day_ratio);
	tooltip_text = tooltip_text + "</br>" + breaklines(arg.event.extendedProps.description, 10);
	tooltip_content.innerHTML = tooltip_text;
	tooltip_content.className = "w3-padding-small tooltiptext";
	arg.el.appendChild(tooltip_content);
}
