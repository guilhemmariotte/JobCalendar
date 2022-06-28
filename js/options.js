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
function openTab(evt, tabId) {
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
	document.getElementById(tabId).style.display = "block";
	evt.currentTarget.className += " active";
}



//-----------------------------------------------------------------------------------
// Options
function refreshTimeline() {
	const enableGroupsBtn = document.getElementById("enable_groups");
	if (enableGroupsBtn.checked) {
		timeline.setGroups(null);
		timeline.setGroups(groups);
	} else {
		timeline.setGroups(groups);
		timeline.setGroups(null);
	}
}

function enableGroups(evt) {
	if (evt.currentTarget.checked) {
		timeline.setGroups(groups);
	} else {
		timeline.setGroups(null);
	}
}

function enableClusters(evt) {
	var options = {};
	if (evt.currentTarget.checked) {
		var clusterOpts = {
			cluster: {
				titleTemplate: "{count} éléments regroupés, double-cliquer pour afficher",
				showStipes: false,
				maxItems: 1,
				clusterCriteria: (firstItem, secondItem) => {
					if (Math.abs(getYear(firstItem.start) - getYear(secondItem.start)) < 5) {
						return true;
					} else {
						return false;
					}
				},
			},
		};
		timeline.setOptions(clusterOpts);
		//Object.assign(options, defaultOptions, clusterOpts);
	} else {
		timeline.setOptions({cluster: false});
		//Object.assign(options, defaultOptions);
	}
	refreshTimeline();
	//timeline.setOptions(options);
}

function enableOrdering(evt) { // not used yet
	if (evt.currentTarget.checked) {
		timeline.setOptions({order: (firstItem, secondItem) => {
			// order by rank
			return firstItem.rank - secondItem.rank;
		}});
	} else {
		timeline.setOptions({order: () => {}});
	}
}

function enableEdition(evt) {
	if (evt.currentTarget.checked) {
		calendar.setOption('editable', true);
		calendar.setOption('selectable', true);
	} else {
		calendar.setOption('editable', false);
		calendar.setOption('selectable', false);
	}
	calendar.render();
}

function enablePopup(evt) {
	if (evt.currentTarget.checked) {
		calendar.setOption('eventDidMount', function(arg){setTooltip(arg)});
	} else {
		calendar.setOption('eventDidMount', function(arg){});
	}
}

function enableStack(evt) {
	if (evt.currentTarget.checked) {
		timeline.setOptions({stack: true});
	} else {
		timeline.setOptions({stack: false});
	}
}

function enableOverflow(evt) {
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
