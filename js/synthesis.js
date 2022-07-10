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
const startrangeinput = document.getElementById("startrange_input");
const endrangeinput = document.getElementById("endrange_input");


//-----------------------------------------------------------------------------------
// Fill table
function refreshResults(attr, addtotal) {

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
	var row_colors = [];
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
			rows.push(...[name_available, name_taken, name_remaining]);
			row_colors.push(...["#cccccc", "#cccccc", "#cccccc"]);
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
		if (attr == "title") {
			groups = calendar.getResources();
			for (var i = 0; i < groups.length; i++) {
				rows.push(groups[i].title);
				row_colors.push(groups[i].extendedProps.color);
			}
		}
		for (var i = 0 ; i < items.length ; i++) {
			var start_time = items[i].start;
			var end_time = items[i].end;
			var attr_color = items[i].borderColor;
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
						row_colors.push(attr_color);
					}
				}
			}
		}
		// add total of each column
		if (addtotal) {
			attr_tot = "TOTAL";
			rows.push(attr_tot);
			row_colors.push("#000000");
			for (var j = 0 ; j < columns.length ; j++) {
				var attrs = Object.keys(tabcontents[col_names[j]]);
				var val_tot = 0;
				for (var i = 0 ; i < attrs.length ; i++) {
					val_tot = val_tot + tabcontents[col_names[j]][attrs[i]];
				}
				tabcontents[col_names[j]][attr_tot] = val_tot;
			}
		}
	}
	return [tabcontents, col_names, rows, row_colors]
}


// Fill the table
function refreshTable(attr, table_id) {

	// get results
	var [tabcontents, col_names, rows, row_colors] = refreshResults(attr, true);

	// get table container
	var resultstable = document.getElementById(table_id);

	// clear existing table
	clearTable(resultstable);

	// fill table header
	var tabrow = document.createElement("tr");
	var tabitem = document.createElement("th");
	tabitem.innerHTML = "Intitulés";
	tabrow.appendChild(tabitem);
	for (var i = 0 ; i < col_names.length ; i++) {
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
		for (var j = 0 ; j < col_names.length ; j++) {
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


// Plot the graph (stacked multiline or bar plot)
function refreshLine(attr, chart_id, plot_type) {
	// plot_type = "line" or "bar"

	// get results
	var [tabcontents, col_names, rows, row_colors] = refreshResults(attr, false);

	// clear existing chart
	clearChart(chart_id);

	// transform to datasets
	var datasets = [];
	for (var i = 0 ; i < rows.length ; i++) {
		var data = [];
		for (var j = 0 ; j < col_names.length ; j++) {
			if (tabcontents[col_names[j]][rows[i]]) {
				var cellcontent = tabcontents[col_names[j]][rows[i]];
			} else {
				var cellcontent = 0;
			}
			data.push(cellcontent);
		}
		if (i == 0) {
			var fill_mode = "origin";
		} else {
			var fill_mode = "-1";
		}
		//var fill_mode = true;
		var dataset = {
			label: rows[i],
			data: data,
			backgroundColor: hex2rgb(row_colors[i], 0.5),
			borderColor: row_colors[i],
			fill: fill_mode,
			tension: 0.2
		};
		datasets.push(dataset);
	}

	// plot chart
	var curr_chart = new Chart(chart_id, {
		type: plot_type,
		data: {
			labels: col_names,
			datasets: datasets
		},
		options: {
			legend: {display: true},
			plugins: {
				tooltip: {
					mode: 'index'
				},
			},
			interaction: {
				mode: 'index',
				axis: 'x',
				intersect: true
			},
			scales: {
				x: {stacked: true},
				y: {
					stacked: true,
					title: {
						display: true,
						text: "Nombre de jours"
					}
				}
			},
		}
	});
}


// Plot the graph (bar plot)
function refreshBar(attr, chart_id) {

	// get results
	var [tabcontents, col_names, rows, row_colors] = refreshResults(attr, false);

	// clear existing chart
	clearChart(chart_id);

	// transform to datasets
	var data = [];
	var data_color = [];
	var data_color0 = [];
	for (var i = 0 ; i < rows.length ; i++) {
		var val = 0;
		for (var j = 0 ; j < col_names.length ; j++) {
			if (tabcontents[col_names[j]][rows[i]]) {
				var cellcontent = tabcontents[col_names[j]][rows[i]];
			} else {
				var cellcontent = 0;
			}
			val = val + cellcontent;
		}
		data.push(val);
		data_color.push(row_colors[i]);
		data_color0.push(hex2rgb(row_colors[i], 0.5));
	}
	var datasets = [{
		data: data,
		backgroundColor: data_color0,
		borderColor: data_color,
	}];
	// plot chart
	var curr_chart = new Chart(chart_id, {
		type: "bar",
		data: {
			labels: rows,
			datasets: datasets
		},
		options: {
			legend: {display: false},
			plugins: {
				tooltip: {
					mode: 'index'
				},
			},
			interaction: {
				mode: 'index',
				axis: 'x',
				intersect: true
			},
			scales: {
				y: {
					title: {
						display: true,
						text: "Nombre de jours"
					}
				}
			},
		}
	});
}


// Clear the chart
function clearChart(chart_id) {
	var chart_el = document.getElementById(chart_id);
	var existing_chart = Chart.getChart(chart_el);
	if (existing_chart) {
		existing_chart.destroy();
	}
}


// Fill all tables and graphics
function refreshAll() {
	refreshTable("vacation", "table_vacations");
	//refreshTable("title", "table_projects");
	//refreshTable("task", "table_tasks");

	refreshLine("title", "line_projects", "line");
	refreshBar("title", "bar_projects");
	refreshLine("task", "line_tasks", "bar");
	refreshBar("task", "bar_tasks")
}