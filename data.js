const xhr = new XMLHttpRequest();
var csv = null;
var data = null;
var country;
var state;
var countriesInGraph = [];
var JSONString;
var addButton;
var removeButton;
var state = "Confirmed";
var heatmapvar = {
	max: 10000,
	data: [{lat:0.00,long:0.00,count:0}]
};
var ctx = new Chart(document.getElementById("line"), { // Chart.Js chart
	type: 'line',
	data: {},
	options: {
		maintainAspectRatio: false,
		title: {
			display: true,
			text: 'Confirmed Coronavirus Cases'
		},
		scales: {
			xAxes: [{
				display: true,
			}],
			yAxes: [{
				display: true,
				type: 'logarithmic'
				}]
			}
		
	}
});
var cfg = {
	  // radius should be small ONLY if scaleRadius is true (or small radius is intended)
  // if scaleRadius is false it will be the constant radius used in pixels
  "radius": 5,
  "maxOpacity": .8,
  // scales the radius based on map zoom
  "scaleRadius": true,
  // if set to false the heatmap uses the global maximum for colorization
  // if activated: uses the data maximum within the current map boundaries
  //   (there will always be a red spot with useLocalExtremas true)
  "useLocalExtrema": false,
  // which field name in your data represents the latitude - default "lat"
	latField: 'lat',
	// which field name in your data represents the longitude - default "lng"
	lngField: 'long',
	// which field name in your data represents the data value - default "value"
	valueField: 'count'
};




var mymap = L.map('leaflet').setView([0, 0], 1);
var baseLayer = L.tileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
		attribution: 'Timeline of Covid-19 Cases',
		maxZoom: 18,
		minZoom:2
	}
).addTo(mymap);
var heatmapLayer = new HeatmapOverlay(cfg);




xhr.addEventListener("readystatechange", function() { //XMLHttpRequest to fetch csv from github
	if (this.readyState === this.DONE) {
		csv = this.responseText;
		callPapa();
	}
});

