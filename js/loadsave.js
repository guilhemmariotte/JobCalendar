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

input.addEventListener('change', loadTimeline);

// Load default
const load_default = document.getElementById("load_default");

load_default.addEventListener('click', loadTimeline);


// On page load
//document.addEventListener("DOMContentLoaded", updateTimeline);


// Save file
const save = document.getElementById("save");

save.addEventListener('click', saveTimeline);


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
	loadTimeline();
}

timelinediv.addEventListener("dragenter", dragenter, false);
timelinediv.addEventListener("dragover", dragover, false);
timelinediv.addEventListener("drop", drop, false);



//-----------------------------------------------------------------------------------
// Download data
function saveTimeline() {
	if (calendar) {
		var groups = calendar.getResources();
		var items = calendar.getEvents();
		var data_items = [];
		console.log(groups)
		for (var i = 0; i < groups.length; i++) {
			var item = {
				start_time: "group",
				end_time: "",
				project: groups[i].title,
				task: groups[i].extendedProps.color,
				descr: "",
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
		var filecontents = Papa.unparse(data_items, {delimiter:";"});
		var filename = "working_times.csv";
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



