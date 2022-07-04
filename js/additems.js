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
const additemform = document.getElementById('add_item_form');
const additembtn = document.getElementById("add_item_btn");
const removeitembtn = document.getElementById("remove_item_btn");
const addresourceform = document.getElementById('add_resource_form');
const addresourcebtn = document.getElementById("add_resource_btn");
const removeresourcebtn = document.getElementById("remove_resource_btn");
const dateinput = document.getElementById("date_input");
const startinput = document.getElementById("start_input");
const endinput = document.getElementById("end_input");
const projectinput = document.getElementById("project_input");
const newprojectinput = document.getElementById("new_project_input");
const taskinput = document.getElementById("task_input");
const descrinput = document.getElementById("descr_input");
const startrangeinput = document.getElementById("startrange_input");
const endrangeinput = document.getElementById("endrange_input");

//additemform.addEventListener("DOMContentLoaded", setDate);
additembtn.addEventListener("click", addItem);
removeitembtn.addEventListener("click", removeItem);
addresourcebtn.addEventListener("click", addResource);
removeresourcebtn.addEventListener("click", removeResource);

//-----------------------------------------------------------------------------------
// Add item
function addItem() {
	var date = dateinput.value;
	var start_time = date + "T" + startinput.value;
	var end_time = date + "T" + endinput.value;
	var project = projectinput.value;
	var task = taskinput.value;
	var descr = descrinput.value;
	var start_date = new Date(start_time);
	var end_date = new Date(end_time);
	var ratio = (end_date.getTime() - start_date.getTime()) / (8 * 3600 * 1000);
	// Get group
	var groups = calendar.getResources();
	var groupid = null;
	for (var i = 0; i < groups.length; i++) {
		if (groups[i].title == project) {
			groupid = groups[i].id;
		}
	}
	// Add group if new (not found in existing groups)
	if (!groupid) {
		groupid = setNewResourceId();
		var group = {
			id: groupid,
			title: project,
			color: '#cccccc',
			visible: true
		};
		calendar.addResource(group);
		groups = calendar.getResources();
		setGroupOptions(groups);
	}
	var group = calendar.getResourceById(groupid);
	var color = group.extendedProps.color;
	var color0 = hex2rgb(color, 0.5);
	// Add item
	if (selected_itemid) {
		// Modify existing item
		var item = calendar.getEventById(selected_itemid);
		item.setStart(start_time);
		item.setEnd(end_time);
		item.setResources([groupid]);
		item.setProp("title", project);
		item.setProp("backgroundColor", color0);
		item.setProp("borderColor", color);
		item.setExtendedProp("task", task);
		item.setExtendedProp("description", descr);
		item.setExtendedProp("day_ratio", ratio);
	} else {
		// Add item
		var itemid = setNewItemId();
		var item = {
			id: itemid,
			resourceId: groupid,
			textColor: "#000000",
			backgroundColor: color0,
			borderColor: color,
			start: start_time,
			end: end_time,
			title: project,
			task: task,
			description: descr,
			day_ratio: ratio
		};
		calendar.addEvent(item);
	}
	// Close form and reinit values
	reinitForm();
}

// Remove item
function removeItem() {
	if (selected_itemid) {
		var item = calendar.getEventById(selected_itemid);
		item.remove();
	}
	// Close form and reinit values
	reinitForm();
}

// Set new item ID
function setNewItemId() {
	var items = calendar.getEvents();
	if (items.length > 0) {
		var item_ids = [];
		for (var i = 0; i < items.length; i++) {
			item_ids.push(items[i].id);
		}
		var itemid = String(Math.max(...item_ids) + 1);
	} else {
		var itemid = 0;
	}
	return itemid
}

// Reinit values when closing form
function reinitForm() {
	// Item form
	additemform.style.display = "none";
	dateinput.value = "";
	startinput.value = "";
	endinput.value = "";
	projectinput.value = "";
	taskinput.value = "";
	descrinput.value = "";
	selected_itemid = null;
	// Group form
	addresourceform.style.display = "none";
	newprojectinput.value = "";
	selected_groupid = null;
}


