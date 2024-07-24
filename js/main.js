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
const groupsdiv = document.getElementById("groups_div");
const navbardiv = document.getElementById("navbar");
const projectinput = document.getElementById("project_input");
const selectedprojectinput = document.getElementById("selectedproject_input");

// List of group inputs (to show hover dropdown list)
const projectinput_list = [projectinput, selectedprojectinput];

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
var datatable = {};
var selected_date = null;
var selected_itemid = null;
var selected_groupid = null;
var droppedfiles = [];
var calendar_hidden_days = [0, 6];

// Init datatable
initDataTable();







//-----------------------------------------------------------------------------------
// Convert from CSV formatted timeline data to a list of items
function convertCalendarData(data, groups) {
	var items = [];
	for (var i = 0; i < data.length; i++) {
		if (data[i]["start_time"] != "group") {
			var groupid = "0"; // default
			var color = "#cccccc";
			// find the item groupid
			for (var j = 0; j < groups.length; j++) {
				if (groups[j].title == data[i]["project"]) {
					groupid = groups[j].id;
					color = groups[j].color;
				}
			}
			var color0 = hex2rgb(color, 0.5);
			var item = {
				id: String(i),
				resourceId: groupid,
				textColor: "#000000",
				backgroundColor: color0,
				borderColor: color,
				start: data[i]["start_time"],
				end: data[i]["end_time"],
				title: data[i]["project"],
				task: data[i]["task"],
				description: data[i]["descr"],
				day_ratio: data[i]["day_ratio"]
			};
			items.push(item);
		}
	}
	return items
}



//-----------------------------------------------------------------------------------
// Load the calendar when a data file is chosen
function loadCalendar(data_items) {
	console.log("load");
	var calendar_file = null;
	if (input.files.length > 0) {
		calendar_file = input.files[0];
	} else if (droppedfiles.length > 0) {
		calendar_file = droppedfiles[0];
	}
	if (data_items) { // data retrieved from local storage backup
		console.log("backup");
		// Calendar groups
		groups = setTimelineGroups(data_items, []);
		// Create the Calendar
		createCalendar(data_items, groups);
	} else if (calendar_file) { // file loaded or dropped
		console.log("file");
		Papa.parse(calendar_file, {
			header: true,
			download: true,
			complete: function(results) {
				// Calendar data
				data_items = results.data;
				// Calendar groups
				groups = setTimelineGroups(data_items, []);
				// Create the Calendar
				createCalendar(data_items, groups);
				// Clear file input to be able to reload the same file
				input.value = null;
				input.files = null;
				droppedfiles = [];
			}
		});
	} else { // no file, open empty calendar
		console.log("empty");
		// Create the Calendar
		createCalendar([], []);
	}
}




