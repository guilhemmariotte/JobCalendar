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
const selectedprojectinput = document.getElementById("selectedproject_input");
const taskinput = document.getElementById("task_input");
const descrinput = document.getElementById("descr_input");

// List of group inputs (to show hover dropdown list)
const projectinput_list = [projectinput, selectedprojectinput];

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
		//calendar.setOption("filterResourcesWithEvents", true);
	}
	return groupid
}



function setDate () {
	if (selected_date) {
		dateinput.value = selected_date;
	}
}

