// JobCalendar
//
// JavaScript application to record, classify and visualize jobs and tasks
// Based on fullcalendar.io JS library
//
// Author: Guilhem Mariotte
// Date: June 2022
// 
//-----------------------------------------------------------------------------------


// DOM element where the Timeline will be attached
const trackingdiv = document.getElementById("tracking_div");


//-----------------------------------------------------------------------------------
// Fill list
function refreshTracking() {

	// clear the list
	clearDiv(trackingdiv);

	// get selected project
	var selected_project = selectedprojectinput.value;

	// get items
	var month_names = [];
	var project_timeline = [];
	var items = calendar.getEvents();
	for (var i = 0; i < items.length; i++) {
		var project = items[i].title;
		if (project == selected_project) {
			var start_time = items[i].start;
			var task = items[i].extendedProps.task;
			var descr = items[i].extendedProps.description;
			var ratio = items[i].extendedProps.day_ratio;
			var month_name = FullCalendar.formatDate(start_time, {month: "long", year: "numeric", locale: "fr"});
			if (!month_names.includes(month_name)) {
				project_timeline[month_name] = [[start_time, 0, Number(ratio), task, descr]];
				month_names.push(month_name);
			} else {
				project_timeline[month_name].push([start_time, 0, Number(ratio), task, descr]);
			}
		}
	}

	// fill list
	var weekdays = ["lu", "ma", "me", "je", "ve", "sa", "di"];
	var ratio_tot = 0;
	for (var i = 0; i < month_names.length; i++) {

		// month button
		var panel_id = "panel " + month_names[i];
		var month_btn = document.createElement("button");
		month_btn.name = panel_id;
		month_btn.className = "w3-button w3-block w3-left-align w3-large w3-black";
		month_btn.innerHTML = month_names[i] + '<i class="fa fa-chevron-down w3-right"></i>';
		//month_btn.addEventListener("click", expandPanel(this.name));
		month_btn.addEventListener("click", function (evt) {
			evt.preventDefault();
			expandPanel(this.name);
		});
		trackingdiv.appendChild(month_btn);

		// expandable
		var month_div = document.createElement("div");
		month_div.id = panel_id;
		month_div.className = "w3-container w3-show";
		var month_tab = document.createElement("table");
		var tabcontents = project_timeline[month_names[i]];
		var color = "#ffffff";
		var prevday = -1;
		var prevdate = 31;
		for (var j = 0; j < tabcontents.length; j++) {
			ratio_tot = ratio_tot + tabcontents[j][2]; // cumulative time spend
			var tabrow = document.createElement("tr");
			// color of the week (change color if change week)
			if (tabcontents[j][0].getDay() < prevday || tabcontents[j][0].getDate() > prevdate + 6) {
				if (color == "#ffffff") {
					color = "#dddddd";
				} else {
					color = "#ffffff";
				}
			}
			prevday = tabcontents[j][0].getDay();
			prevdate = tabcontents[j][0].getDate();
			// start time
			var tabitem = document.createElement("td");
			tabitem.style.width = "10%";
			tabitem.style.backgroundColor = color;
			tabitem.innerHTML = FullCalendar.formatDate(tabcontents[j][0], {day: "numeric", weekday: "short", locale: "fr"});
			//tabitem.innerHTML = weekdays[prevday-1] + " " + tabcontents[j][0].getDate();
			tabrow.appendChild(tabitem);
			// ratio tot
			var tabitem = document.createElement("td");
			tabitem.style.width = "5%";
			tabitem.style.backgroundColor = color;
			tabitem.innerHTML = ratio_tot.toFixed(1);
			tabrow.appendChild(tabitem);
			// ratio
			var tabitem = document.createElement("td");
			tabitem.style.width = "5%";
			tabitem.style.backgroundColor = color;
			tabitem.innerHTML = tabcontents[j][2].toFixed(1);
			tabrow.appendChild(tabitem);
			// task
			var tabitem = document.createElement("td");
			tabitem.style.width = "10%";
			tabitem.style.backgroundColor = color;
			tabitem.innerHTML = tabcontents[j][3];
			tabrow.appendChild(tabitem);
			// descr
			var tabitem = document.createElement("td");
			tabitem.style.width = "70%";
			tabitem.style.backgroundColor = color;
			tabitem.innerHTML = tabcontents[j][4];
			tabrow.appendChild(tabitem);
			//
			month_tab.appendChild(tabrow);
		}
		month_div.appendChild(month_tab);
		trackingdiv.appendChild(month_div);
	}
}


// Clear list
function clearDiv(div_el) {
	while (div_el.hasChildNodes()) {
		div_el.removeChild(div_el.lastChild);
	}
}


// Expand / close all
function expandCloseAll() {
	var buttons = trackingdiv.getElementsByTagName("button");
	var num_closed = 0;
	for (var i = 0; i < buttons.length; i++) {
		var panel_id = buttons[i].name;
		var el = document.getElementById(panel_id);
		if (el.className.indexOf("w3-show") == -1) {
			num_closed = num_closed + 1;
		}
	}
	if (num_closed > buttons.length / 2) {
		// majority of closed panels > expand all
		for (var i = 0; i < buttons.length; i++) {
			var panel_id = buttons[i].name;
			var el = document.getElementById(panel_id);
			if (el.className.indexOf("w3-show") == -1) {
				el.className += " w3-show";
		  	}
		}
	} else {
		// majority of expanded panels > close all
		for (var i = 0; i < buttons.length; i++) {
			var panel_id = buttons[i].name;
			var el = document.getElementById(panel_id);
			if (el.className.indexOf("w3-show") != -1) {
				el.className = el.className.replace(" w3-show", " w3-hide");
		  	}
		}
	}
}
