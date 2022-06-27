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
const container = document.getElementById("visualization");
const contentdiv = document.getElementsByName("maincontent")[0];
const timelinediv = document.getElementById("Timeline");
const showhidediv = document.getElementById("showhide_div");
const colordiv = document.getElementById("color_div");
const showhideCountriesdiv = document.getElementById("showhide_countries_div");
const navbardiv = document.getElementById("navbar");

// Current page info
var currentpath = window.location.href; //window.location.pathname;
var currentpage = currentpath.substring(currentpath.lastIndexOf("/") + 1); // current_page.html
var pagename = currentpage.split(".")[0]; // current_page
var pageroot = currentpath.substring(0, currentpath.lastIndexOf("/")+1); // http://www.mysite.com/mypage/
//var filename_default = pageroot + pagename + "/frise_chrono.csv"
var filename_default = pageroot + "working_times.csv";
var filetex = pageroot + "main.tex";
var filetex_source = pageroot + "main_source.tex";

document.getElementById("tab_timeline").click();

// Variables in the CSS
var root_css = document.querySelector(":root");

// Initialize global variables
var calendar = [];
var groups = [];
var items = [];
var selected_date = null;
var selected_itemid = null;
var selected_groupid = null;

var data_timeline = [];
var data_timeline_add = [];
var data_request = [];
var timeline = [];
var countries = [];
var items_updated = [];
var defaultOptions = {};
var droppedfiles = [];







//-----------------------------------------------------------------------------------
// Convert from CSV formatted timeline data to a list of items
function convertTimelineData0(data) {
	var group_names = [];
	var data_groups = [];
	var data_item_groupids = [];
	var ind = 0;
	for (var i = 0; i < data.length; i++) {
		var group_name = data[i]["project"];
		if (!group_names.includes(group_name)) {
			group_names.push(group_name);
			var groupid = String(ind);
			var group = {
				id: groupid,
				title: group_name,
				eventColor: 'blue'
			};
			data_groups.push(group);
			ind++
		} else {
			var groupid = "0";
			for (var j = 0; j < data_groups.length; j++) {
				if (data_groups[j]["title"] == group_name) {
					groupid = data_groups[j]["id"];
				}
			}
		}
		data_item_groupids.push(groupid);
	}
	var data_items = [];
	for (var i = 0; i < data.length; i++) {
		var item = {
			id: String(i),
			resourceId: data_item_groupids[i],
			start: data[i]["start_time"],
			end: data[i]["end_time"],
			title: data[i]["project"],
			task: data[i]["task"],
			description: data[i]["descr"],
			day_ratio: data[i]["day_ratio"]
		};
		data_items.push(item);
	}
	return [data_items, data_groups];
}

function convertTimelineData(data, groups) {
	var items = [];
	for (var i = 0; i < data.length; i++) {
		var groupid = "0";
		for (var j = 0; j < groups.length; j++) {
			if (groups[j].title == data[i]["project"]) {
				groupid = groups[j].id;
			}
		}
		var item = {
			id: String(i),
			resourceId: groupid,
			textColor: "#000000",
			start: data[i]["start_time"],
			end: data[i]["end_time"],
			title: data[i]["project"],
			task: data[i]["task"],
			description: data[i]["descr"],
			day_ratio: data[i]["day_ratio"]
		};
		items.push(item);
	}
	return items
}



//-----------------------------------------------------------------------------------
// Load the timeline when a data file is chosen
function loadTimeline() {
	var timeline_file = null;
	if (input.files.length > 0) {
		timeline_file = input.files[0];
		input.value = null; // clear file path to be able to reload the same file
	} else if (droppedfiles.length > 0) {
		timeline_file = droppedfiles[0];
	} else {
		timeline_file = filename_default;
	}
	Papa.parse(timeline_file, {
		header: true,
		download: true,
		complete: function(results) {
			
			// Calendar data
			data_calendar = results.data;

			// Calendar groups
			groups = setTimelineGroups(data_calendar, []);
			
			// Create the Calendar
			createTimeline(data_calendar, groups);
		}
	});
}




//-----------------------------------------------------------------------------------
// Set the groups
function setTimelineGroups(data_calendar, group_names) {
	// Calendar groups
	// var default_colors = ['#3CA25B', '#CB7179', '#cad750', '#7850a1', '#a1ca5a', '#f2273b', '#f2ca5a', '#78a1d7', '#a1a15a', '#ca5aca', '#ca783b', '#3b3b5a'];
	var groups = [];
	var ind = 0;
	for (var i = 0; i < data_calendar.length; i++) {
		var group_name = data_calendar[i]["project"];
		if (data_calendar[i]["start_time"] != "") {
			if (data_calendar[i]["start_time"] == "group") { // groups must be at the top in data_calendar
				if (!group_names.includes(group_name)) {
					var groupid = String(ind);
					var group = {
						id: groupid,
						title: group_name,
						eventColor: data_calendar[i]["task"], // group colors are stored in the task column
						visible: true
					};
					groups.push(group);
					group_names.push(group_name);
					ind++;
				}
			} else {
				if (!group_names.includes(group_name)) {
					var groupid = String(ind);
					var group = {
						id: groupid,
						title: group_name,
						eventColor: '#cccccc',
						visible: true
					};
					groups.push(group);
					group_names.push(group_name);
					// add the group info to the timeline data
					// var item = {
					// 	start_time: "group",
					// 	end_time: "",
					// 	project: group.title,
					// 	task: group.eventColor,
					// 	descr: "",
					// 	day_ratio: 0
					// };
					// results_data0.splice(ind, 0, item); // insert at the top
					ind++;
				}
			}
		}
	}
	return groups;
}