//-----------------------------------------------------------------------------------
// Set the groups
function setTimelineGroups(data_items, group_names) {
	// Calendar groups
	// var default_colors = ['#3CA25B', '#CB7179', '#cad750', '#7850a1', '#a1ca5a', '#f2273b', '#f2ca5a', '#78a1d7', '#a1a15a', '#ca5aca', '#ca783b', '#3b3b5a'];
	var groups = [];
	var ind = 0;
	for (var i = 0; i < data_items.length; i++) {
		var group_name = data_items[i]["project"];
		if (data_items[i]["start_time"] != "") {
			if (data_items[i]["start_time"] == "group") { // groups must be at the top in data_items
				if (!group_names.includes(group_name)) {
					var groupid = String(ind);
					var group = {
						id: groupid,
						title: group_name,
						color: data_items[i]["task"], // group colors are stored in the task column
						longname: data_items[i]["descr"], // group long names are stored in the descr column
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
						color: '#cccccc',
						longname: '',
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
	while (groupsdiv.hasChildNodes()) {
		groupsdiv.removeChild(groupsdiv.lastChild);
	}
	for (var i = 0; i < projectinput_list.length; i++) {
		var projectlistdiv = document.getElementById("projectlist_" + String(i));
		if (projectlistdiv) {
			while (projectlistdiv.hasChildNodes()) {
				projectlistdiv.removeChild(projectlistdiv.lastChild);
			}
		}
	}
	
	// Group properties
	for (var i = 0; i < groups.length; i++) {
		var groupdiv = document.createElement("div");
		groupdiv.className = "w3-cell-row w3-margin-top";
		// Group title
		var label = document.createElement("span");
		label.innerHTML = " " + groups[i].title;
		// Checkbox to show/hide
		var groupid = groups[i].id;
		if (groups[i].visible) {
			var visible = groups[i].visible;
		} else {
			var visible = groups[i].extendedProps.visible;
		}
		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.name = "showhide";
		checkbox.value = groupid;
		checkbox.className = "w3-check";
		checkbox.id = "cb " + groupid;
		checkbox.checked = visible;
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
		// Color picker
		if (groups[i].color) {
			var color = groups[i].color;
		} else {
			var color = groups[i].extendedProps.color;
		}
		var colorpicker = document.createElement("input");
		colorpicker.type = "color";
		colorpicker.name = "colorpicker";
		colorpicker.value = color;
		colorpicker.className = "classic-color";
		colorpicker.id = "cp " + groupid;
		// add event on change function
		colorpicker.addEventListener("change", function () {
			var groupid = this.id.split(" ")[1];
			var color = this.value;
			var color0 = hex2rgb(color, 0.5);
			var group = calendar.getResourceById(groupid);
			group.setExtendedProp("color", color);
			//group.setProp("eventBackgroundColor", color);
			//group.setProp("eventBorderColor", color);
			var items_filtered = group.getEvents();
			for (var j = 0; j < items_filtered.length; j++) {
				items_filtered[j].setProp("backgroundColor", color0);
				items_filtered[j].setProp("borderColor", color);
			}
		});
		// Group long name
		if (groups[i].longname || groups[i].longname == "") {
			var longname = groups[i].longname;
		} else {
			var longname = groups[i].extendedProps.longname;
		}
		var textinput = document.createElement("input");
		textinput.type = "text";
		textinput.name = "textinput";
		textinput.value = longname;
		textinput.className = "w3-input w3-border";
		textinput.id = "ti " + groupid;
		// add event on change function
		textinput.addEventListener("change", function () {
			var groupid = this.id.split(" ")[1];
			var text = this.value;
			var group = calendar.getResourceById(groupid);
			group.setExtendedProp("longname", text);
		});
		// Append all child elements
		var els = [checkbox, colorpicker, label, textinput];
		var dims = [1, 1, 4, 5]; // total width of base 12
		for (var j = 0; j < els.length; j++) {
			var el_div = document.createElement("div");
			el_div.className = `w3-col s${dims[j]} m${dims[j]}`;
			el_div.appendChild(els[j]);
			groupdiv.appendChild(el_div);
		}
		groupsdiv.appendChild(groupdiv);
	}
	
	// Check/uncheck all
	var groupdiv = document.createElement("div");
	groupdiv.className = "w3-cell-row";
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
	groupsdiv.appendChild(groupdiv);
	
	function triggerEvent(element, eventName) {
		var event = document.createEvent("HTMLEvents");
		event.initEvent(eventName, false, true);
		element.dispatchEvent(event);
	}


	// List of groups
	for (var j = 0; j < projectinput_list.length; j++) {
		// parent div
		var listparent = projectinput_list[j].parentNode;
		// list container
		var projectlistdiv = document.createElement("div");
		projectlistdiv.id = "projectlist_" + String(j);
		projectlistdiv.className = "w3-dropdown-content w3-bar-block w3-card";
		projectlistdiv.style.maxHeight = "200px";
		projectlistdiv.style.overflow = "auto";
		// list elements
		for (var i = 0; i < groups.length; i++) {
			var groupid = groups[i].id;
			var button = document.createElement("button");
			//button.type = "button";
			button.name = "selectbutton " + String(j);
			button.className = "w3-bar-item w3-button";
			button.id = "button " + groupid;
			button.innerHTML = groups[i].title;
			button.addEventListener("click", function (evt) {
				evt.preventDefault();
				var ind = this.name.split(" ")[1];
				var project = evt.target.innerHTML;
				projectinput_list[ind].value = project;
			});
			projectlistdiv.appendChild(button);
		}
		listparent.appendChild(projectlistdiv);
	}
}


// Set item options
function setItemOptions() {
	items = calendar.getEvents();
	for (var j = 0; items.length; j++) {
		items[j].setProp("textColor", "#000000");
	}
}



// Set table result time range
function setDefaultTimeRange(items) {
	if (items.length > 0) {
		var date_start = items[0].start.split("T")[0];
		var date_start = new Date(date_start);
		var date_end = items[items.length - 1].start.split("T")[0];
		var date_end = new Date(date_end);
	} else {
		var date_start = new Date(); // now
		var date_end = new Date();
	}
	var range_start = String(date_start.getFullYear());
	var range_end = String(date_end.getFullYear());
	document.getElementById("startrange_input").value = range_start;
	document.getElementById("endrange_input").value = range_end;
}



//-----------------------------------------------------------------------------------
// Create the timeline
function createCalendar(data_items, groups) {
	// Clear container
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}
	
	// Calendar data
	items = convertCalendarData(data_items, groups);

	// Current date
	if (items.length > 0) {
		var date_curr = items[items.length - 1].start.split("T")[0];
	} else {
		var date = new Date(); // now
		var date_curr = getISODate(date);
	}
	
	var options = {
		schedulerLicenseKey: "CC-Attribution-NonCommercial-NoDerivatives",
		now: date_curr,
		editable: true, // enable draggable events
      	droppable: true, // this allows things to be dropped onto the calendar
		selectable: true,
		dayMaxEvents: 3, // allow the "more" link when too many events
		height: "100%",
		aspectRatio: 1.8,
		scrollTime: "08:00", // undo default 6am scrollTime
		//weekends: false,
		weekNumbers: true,
		weekText: "S ",
		expandRows: true,
		selectMirror: true,
		showNonCurrentDates: false, // only show current month dates in month view
		filterResourcesWithEvents: false, // warning, do not show resource on an empty day
		resourceOrder: "id", // sort by id
		//unselectCancel: ".addform", // keep background selection, but strange behaviour after the new event is created
		hiddenDays: [0, 6], // hide sunday and saturday, same as weekends set to false
		// businessHours: {
		// 	daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
		// 	startTime: "08:00",
		// 	endTime: "19:00",
		// },
		//dayMinWidth: 200,
		headerToolbar: {
			left: "addEventButton addResourceButton prev,next",
			center: "title",
			right: "resourceTimeGridDay,timeGridWeek,dayGridMonth,listWeek"
		},
		customButtons: {
			addEventButton: {
				text: "+ tâche",
				click: function() {
					document.getElementById("add_item_form").style.display = "block";
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
		eventClassNames:["item-font"],
		eventBackgroundColor: hex2rgb("#cccccc", 0.5),
		eventBorderColor: "#cccccc",
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
		eventDidMount: function(arg) { // called when the current event page is rendered
			console.log('eventMount', arg)
			if (arg.event.id != "") {
				setTooltip(arg);
			}
		},
		eventClick: function(arg) { // called when an existing event is clicked
			console.log('eventClick', arg)
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.event.start);
			document.getElementById("start_input").value = getISOTime(arg.event.start);
			document.getElementById("end_input").value = getISOTime(arg.event.end);
			document.getElementById("project_input").value = arg.event.title;
			document.getElementById("task_input").value = arg.event.extendedProps.task;
			document.getElementById("descr_input").value = arg.event.extendedProps.description;
			selected_itemid = arg.event.id;
		},
		select: function(arg) { // called when a selection is made on a date (no existing event selected)
			console.log('select', arg)
			if (getISOTime(arg.start) != "00:00:00") { // only for a selection within a day (disabled in dayGridMonth view)
				document.getElementById("add_item_form").style.display = "block";
				document.getElementById("date_input").value = getISODate(arg.start);
				document.getElementById("start_input").value = getISOTime(arg.start);
				document.getElementById("end_input").value = getISOTime(arg.end);
				if (arg.resource) {
					document.getElementById("project_input").value = arg.resource.title;
				}
			}
		},
		dateClick: function(arg) { // called when a date is clicked (no existing event clicked)
			console.log('dateClick', arg)
			var date = getISODate(arg.date);
			calendar.changeView("timeGridWeek", date);
		},
		eventReceive: function(arg) { // called when a proper external event is dropped
			console.log('eventReceive', arg)
		},
		eventDrop: function(arg) { // called when an event (already on the calendar) is moved
			console.log('eventDrop', arg)
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.event.start);
			document.getElementById("start_input").value = getISOTime(arg.event.start);
			document.getElementById("end_input").value = getISOTime(arg.event.end);
			document.getElementById("task_input").value = arg.event.extendedProps.task;
			document.getElementById("descr_input").value = arg.event.extendedProps.description;
			if (arg.newResource) {
				document.getElementById("project_input").value = arg.newResource.title;
			} else {
				document.getElementById("project_input").value = arg.event.title;
			}
			selected_itemid = arg.event.id;
			addItem();
		},
		eventResize: function(arg) { // called when an existing event is resized
			console.log('eventResize', arg)
			document.getElementById("add_item_form").style.display = "block";
			document.getElementById("date_input").value = getISODate(arg.event.start);
			document.getElementById("start_input").value = getISOTime(arg.event.start);
			document.getElementById("end_input").value = getISOTime(arg.event.end);
			document.getElementById("task_input").value = arg.event.extendedProps.task;
			document.getElementById("descr_input").value = arg.event.extendedProps.description;
			document.getElementById("project_input").value = arg.event.title;
			selected_itemid = arg.event.id;
			addItem();
		},
		resources: groups,
		events: items
	};
	
	// Create a Calendar
	calendar = new FullCalendar.Calendar(container, options);
	calendar.setOption("locale", "fr");
	calendar.setOption("resourceOrder", "id");
	calendar.render();

	// Render item options
	//setItemOptions()

	// Render group options
	setGroupOptions(groups);

	// Set default time range for synthesis
	setDefaultTimeRange(items);

	// Update datatable
	updateDataTable();
	
	console.log("Loading calendar complete!");
	// var cmap = buildColormap(12, "#ff0000");
	// console.log(cmap)
	// for (var i = 0; i < cmap.length; i++) {
	// 	var div = document.createElement("div");
	// 	div.className = "w3-bar";
	// 	div.style.height = "50px";
	// 	div.style.backgroundColor = cmap[i];
	// 	groupsdiv.appendChild(div);
	// }
}