//-----------------------------------------------------------------------------------
// Add resource
function addResource() {
	var project = newprojectinput.value;
	if (selected_groupid) {
		// Modify existing resource
		var group = calendar.getResourceById(selected_groupid);
		group.setProp("title", project);
		//group.setProp("eventColor", "blue");
		var group_items = group.getEvents();
		for (var i = 0; i < group_items.length; i++) {
			group_items[i].setProp("title", project);
		}
	} else {
		// Add resource
		var groupid = setNewResourceId();
		var group = {
			id: groupid,
			title: project,
			color: '#cccccc',
			visible: true
		};
		calendar.addResource(group);
	}
	groups = calendar.getResources();
	setGroupOptions(groups);
	// Close form and reinit values
	reinitForm();
}

// Remove resource
function removeResource() {
	if (selected_groupid) {
		var group = calendar.getResourceById(selected_groupid);
		group.remove();
	}
	groups = calendar.getResources();
	setGroupOptions(groups);
	// Close form and reinit values
	reinitForm();
}

// Set new resource ID
function setNewResourceId() {
	var groups = calendar.getResources();
	if (groups.length > 0) {
		var group_ids = [];
		for (var i = 0; i < groups.length; i++) {
			group_ids.push(groups[i].id);
		}
		var groupid = String(Math.max(...group_ids) + 1);
	} else {
		var groupid = 0;
	}
	return groupid
}



function setDate () {
	if (selected_date) {
		dateinput.value = selected_date;
	}
}