// Set group options
function setGroupOptions(groups) {
	// Clear containers
	while (showhidediv.hasChildNodes()) {
		showhidediv.removeChild(showhidediv.lastChild);
	}
	while (colordiv.hasChildNodes()) {
		colordiv.removeChild(colordiv.lastChild);
	}
	
	// Checkboxes to hide/show groups
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i];
		var groupdiv = document.createElement("div");
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = "showhide";
		checkbox.value = group.id;
		checkbox.className = "w3-check";
		checkbox.id = "cb " + group.id;
		checkbox.checked = group.visible;
		// add event on change function
		checkbox.addEventListener("change", function () {
			// get items of current group
			var groupid = this.id.split(" ")[1];
			var group = calendar.getResourceById(groupid);
			var items_filtered = group.getEvents();
			if (this.checked) {
				// show the group and its corresponding items
				group.setExtendedProp("visible", true);
				for (var j = 0; j < items_filtered.length; j++) {
					//items_filtered[j].setProp("textColor", "#000000");
					items_filtered[j].setProp("display", "auto");
				}
			} else {
				// hide the group and its corresponding items
				group.setExtendedProp("visible", false);
				for (var j = 0; j < items_filtered.length; j++) {
					//items_filtered[j].setProp("textColor", "#cccccc");
					items_filtered[j].setProp("display", "none");
				}
			}
		});
		groupdiv.insertAdjacentElement("afterBegin", checkbox);
		var label = document.createElement("label");
		label.innerHTML = " " + group.title;
		label.for = checkbox.id;
		groupdiv.insertAdjacentElement("beforeEnd", label);
		showhidediv.appendChild(groupdiv);
	}
	
	// Check/uncheck all
	var groupdiv = document.createElement("div");
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = "checkall";
	checkbox.value = "checkall";
	checkbox.className = "w3-check";
	checkbox.id = "cb checkall";
	checkbox.checked = false;
	// add event on change function
	checkbox.addEventListener("change", function () {
		const cbs = document.querySelectorAll('input[name="showhide"]');
		if (this.checked) {
			cbs.forEach((cb) => {
				cb.checked = true;
				triggerEvent(cb, "change");
			});
		} else {
			cbs.forEach((cb) => {
				cb.checked = false;
				triggerEvent(cb, "change");
			});
		}
	});
	groupdiv.insertAdjacentElement("afterBegin", checkbox);
	var label = document.createElement("label");
	label.innerHTML = " (tout sélectionner)";
	label.for = checkbox.id;
	groupdiv.insertAdjacentElement("beforeEnd", label);
	showhidediv.appendChild(groupdiv);
	
	function triggerEvent(element, eventName) {
		var event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, false, true);
		element.dispatchEvent(event);
	}
	
	
	// Color picker for groups
	for (var i = 0; i < groups.length; i++) {
		var group = groups[i];
		var groupdiv = document.createElement("div");
		var colorpicker = document.createElement("input");
		colorpicker.type = "color";
		colorpicker.name = "colorpicker";
		colorpicker.value = group.eventColor;
		colorpicker.className = "classic-color";
		colorpicker.id = "cp " + group.id;
		// add event on change function
		colorpicker.addEventListener("change", function () {
			var groupid = this.id.split(" ")[1];
			var color = this.value;
			var color0 = hex2rgb(color, 0.5);
			var group = calendar.getResourceById(groupid);
			group.setProp("eventColor", color);
			//group.setProp("eventBackgroundColor", color);
			//group.setProp("eventBorderColor", color);
			var items_filtered = group.getEvents();
			for (var j = 0; j < items_filtered.length; j++) {
				items_filtered[j].setProp("backgroundColor", color0);
				items_filtered[j].setProp("borderColor", color);
			}
		});
		groupdiv.insertAdjacentElement("afterBegin", colorpicker);
		
		var label = document.createElement("label");
		label.innerHTML = " " + group.title;
		label.for = colorpicker.id;
		groupdiv.insertAdjacentElement("beforeEnd", label);
		colordiv.appendChild(groupdiv);
	}
}


// Set item options
function setItemOptions() {
	items = calendar.getEvents();
	for (var j = 0; items.length; j++) {
		items[j].setProp("textColor", "#000000");
	}
}




