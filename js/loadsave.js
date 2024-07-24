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
// Input file
const input = document.getElementById("load");
input.addEventListener('change', function() {loadCalendar(null)});

// Load default
const load_default = document.getElementById("load_default");
load_default.addEventListener('click', function() {loadCalendar(null)});

// Load backup on page load
document.addEventListener("DOMContentLoaded", loadCalendarFromBackup);

// Confirm message to prevent from leaving, closing, refreshing the page
window.addEventListener('beforeunload', function(evt) {evt.returnValue = null});

// Save file
const save = document.getElementById("save");
save.addEventListener('click', saveCalendar);

// Export file
const file_export = document.getElementById("file_export");
file_export.addEventListener('click', exportCalendar);


// Drag and drop
function dragenter(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	timelinediv.style.backgroundColor = "#ddddff";
	timelinediv.style.border = "4px dashed black";
}

function dragover(evt) {
	evt.stopPropagation();
	evt.preventDefault();
}

function drop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	timelinediv.style.backgroundColor = null;
	timelinediv.style.border = null;
	// Get file
	var dt = evt.dataTransfer;
	droppedfiles = [...dt.files];
	// Load timeline
	loadCalendar(null);
}

timelinediv.addEventListener("dragenter", dragenter, false);
timelinediv.addEventListener("dragover", dragover, false);
timelinediv.addEventListener("drop", drop, false);


//-----------------------------------------------------------------------------------
// Upload data
function loadCalendarFromBackup() {
	if (window.localStorage["JobCalendarBackup"]) {
		var data_items = JSON.parse(window.localStorage.getItem("JobCalendarBackup"));
		loadCalendar(data_items);
	}
}


//-----------------------------------------------------------------------------------
// Download data
function saveCalendarToJSON() {
	if (calendar) {
		var groups = calendar.getResources();
		var items = calendar.getEvents();
		var data_items = [];
		for (var i = 0; i < groups.length; i++) {
			var item = {
				start_time: "group",
				end_time: "",
				project: groups[i].title,
				task: groups[i].extendedProps.color,
				descr: groups[i].extendedProps.longname,
				day_ratio: 0
			};
			data_items.push(item);
		}
		for (var i = 0; i < items.length; i++) {
			var start_time = getISODate(items[i].start) + "T" + getISOTime(items[i].start);
			var end_time = getISODate(items[i].end) + "T" + getISOTime(items[i].end);
			var item = {
				start_time: start_time,
				end_time: end_time,
				project: items[i].title,
				task: items[i].extendedProps.task,
				descr: items[i].extendedProps.description,
				day_ratio: items[i].extendedProps.day_ratio
			};
			data_items.push(item);
		}
		return data_items
	} else {
		return null
	}
}

// Save calendar to the browser local storage
function saveToLocalStorage() {
	var data_items = saveCalendarToJSON();
	window.localStorage.setItem("JobCalendarBackup", JSON.stringify(data_items));
}

function saveCalendar() {
	if (calendar) {
		var data_items = saveCalendarToJSON();
		var filecontents = Papa.unparse(data_items, {delimiter:";"});
		var filename = "working_times.csv";
		savefile(filecontents, filename, 'text/plain;charset=utf-8');
	}
}

function exportCalendar() {
	if (calendar) {
		var groups = calendar.getResources();
		var items = calendar.getEvents();
		var data_items = [];
		for (var i = 0; i < items.length; i++) {
			var start_time = getISODate(items[i].start);
			var item = {
				date: start_time,
				affaire: items[i].title,
				activite: items[i].extendedProps.task,
				temps_passes: items[i].extendedProps.day_ratio,
				descr: items[i].extendedProps.description
			};
			data_items.push(item);
		}
		var filecontents = Papa.unparse(data_items, {delimiter:";"});
		var filename = "working_times_export.csv";
		savefile(filecontents, filename, 'text/plain;charset=utf-8');
	}
}

function savefile(data, filename, type) {
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
		var a = document.createElement("a"), url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);  
		}, 0);
	}
}