function callPapa(){
	Papa.parse(csv, {
		delimiter: ",",
		 header: "true",
		 complete: function(results) {
			 data = results.data;
			 calculateActiveDays(data);
			 ctx.data.labels = [];
			 ctx.clear();
			 var days = count(data[0]);
			 var keys = Object.keys(data[0])
			 for (var j = 0; j < days; j = j + 1) {
				 if (regex.test(keys[j])) {
					 ctx.data.labels.push(keys[j]);
					 ctx.update();
				 }
			 }
		 }
	});
}
xhr.open("GET", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv");
xhr.send();
const regex = /^((0|1)?\d{1})\/((0|1|2|3)?\d{1})\/(\d{2})/;
function getSelector(){
	document.getElementById("formTable").innerHTML = "<h3><center>Loading...</center></h3>"
	var selected = document.getElementById("selector");
	var selectedValue = selected.options[selected.selectedIndex].value;
	countriesInGraph = [];
	ctx.data.datasets = [];
	ctx.update();
	/*var input = document.getElementById("datalistInput")
	input.remove();
	document.getElementById("countryList").remove();
	document.getElementById("infoTable").remove();
	addButton.remove();
	removeButton.remove(); */
	switch(selectedValue){
		case "switchConfirmed":
			state = "Confirmed";
			ctx.options.title.text = "Confirmed Covid-19 Cases";
			baseLayer.options.attribution = "Timeline of Covid-19 Cases";
			xhr.open("GET", "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv");
			xhr.send();
			break;
		case "switchDeaths":
			state = "Died";
			ctx.options.title.text = "Covid-19 Deaths";
			baseLayer.options.attribution = "Timeline of Covid-19 Deaths";
			xhr.open("GET","https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv");
			xhr.send();
			break;
		case "switchRecovered":
			state = "Recovered";
			ctx.options.title.text = "Confirmed Covid-19 Recoveries";
			baseLayer.options.attribution = "Timeline of Covid-19 Recoveries";
			xhr.open("GET","https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv");
			xhr.send();
			break;
	}
	
}



function calculateActiveDays(json) { // Create Buttons and select form
	document.getElementById("formTable").innerHTML = '<div id="form">Select country:</div><div id="table"></div>'
	var body = document.getElementById("formTable");
	var input = document.createElement('input');
	input.id = "datalistInput";
	document.getElementById("form").appendChild(input);
	var datalist = document.createElement('datalist');
	datalist.setAttribute("width","38.5%")
	input.setAttribute("placeholder", "Search Here");
	var listId='countryList';
	datalist.id = listId;
	JSONString = '{"ActiveDays":[';

	for (i in json) { //for every row
		if (json[i]["Country/Region"] !== undefined) 				//if it's not a new row that hasn't beed added yet
		{
		var country = json[i]["Country/Region"]; 					//get the country
		var state = json[i]["Province/State"] 						//get the state
		var ActiveDays = 0; 										//set active days to 0
		var startDay = "1/22/20"; 									//in case start date was before 1/22
		var element = document.createElement("option"); 
		element.setAttribute("id", country.replace(/ /g, '_') + "__" + state.replace(/ /g, '_')); //id of select equals country__state
		if (state == "")											//
		{															//
			element.innerHTML = country;							//
			element.setAttribute("name", country);					//
		}															//
																	//  element.name = 1) country if theres no state or 2) country-state if there is
		else 														//
		{															//
			element.innerHTML = country + "-" + state;				//
			element.setAttribute("name", country + "-" + state);	//
		}															//
		datalist.appendChild(element);
		days = count(json[i]); 										//count of all the elements on a given country in json array
		var keys = Object.keys(json[i]); 							//fetch the keys
		for (var j = 0; j < days; j = j + 1) { 						//for every element
			if (regex.test(keys[j]) && json[i][keys[j]] != 0) { 	//if its in date format (so if its a days) AND if at least 1 case
				if (FirstDayCheck(json[i], [keys[j - 1]]) == true)
				startDay = keys[j]; 								//if its the first day set the start date
				ActiveDays++; 										//in any case, set activedays++
			}
			if (ActiveDays == 0) startDay = "";						//if every day is 0, set start day to ""
		}
		JSONString += '{"State":"' + state + '","Country":"' + country + '","ActiveDays":"' + ActiveDays + '","startDay":"' + startDay + '"},'
		//Make the JSON with {"State":"STATENAME", "Country":"COUNTRYNAME", "ActiveDays":"NUMBER", "StartDay":"DATE"}
	}
	}
	document.getElementById("form").appendChild(datalist)
	input.setAttribute('list', listId)
	JSONString = JSONString.slice(0, -1);							//
	JSONString += "]}";									//  Clear the last comma and parse JSON 
	JSONString = JSON.parse(JSONString);							//
	document.getElementById("form").appendChild(datalist);
	input.setAttribute("list", "countryList");
	addButton = document.createElement('button')
	addButton.innerHTML = "Add Country/Province";
	addButton.addEventListener('click', function(){
		getData(input.value, "add");
	})
	removeButton = document.createElement('button')
	removeButton.innerHTML = "Remove Country/Province";
	removeButton.addEventListener('click', function(){
		getData(input.value, "remove");
	})
	body.appendChild(addButton);
	body.appendChild(removeButton);
	var infoTable = document.createElement("table");
	infoTable.id = "infoTable";
	body.appendChild(infoTable);
	headerName = document.createElement("th");
	headerName.innerHTML = "Name of Country/Province";
	headerStartDate = document.createElement("th");
	headerStartDate.innerHTML = "First Confirmed Date"
	headerConf = document.createElement("th");
	headerConf.innerHTML = "Days Active"
	infoTable.appendChild(headerName);
	infoTable.appendChild(headerStartDate);
	infoTable.appendChild(headerConf)
}


function count(obj) {
	return Object.keys(obj).length;
}

function FirstDayCheck(table, j) {
	if (table[j[0]] == 0) {
		return true;
	} else {
		return false;
	}
}

function getData(name, action) {  //Get text from the select field and decide on delete or add
	var selectedElement = document.getElementsByName(name)[0];
	if (action == "add"){
	addData(selectedElement);
	}
	else {
	removeData(selectedElement);
	}
}
function addData(selectedElement) 
{
	var amount = [];
	if (countriesInGraph.indexOf(selectedElement.id) == -1)				//if the item isnt already added
	{
		var label = "Error"
		var dates = [];
		let id = selectedElement.getAttribute("id");
		countriesInGraph.push(id);
		id = id.split('__'); 											//split the id
		for (var i = 0; i < id.length; i++) 							
		{
			id[i] = id[i].replace(/_/g, ' ');}							//convert it to json-compatible format	
			for (var i = 0, numData = data.length; i<numData; i++)
			{
				days = count(data[i]);									//get the number of fields on the array
				var keys = Object.keys(data[i]);						//get the keys
				for (var j = 0; j < days; j = j + 1) 					//for every key
				{
					if(data[i]["Country/Region"] == id[0] && data[i]["Province/State"] == id[1]) //if its the country/state we selected
					{
						if (regex.test(keys[j])) 						//and if it's a date
						{
							amount.push(data[i][keys[j]]);				//push the amount of people into an array
						}
					}
				}
			}
		if (id[1] == "") label = id[0].replace(/_/g, ' ');				//make the appropriate label for Chart.js
		else label = id[0] + "-" + id[1];
		var color = randomColorGenerator();								//pick a random color for the line
		var chart = ctx;
		chart.data.datasets.push({										//push everything to a new dataset
		label: label,
		backgroundColor: color,
		borderColor: color,
		data: amount,
		fill: false
		});
		chart.update();														//update the chart
		nameLabel = label.split('-');
		
		var tr = document.createElement("tr");								//get country to the table below
		tr.setAttribute("id", label + "_label")
		document.getElementById("infoTable").appendChild(tr);
		var name = document.createElement("td")
		name.innerHTML = label;
		tr.appendChild(name);
		for (var i = 0, numData = JSONString["ActiveDays"].length; i<numData; i++) //for every country of "ActiveDays"
		{	
			if (nameLabel[1] == undefined) nameLabel[1] = new String();
			if (nameLabel[0] == JSONString["ActiveDays"][i]["Country"] && nameLabel[1] == JSONString["ActiveDays"][i]["State"]) {
				var firstday = document.createElement("td");
				firstday.innerHTML = JSONString["ActiveDays"][i]["startDay"];
				tr.appendChild(firstday);
				var days = document.createElement("td");
				days.innerHTML = JSONString["ActiveDays"][i]["ActiveDays"];
				tr.appendChild(days);
				
			}
		}
	}
}
function removeData(label){
	if (countriesInGraph.indexOf(label.id) != -1){
	var found = false;
	var index = 0;
	var labelToRemove = document.getElementById(label.getAttribute("name") + "_label");
	labelToRemove.remove();
	countriesInGraph = countriesInGraph.filter(e => e !== label.id);
	ctx.data.datasets.forEach((dataset) => {
	if (dataset.label !== label.getAttribute("name")){
		if (found == false) {
			index++;
		}
	}
	else found = true;
	})
	ctx.data.datasets.splice(index, 1);
	ctx.update();
	}
	
}
randomColorGenerator = function () { 
	return '#' + (Math.random().toString(16) + '0000000').slice(2, 8); 
}

var spanOfDays = function() {
	var date1 = new Date();
	var date2 = new Date ("1/22/2020");
	var difference = date1.getTime() - date2.getTime();
	var dateDifference = Math.floor(difference/ (1000*3600*24))
	return dateDifference;
}
function createSlider(){
	var slider = document.createElement("input");
	slider.setAttribute("type", "range");
	slider.setAttribute("min", 0)
	slider.setAttribute("max", spanOfDays()-1)
	slider.setAttribute("class", "slider")
	slider.setAttribute("style", "width=100%");
	slider.setAttribute("id", "mySlider")
	document.getElementById("slide").appendChild(slider)
	slider.oninput = function(){
		var goDate = new Date("1/22/2020")
		goDate.setDate(goDate.getDate() + parseInt(this.value));
		var string = getFormattedDate(goDate).toString();
		var heatmapJson = "["
		for (i in data)
		{
			if (data[i]["Lat"] != undefined && data[i]["Long"] != undefined && data[i][string] != undefined)
			heatmapJson += '{"lat":' + data[i]["Lat"] + ',"long":' + data[i]["Long"] + ',"count":' + data[i][string] + '},'
			
		}
		heatmapJson = heatmapJson.slice(0, -1);
		heatmapJson += "]";
		heatmapvar = {
			max: 10000,
			data: (JSON.parse(heatmapJson))
		};
		createHeatmap(heatmapvar, string);

		
	}
}
createSlider();
function getFormattedDate(date) {
	var year = date.getFullYear().toString().substr(-2);
	
	var month = (date.getMonth()+1).toString();
	
	var day = date.getDate().toString();
	
	return month + '/' + day + '/' + year;
}
function createHeatmap(heatoptions, dateShown){
	heatmapLayer.setData(heatoptions);
	console.log(heatoptions);
	heatmapLayer.addTo(mymap);
	document.getElementById("date").innerHTML ="<center>" + state + " at: " + dateShown + "</center>";
}
function setTheme(themeName) {
	localStorage.setItem('theme', themeName);
	document.documentElement.className = themeName;
}

// function to toggle between light and dark theme
function toggleTheme() {
	if (localStorage.getItem('theme') === 'theme-dark') {
		setTheme('theme-light');
	} else {
		setTheme('theme-dark');
	}
}

// Immediately invoked function to set the theme on initial load
(function () {
	if (localStorage.getItem('theme') === 'theme-dark') {
		setTheme('theme-dark');
	} else {
		setTheme('theme-light');
	}
})();