//-----------------------------------------------------------------------------------
// Create the timeline
function createTimeline(data_calendar, groups) {
	// Clear container
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}
	
	// Calendar data
	items = convertTimelineData(data_calendar, groups);
	
	var options = {
		schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
		//now: "2022-01-01",
		editable: true, // enable draggable events
      	droppable: true, // this allows things to be dropped onto the calendar
		selectable: true,
		dayMaxEvents: true, // allow "more" link when too many events
		height: "100%",
		aspectRatio: 1.8,
		scrollTime: "08:00", // undo default 6am scrollTime
		weekends: false,
		weekNumbers: true,
		//hiddenDays: [0, 6], // hide sunday and saturday, same as weekends set to false
		businessHours: {
			daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
			startTime: "08:00",
			endTime: "19:00",
		},
		//dayMinWidth: 200,
		headerToolbar: {
			left: "addEventButton addResourceButton today prev,next",
			center: "title",
			right: "resourceTimeGridDay,timeGridWeek,dayGridMonth,listWeek"
		},
		customButtons: {
			addEventButton: {
				text: "+ tâche",
				click: function() {
					document.getElementById("add_item_form").style.display = "block";
					//calendar.addEvent({title: 'dynamic event', start: date, allDay: true});
					//calendar.addResource({ title: title });
				}
			},
			addResourceButton: {
				text: "+ projet",
				click: function() {
					document.getElementById("add_resource_form").style.display = "block";
				}
			}
		},
		initialView: "dayGridMonth",
		views: {
		  	resourceTimelineThreeDays: {
				type: "resourceTimeline",
				duration: { days: 3 },
				buttonText: "3 jours"
		  	},
			resourceTimelineDay: {
				buttonText: "jour"
			},
			resourceTimeGridDay: {
				buttonText: "jour"
			},
			timeGridWeek: {
				buttonText: "sem."
			},
			dayGridMonth: {
				//titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
				buttonText: "mois"
			},
			listWeek: {
				buttonText: "liste"
			}
		},
		expandRows: true,
		resourceAreaHeaderContent: "Affaires/projets/congés",
		resourceLabelDidMount: function(arg) {
		  	var resource = arg.resource;
		  	arg.el.addEventListener('click', function() {
				// if (confirm('Are you sure you want to delete ' + resource.title + '?')) {
			  	// 	resource.remove();
				// }
				document.getElementById("add_resource_form").style.display = "block";
				document.getElementById("new_project_input").value = resource.title;
				selected_groupid = resource.id;
		  	});
		},
		eventDidMount: function(arg) {
			arg.el.classList.add("tooltip");
			var tooltip_content = document.createElement("p");
			var tooltip_text = arg.event.extendedProps.task;
			tooltip_text = tooltip_text + "</br>" + String(arg.event.extendedProps.day_ratio);
			tooltip_text = tooltip_text + "</br>" + breaklines(arg.event.extendedProps.description, 10);
			tooltip_content.innerHTML = tooltip_text;
			tooltip_content.className = "w3-padding-small tooltiptext";
			arg.el.appendChild(tooltip_content);
		},
		eventClick: function(arg) {
			//console.log('Event: ' + arg.event.title);
			//console.log('Coordinates: ' + arg.jsEvent.pageX + ',' + arg.jsEvent.pageY);
			//console.log('View: ' + arg.view.type);
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.event.start);
			document.getElementById("start_input").value = getISOTime(arg.event.start);
			document.getElementById("end_input").value = getISOTime(arg.event.end);
			document.getElementById("project_input").value = arg.event.title;
			document.getElementById("task_input").value = arg.event.extendedProps.task;
			document.getElementById("descr_input").value = arg.event.extendedProps.description;
			selected_itemid = arg.event.id;
		},
		select: function(arg) {
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.start);
			document.getElementById("start_input").value = getISOTime(arg.start);
			document.getElementById("end_input").value = getISOTime(arg.end);
			if (arg.resource) {
				document.getElementById("project_input").value = arg.resource.title;
			}
		},
		dateClick: function(arg) {
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.date);
			if (arg.date.getHours() > 8) {
				document.getElementById("start_input").value = getISOTime(arg.date);
			}
			if (arg.resource) {
				document.getElementById("project_input").value = arg.resource.title;
			}
		},
		eventReceive: function(arg) { // called when a proper external event is dropped
			console.log('eventReceive', arg.event);
		},
		eventDrop: function(arg) { // called when an event (already on the calendar) is moved
			console.log('eventDrop', arg.event);
		},
		resources: groups,
		events: items
	};
	
	// Create a Calendar
	calendar = new FullCalendar.Calendar(container, options);
	calendar.setOption('locale', 'fr');
	calendar.render();

	// Render item options
	//setItemOptions()

	// Render group options
	setGroupOptions(groups);
	
	console.log("Loading calendar complete!");
}

