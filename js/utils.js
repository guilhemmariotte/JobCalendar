// JobCalendar
//
// JavaScript application to record, classify and visualize jobs and tasks
// Based on fullcalendar.io JS library
//
// Author: Guilhem Mariotte
// Date: June 2022
// 
//-----------------------------------------------------------------------------------



// Get ISO date and time
function getISODate(date) {
	var iso_date = "";
	if (date) {
		if (Object.prototype.toString.call(date) == "[object Date]") {
			var iso_date = date.getFullYear() + "-" + addLeadingZeros(date.getMonth() + 1) + "-" + addLeadingZeros(date.getDate());
		}
	}
	return iso_date
}

function getISOTime(date) {
	var iso_time = "";
	if (date) {
		if (Object.prototype.toString.call(date) == "[object Date]") {
			var iso_time = addLeadingZeros(date.getHours()) + ":" + addLeadingZeros(date.getMinutes()) + ":" + addLeadingZeros(date.getSeconds());
		}
	}
	return iso_time
}

// Add leading zeros
function addLeadingZeros(n) {
	if (n <= 9) {
	  	return "0" + n;
	}
	return n
}

// Transform an incomplete date to ISO date format yyyy-mm-dd
function toISODate(date, format) {
	if (typeof format == "undefined") {
		format = "yyyy-mm-dd";
	}
	var date_res = "0001-01-01";
	if (typeof date === "string" || date instanceof String) {
		var date_arr = date.split("-");
		var format_arr = format.split("-");
		date_res = "";
		for (var i = 0; i < format_arr.length; i++) {
			var width = Number(format_arr[i].length);
			var num = "1";
			if (i < date_arr.length) {
				num = date_arr[i];
			}
			num = ("00000000" + num).slice(-width);
			date_res = date_res + num + "-";
		}
		date_res = date_res.slice(0,-1); // remove last "-"
		//date_res = new Date(date_res).toISOString().split("T")[0];
	}
	return date_res;
}

// Get the year number of a date yyyy-mm-dd
function getYear(date) {
	if (typeof date === "string" || date instanceof String) {
		var date_arr = date.split("-");
		return Number(date_arr[0]);
	} else {
		return 0;
	}
}

// Break lines for a long string containing words (blank spaces)
function breaklines(input_string, max_width, linebreak_marker) {
	if (typeof max_width == "undefined") {
		max_width = 30;
	}
	if (typeof linebreak_marker == "undefined") {
		linebreak_marker = "</br>";
	}
	var words = input_string.split(" ");
	var output_string = words[0];
	var current_width = words[0].length;
	for (var i = 1; i < words.length; i++) {
		if (current_width <= max_width) {
			output_string = output_string + " " + words[i];
			current_width = current_width + 1 + words[i].length;
		} else {
			output_string = output_string + linebreak_marker + words[i];
			current_width = words[i].length;
		}
	}
	return output_string;
}

// String trim
function trim(input_string) {
	input_string = input_string.replace(/^\s+/g, ""); // left trim
	input_string = input_string.replace(/\s+$/g, ""); // right trim
	return input_string;
}

// String to array
function string2array(input_string) {
	var elems = input_string.split(",");
	var elems2 = [];
	for (var i = 0; i < elems.length; i++) {
		elems2.push(trim(elems[i]));
	}
	return elems2;
}

// Convert an HEX color to an RGBA color
function hex2rgb(color, alpha) {
	color = color.split("#")[1]
	var aRgbHex = color.match(/.{1,2}/g);
	var aRgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];
	var color0 = "rgba(" + [aRgb[0], aRgb[1], aRgb[2], alpha].join(",") +")";
	return color0;
}

// Build a sequential colormap
function buildColormap(num_colors, color_init) {
	var color_map = [];
	var num_cycles = Math.ceil(num_colors / 3);
	// get initial color info (max channel and value)
	color_init = color_init.split("#")[1]
	var aRgbHex = color_init.match(/.{1,2}/g);
	var aRgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];
	var channel_val = 0;
	var init_channel = 0;
	for (var i = 0; i < aRgb.length; i++) {
		if (aRgb[i] > channel_val) {
			channel_val = aRgb[i];
			init_channel = i;
		}
	}
	// get channel sequence from the initial color
	if (init_channel == 0) {
		var channel_seq = [0, 1, 2, 0];
	} else if (init_channel == 1) {
		var channel_seq = [1, 2, 0, 1];
	} else {
		var channel_seq = [2, 0, 1, 2];
	}
	// build colormap
	for (var i = 0; i < num_cycles; i++) {
		if (i <= num_cycles / 2) {
			var chan1 = 1;
			var chan2 = 2 * i / num_cycles;
		} else {
			var chan1 = 2 * (i - num_cycles/2) / num_cycles;
			var chan2 = 1;
		}
		for (var j = 0; j < 3; j++) {
			var color = new Array(3).fill(0);
			color[channel_seq[j]] = chan1;
			color[channel_seq[j+1]] = chan2;
			for (var k = 0; k < 3; k++) {
				if (color[k] == 0) {
					color[k] = String(Math.floor(channel_val / num_cycles));
				} else {
					color[k] = String(Math.floor(color[k] * channel_val));
				}
			}
			//color = "rgb(" + color.join(",") +")";
			color = "#" + ((1 << 24) + (Number(color[0]) << 16) + (Number(color[1]) << 8) + Number(color[2])).toString(16).slice(1);
			color_map.push(color);
		}
	}
	return color_map
}
