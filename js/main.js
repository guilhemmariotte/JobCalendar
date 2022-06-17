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

var data_timeline = [];
var data_timeline_add = [];
var data_request = [];
var timeline = [];
var countries = [];
var items_updated = [];
var defaultOptions = {};
var droppedfiles = [];







//-----------------------------------------------------------------------------------
// Convert from CSV formatted timeline data to a list of items (for DataVis data)
function convertTimelineData(data) {
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
			
			// Timeline data
			data_calendar = results.data;
			
			// Create the timeline
			createTimeline(data_calendar);
		}
	});
}





//-----------------------------------------------------------------------------------
// Create the timeline
function createTimeline(data_calendar) {
	// Clear container
	while (container.hasChildNodes()) {
		container.removeChild(container.lastChild);
	}
	
	// Calendar data
	var data = convertTimelineData(data_calendar);
	var data_items = data[0];
	var data_groups = data[1];
	items = data_items;
	groups = data_groups;
	
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
			left: "addEventButton today prev,next",
			center: "title",
			right: "resourceTimeGridDay,timeGridWeek,dayGridMonth,listWeek"
		},
		customButtons: {
			addEventButton: {
				text: "+",
				click: function() {
					document.getElementById("add_item_form").style.display = "block";
					//calendar.addEvent({title: 'dynamic event', start: date, allDay: true});
					//calendar.addResource({ title: title });
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
		resourceAreaHeaderContent: "Rooms",
		resourceLabelDidMount: function(arg) {
		  	var resource = arg.resource;
		  	arg.el.addEventListener('click', function() {
				if (confirm('Are you sure you want to delete ' + resource.title + '?')) {
			  		resource.remove();
				}
		  	});
		},
		eventDidMount: function(info) {
			// var tooltip = new Tooltip(info.el, {
			//   	title: info.event.extendedProps.description,
			//   	placement: 'top',
			//   	trigger: 'hover',
			//   	container: 'body'
			// });
		},
		eventClick: function(info) {
			console.log('Event: ' + info.event.title);
			console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
			console.log('View: ' + info.view.type);
		},
		select: function(arg) {
			console.log(
			  	'select',
			  	arg.startStr,
			  	arg.endStr,
			  	arg.resource ? arg.resource.id : '(no resource)'
			);
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
			//addItem(arg.dateStr);
		},
		eventReceive: function(arg) { // called when a proper external event is dropped
			console.log('eventReceive', arg.event);
		},
		eventDrop: function(arg) { // called when an event (already on the calendar) is moved
			console.log('eventDrop', arg.event);
		},
		resources: data_groups,
		events: data_items
	};
	
	// Create a Calendar
	calendar = new FullCalendar.Calendar(container, options);
	calendar.setOption('locale', 'fr');
	calendar.render();
	
	// add event listener
	//timeline.on('rangechanged', onRangeChanged);
	
	console.log("Loading calendar complete!");
}

