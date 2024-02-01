// JobCalendar
//
// JavaScript application to record, classify and visualize jobs and tasks
// Based on fullcalendar.io JS library
//
// Author: Guilhem Mariotte
// Date: June 2022
// 
//-----------------------------------------------------------------------------------

const searchtable = document.getElementById("search_div");


//-----------------------------------------------------------------------------------
// Init and update table

function initDataTable() {
	// Clear container
	while (searchtable.hasChildNodes()) {
		searchtable.removeChild(searchtable.lastChild);
	}

	datatable = new gridjs.Grid({
		colums: [],
		pagination: {limit: 50},
		search: true,
		sort: true,
		resizable: true,
		height: "500px",
		fixedHeader: true,
		language: {
			'search': {
				'placeholder': 'Rechercher...'
			},
			'pagination': {
				'previous': 'Précédent',
				'next': 'Suivant',
				'showing': 'Affichage',
				'to': 'à',
				'of': 'sur',
				'results': () => 'résultats'
			}
		},
		// style: {
		// 	td: {
		// 		'padding': '8px',
		// 	}
		// },
		data: []
	});
	datatable.render(searchtable);

	// datatable.on("rowClick", (...args) => {
	// 	const certificateid = args[1].cells[1].data;
	// 	editItem(certificateid);
	// });
}


function updateDataTable() {
	if (calendar) {
		var items = calendar.getEvents();
		items.sort((x,y) => x.start - y.start); // sort items in ascending start date order
		var data_items = [];
		for (var i = 0; i < items.length; i++) {
			var item = {
				start_time: getISOTime(items[i].start),
				end_time: getISOTime(items[i].end),
				color: items[i].backgroundColor,
				date: getISODate(items[i].start),
				project: items[i].title,
				task: items[i].extendedProps.task,
				descr: items[i].extendedProps.description,
				day_ratio: items[i].extendedProps.day_ratio
			};
			data_items.push(item);
		}

		const columns = [
			{id: "start_time", name: "Début", hidden: true},
			{id: "end_time", name: "Fin", hidden: true},
			{id: "color", name: "Tag", hidden: true},
			{id: "date", name: "Date", width: "10%"},
			{id: "project", name: "Affaire", width: "20%", formatter: (cell, row) => gridjs.html(`<p style="padding: 2px; background-color: ${row.cells[2].data}">${cell}</p>`)},
			{id: "task", name: "Tâche", width: "10%"},
			{id: "day_ratio", name: "Temps", width: "10%"},
			{id: "descr", name: "Description"},
		];

		new Promise(resolve => {
			datatable.config.plugin.remove("pagination"); // to avoid throwing errors in the console logs
			datatable.config.plugin.remove("search");
			resolve();
		}).then(() => {
			datatable.updateConfig({
				pagination: {limit: 50},
				search: true,
				columns: columns,
				data: data_items
			});
			datatable.forceRender(searchtable);
		});
	}
}