//-----------------------------------------------------------------------------------
// Fill table
function refreshTable(attr, table_id) {

	// get table container
	var resultstable = document.getElementById(table_id);

	// clear existing table
	clearTable(resultstable);

	// get time range: columns
	var range_start = startrangeinput.value;
	var range_end = endrangeinput.value;
	var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var col_names = [];
	if (range_start.includes("-")) {
		// sequence of months
		range_start = new Date(range_start);
		range_end = new Date(range_end);
		var num_cols = Math.ceil((range_end.getTime() - range_start.getTime() + 1) / (24*3600*1000*29));
		var start_year = range_start.getFullYear();
		var start_month = range_start.getMonth();
		var columns = [];
		for (var i = 0 ; i < num_cols ; i++) {
			var date = new Date(start_year, start_month + i, 1);
			columns.push(date);
			col_names.push(months[date.getMonth()] + " " + String(date.getFullYear()));
		}
		var date = new Date(start_year, start_month + num_cols, 1);
		var col_ranges = [...columns, date];
	} else {
		// sequence of years
		range_start = new Date(range_start);
		range_end = new Date(range_end);
		var num_cols = Math.ceil((range_end.getTime() - range_start.getTime()  + 1) / (24*3600*1000*365));
		var start_year = range_start.getFullYear();
		var columns = [];
		for (var i = 0 ; i < num_cols ; i++) {
			var date = new Date(start_year + i, 0, 1);
			columns.push(date);
			col_names.push(" " + String(date.getFullYear()));
		}
		var date = new Date(start_year + num_cols, 0, 1);
		var col_ranges = [...columns, date];
	}

	// get different attributes: rows
	var items = calendar.getEvents();
	var rows = [];
	// var item_rows = [];
	// var tabcontents = new Array(columns.length).fill([]);
	// for (var i = 0 ; i < items.length ; i++) {
	// 	if (items[i][attr]) {
	// 		var attr_val = items[i][attr];
	// 	} else {
	// 		var attr_val = items[i].extendedProps[attr];
	// 	}
	// 	if (!rows.includes(attr_val)) {
	// 		rows.push(attr_val);
	// 		item_rows.push([i]);
	// 	} else {
	// 		for (var j = 0 ; j < rows.length ; j++) {
	// 			if (rows[j] == attr_val) {
	// 				item_rows[j].push(i);
	// 			}
	// 		}
	// 	}
	// }

	// get the table contents
	var tabcontents = []
	for (var j = 0 ; j < columns.length ; j++) {
		tabcontents[col_names[j]] = [];
	}
	if (attr == "vacation") { // special processing for vacation table
		var vacation_names = ["CA", "RTT"];
		if (col_names[0][0] == " ") { // sequence of years
			var vacations_days = [25, 12];
		} else { // sequence of months
			var vacations_days = [25/12, 1];
		}
		// available vacation
		for (var i = 0 ; i < vacation_names.length ; i++) {
			var name_available = vacation_names[i] + " acquis";
			var name_taken = vacation_names[i] + " pris";
			var name_remaining = vacation_names[i] + " solde";
			var val = vacations_days[i];
			for (var j = 0 ; j < columns.length ; j++) {
				tabcontents[col_names[j]][name_available] = val;
				tabcontents[col_names[j]][name_taken] = 0;
				tabcontents[col_names[j]][name_remaining] = val;
				val = val + vacations_days[i];
			}
			rows.push(name_available);
			rows.push(name_taken);
			rows.push(name_remaining);
		}
		// vacation taken
		for (var i = 0 ; i < items.length ; i++) {
			var start_time = items[i].start;
			var end_time = items[i].end;
			var task = items[i].extendedProps.task;
			for (var k = 0 ; k < vacation_names.length ; k++) {
				if (vacation_names[k] == task) {
					var name_taken = vacation_names[k] + " pris";
					for (var j = 0 ; j < columns.length ; j++) {
						if (col_ranges[j] <= start_time & end_time <= col_ranges[j+1]) {
							tabcontents[col_names[j]][name_taken] = tabcontents[col_names[j]][name_taken] + Number(items[i].extendedProps.day_ratio);
						}
					}
				}
			}
		}
		// remaining vacation
		for (var i = 0 ; i < vacation_names.length ; i++) {
			var name_taken = vacation_names[i] + " pris";
			var name_remaining = vacation_names[i] + " solde";
			var val = 0;
			for (var j = 0 ; j < columns.length ; j++) {
				val = val + tabcontents[col_names[j]][name_taken];
				tabcontents[col_names[j]][name_remaining] = tabcontents[col_names[j]][name_remaining] - val;
			}
		}
	} else { // other tables
		for (var i = 0 ; i < items.length ; i++) {
			var start_time = items[i].start;
			var end_time = items[i].end;
			if (items[i][attr]) {
				var attr_val = items[i][attr];
			} else {
				var attr_val = items[i].extendedProps[attr];
			}
			for (var j = 0 ; j < columns.length ; j++) {
				if (col_ranges[j] <= start_time & end_time <= col_ranges[j+1]) {
					if (Object.keys(tabcontents[col_names[j]]).includes(attr_val)) {
						tabcontents[col_names[j]][attr_val] = tabcontents[col_names[j]][attr_val] + Number(items[i].extendedProps.day_ratio);
					} else {
						tabcontents[col_names[j]][attr_val] = Number(items[i].extendedProps.day_ratio);
					}
					if (!rows.includes(attr_val)) {
						rows.push(attr_val);
					}
				}
			}
		}
		// add total of each column
		attr_tot = "TOTAL";
		rows.push(attr_tot);
		for (var j = 0 ; j < columns.length ; j++) {
			var attrs = Object.keys(tabcontents[col_names[j]]);
			var val_tot = 0;
			for (var i = 0 ; i < attrs.length ; i++) {
				val_tot = val_tot + tabcontents[col_names[j]][attrs[i]];
			}
			tabcontents[col_names[j]][attr_tot] = val_tot;
		}
	}

	// fill table header
	var tabrow = document.createElement("tr");
	var tabitem = document.createElement("th");
	tabitem.innerHTML = "Intitulés";
	tabrow.appendChild(tabitem);
	for (var i = 0 ; i < columns.length ; i++) {
		var tabitem = document.createElement("th");
		tabitem.innerHTML = col_names[i];
		tabrow.appendChild(tabitem);
	}
	resultstable.appendChild(tabrow);
	// fill table content
	for (var i = 0 ; i < rows.length ; i++) {
		var tabrow = document.createElement("tr");
		var tabitem = document.createElement("td");
		tabitem.innerHTML = rows[i];
		tabrow.appendChild(tabitem);
		for (var j = 0 ; j < columns.length ; j++) {
			var tabitem = document.createElement("td");
			if (tabcontents[col_names[j]][rows[i]]) {
				var cellcontent = tabcontents[col_names[j]][rows[i]].toFixed(1);
			} else {
				var cellcontent = "-";
			}
			tabitem.innerHTML = cellcontent;
			//tabitem.setAttribute("contenteditable", "");
			tabrow.appendChild(tabitem);
		}
		resultstable.appendChild(tabrow);
	}
}



// Clear the table
function clearTable(resultstable) {
	var numrows = resultstable.rows.length;
	for (i = 0; i < numrows; i++) {
		resultstable.deleteRow(0);
	}
}



// Fill all tables
function refreshTables() {
	refreshTable("vacation", "table_vacations");
	refreshTable("title", "table_projects");
	refreshTable("task", "table_tasks");
}
