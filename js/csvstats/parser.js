//This is used to collect the csv and parse . 
//Functions for the actual processing will not be included in this file.


//this javascript file requires predefined global variables. These are located in the HTML file.


////////////////////////////////////////////
// FILES HAVE TO BE PROCESSED 1 AT A TIME //
///////////////////////////////////////////
function parserQue(items){

  
  if (items.files.length > fileProcessCount) {
		var file = items.files.item(fileProcessCount).name;
		var file = file.replace(".csv", "")  	
		parserStats(items.files.item(fileProcessCount),file)
  } else {

  	printMatrix()
  	//console.log(eventData)
	  	//This is used to calculate the P200.
	  	 
	  	for (var i = 0; i < eventData.length; i++) {

	  		//P200
			var tempP200 = 0
			for (var j = 0; j < P200.length; j++) {
				if (tempP200 < eventData[i]["shift1"][P200[j]]) {
					tempP200 = eventData[i]["shift1"][P200[j]]
				};
			};
			eventData[i]['shiftHist'][4][0]=tempP200
			var tempP200 = 0
			for (var j = 0; j < P200.length; j++) {
				if (tempP200 < eventData[i]["shift2"][P200[j]]) {
					tempP200 = eventData[i]["shift2"][P200[j]]
				};
			};
			eventData[i]['shiftHist'][4][1]=tempP200
			var tempP200 = 0
			for (var j = 0; j < P200.length; j++) {
				if (tempP200 < eventData[i]["shift3"][P200[j]]) {
					tempP200 = eventData[i]["shift3"][P200[j]]
				};
			};

			eventData[i]['shiftHist'][4][2]=tempP200

			//T300
			var tempT300 = 0
			for (var j = 0; j < T300.length; j++) {
				if (tempT300 < eventData[i]["shift1"][T300[j]]) {
					tempT300 = eventData[i]["shift1"][T300[j]]
				};
			};
			eventData[i]['shiftHist'][5][0]=tempT300
			var tempT300 = 0
			for (var j = 0; j < T300.length; j++) {
				if (tempT300 < eventData[i]["shift2"][T300[j]]) {
					tempT300 = eventData[i]["shift2"][T300[j]]
				};
			};
			eventData[i]['shiftHist'][5][1]=tempT300
			var tempT300 = 0
			for (var j = 0; j < T300.length; j++) {
				if (tempT300 < eventData[i]["shift3"][T300[j]]) {
					tempT300 = eventData[i]["shift3"][T300[j]]
				};
			};

			eventData[i]['shiftHist'][5][2]=tempT300


	  	};
		//console.log(tempP200)


 
console.log(eventData)
  	//console.log(shiftHist)
  	//highchartsLoad();
    console.log('Complete')
	//write to the temp.json file
	writeJSON()
  };
}

///////////////////////////////
// PARSE FUNCTION FOR STATS //
/////////////////////////////
function parserStats(item,file){


//this creates the shift categories for the shift data division.
//THere is some kind of ordernig issue with this 
//there is a single data point missed on the calculations. There may be 2 , this has been ignored.
	shiftCat =[]
		for (var i = 0; i < shifts.length; i++) {

		for (var key in shifts[i]) {
			//Modify the naming convention of the CSV to suit the moment.js input.
			//there is probably a better way of doing this.
			var shift = file.slice(0,4)
						+ "-"
						+ file.slice(4,6)
						+ "-"
						+ file.slice(6,8)
						+ " " + shifts[i][key]
			shiftCat.push(moment(shift))
		}
	};

//console.log(shiftCat)

console.log("Start Processing :",file)  
 

Papa.parse(item, {
	  //worker: true,
	  download:true,
	  header: true,
	  dynamicTyping: true,
	  //preview: 1,
	  fastMode: true,
	step: function(row) {

	///////////////////////////////
	//       CHECK SHIFT        //
	/////////////////////////////

	//here is the date to UTC parse , used to change the Date format
	time = moment(Date.parse(row.data[0]["DateTime"]))

	//assume three shift categories.
	//there is probably a better way of doing this.

//console.log(time)
//console.log(shiftCat[2])
//console.log(shiftCat)
	switch (true){
		case (time <= shiftCat[2]) :
			//console.log("Eary Morning")
			stateQuery(0,row,file)
		break;

		case (time > shiftCat[2] && time < shiftCat[4]) :
			//console.log("Day Time")
			stateQuery(1,row,file)
		break;

		case (time > shiftCat[0] ) :
			//console.log("Night Time")
			stateQuery(2,row,file)
		break;
		}
	///////////////////////////////
	//        CHECK STATE       //
	/////////////////////////////

	////////////////////////////////////////////////////////////
	//        ALLOCATE TO MATRIX IF CONDITIONS ARE MET      //
	//////////////////////////////////////////////////////////
		
	},
	complete: function() {
		console.log("Complete Processing :",file) 
		

        //increase the count of the files to process ( used for queing )
        fileProcessCount=fileProcessCount+1
        //run the que funtion on the files to process.
		parserQue(inp)
	}
});

}


////////////////////////////////////////////////////////
//          DETERMINE THE STATE OF OPERATION         //
//////////////////////////////////////////////////////
//1. State number is used to determine the shift that is checked.
function stateQuery(stateNumber,row,file){


//as each state requires comparision with each state and record in the MATRIX
//there is a requriemtn for a temp storage variable for this comarision information.
var tempStateVariable = ([])

	for (var i = 0; i < config.length; i++) {

	tempStateVariable[i] = { 
		"stateNumber" 	: config[i]["stateNumber"] ,
		"activeState" 	: false,
		"stateName" 	: config[i]["stateName"] 
	}
};
//console.log(tempStateVariable)

//loop through each state type.
for (var i = 0; i < config.length; i++) {
 
	//console.log(config[i]["tag"])
	//loop through data set.

	for (var key in row.data[0]){

		//Define Variables for Simplicity
		actualData = row.data[0][key]

//THere are alot of Null errors on the data , this removes and sets to zero.
 //console.log(row.data[0][key])
if (row.data[0][key]=="(null)") {
	//console.log(row.data[0][key])
	row.data[0][key]=0
	//console.log(row.data[0][key])
};




		//this is to find the result row currently parsed and find the tag to check for the state condition.
		if (key == config[i]["tag"]) {

			//console.log(key)
			//console.log(config[i])
			//console.log(config[i]["stateNumber"])





			///////////////////////////////
			// SIMPLE CONDITION CHECK   //
			/////////////////////////////

			switch (true) {
						case (config[i]["ConditionParameter"]=="greaterThan"):
						//conduct the greater than operation
						if (actualData>config[i]["greaterThan"]) {
							tempStateVariable[i]["activeState"]=true;
							//console.log(tempStateVariable[i]["activeState"])
							//console.log(tempStateVariable[i]["stateName"])
						};
						break;
						case (config[i]["ConditionParameter"]=="lessThan"):
						//conduct the less than operation
						if (actualData<config[i]["lessThan"]) {
							tempStateVariable[i]["activeState"]=true;
							//console.log(tempStateVariable[i]["activeState"])
							//console.log(tempStateVariable[i]["stateName"])
						};
						break;
						case (config[i]["ConditionParameter"]=="betweenlower"):
						//conduct the between operation
						if (actualData >= config[i]["betweenlower"] && actualData <= config[i]["betweenHigher"]){
							tempStateVariable[i]["activeState"]=true;
							//console.log(tempStateVariable[i]["activeState"])
							//console.log(tempStateVariable[i]["stateName"])
						}
						break;
						case (config[i]["ConditionParameter"]=="notBetweenlower"):
		 						//Leaving this out for now as it is not required.
						break;
						//this is used to determine the bypass condition on the LOS feedbelt.
						case (config[i]["ConditionParameter"]=="special"):
						if (row.data[0]["E790_WE01_WIT01a.STA_Analog"]>500 && row.data[0]["E641_CV01_WIT01A.STA_Analog"]<100){
							tempStateVariable[i]["activeState"]=true;
							//console.log(row.data[0]["E790_WE01_WIT01a.STA_Analog"])
							//console.log(tempStateVariable[6]["activeState"],row.data[0]["E641_CV01_WIT01A.STA_Analog"])
						}

						break;


						};
			};
		}
};
			//console.log("counting here")

			//create the empty matrix.
			var tempStateMatrix =([]);
			//simple counter
			counts = 0;
			for (var i = 0; i < tempStateVariable.length; i++) {
				for (var j = 0; j < tempStateVariable.length; j++) {

					if (tempStateVariable[i]["activeState"] === true && tempStateVariable[j]["activeState"]===true) {
							var stateName = [tempStateVariable[i]["stateName"],tempStateVariable[j]["stateName"]]
							tempStateMatrix.push({ 
													"stateNumber" 	: counts ,
													"activeState" 	: true,
													"stateName" 	: stateName
												});
							counts +=1;
					} else{
							var stateName = [tempStateVariable[i]["stateName"],tempStateVariable[j]["stateName"]]
							tempStateMatrix.push({ 
													"stateNumber" 	: counts ,
													"activeState" 	: false,
													"stateName" 	: stateName
												});
							counts +=1;
					};
				};
			};


//Used for State Printing Check .
	html='<tr>';			
for (var i = 0; i < tempStateVariable.length; i++) {
	 
	html+='<td>';
	if (tempStateVariable[i]["activeState"]==true) {
		html+=1;
	} else {
		html+=0;
	};
	
	html+='</td>';
};
html+='</tr>';	
//$("#statePrint").append(html)
 

//console.log(tempStateMatrix)
//Used for StateMatrix  Printing Check .
	html='<tr>';			
for (var i = 0; i < tempStateMatrix.length; i++) {
	 
	html+='<td>';
	if (tempStateMatrix[i]["activeState"]==true) {
		html+=1;
	} else {
		html+=0;
	};
	
	html+='</td>';
};
html+='</tr>';	
//$("#stateMatrixPrint").append(html)


//modify the file name to suit the 2015-01-01 format ( this is crap and should be improved)
var files = file.slice(0,4)
+ "-"
+ file.slice(4,6)
+ "-"
+ file.slice(6,8)
//1. Loop throguh eventData to find current file ( this could be improved )
//console.log(stateNumber)
 

for (var i = 0; i < eventData.length; i++) {
	if (eventData[i]["date"]==files) {



///////////////////////////
//      HISTOGRAM       //
/////////////////////////


 //console.log(config[i][1])
 //console.log("state",stateNumber)


var actualData = row.data[0]['E641_CV01_WIT01A.STA_Analog']
eventData[i]['shiftHist'][3][stateNumber] = eventData[i]['shiftHist'][3][stateNumber]+actualData;
var actualData = row.data[0]['E790_WE01_WIT01a.STA_Analog']
eventData[i]['shiftHist'][6][stateNumber] = eventData[i]['shiftHist'][6][stateNumber]+actualData;

switch (true){

			case (actualData < config[7][1]):
				eventData[i]['shiftHist'][stateNumber][0] = eventData[i]['shiftHist'][stateNumber][0]+1;
			break;

			case (actualData < config[7][2] && actualData > config[7][1]):
				eventData[i]['shiftHist'][stateNumber][1] = eventData[i]['shiftHist'][stateNumber][1]+1;
			break;

			case (actualData < config[7][3] && actualData > config[7][2]):
				eventData[i]['shiftHist'][stateNumber][2] = eventData[i]['shiftHist'][stateNumber][2]+1;
			break;

			case (actualData < config[7][4] && actualData > config[7][3]):
				eventData[i]['shiftHist'][stateNumber][3] = eventData[i]['shiftHist'][stateNumber][3]+1;
			break;

			case (actualData < config[7][5] && actualData > config[7][4]):
				eventData[i]['shiftHist'][stateNumber][4] = eventData[i]['shiftHist'][stateNumber][4]+1;
			break;

			case (actualData < config[7][6] && actualData > config[7][5]):
				eventData[i]['shiftHist'][stateNumber][5] = eventData[i]['shiftHist'][stateNumber][5]+1;
			break;

			case (actualData < config[7][7] && actualData > config[7][6]):
				eventData[i]['shiftHist'][stateNumber][6] = eventData[i]['shiftHist'][stateNumber][6]+1;
			break;

			case (actualData < config[7][8] && actualData > config[7][7]):
				eventData[i]['shiftHist'][stateNumber][7] = eventData[i]['shiftHist'][stateNumber][7]+1;
			break;

			case (actualData < config[7][9] && actualData > config[7][8]):
				eventData[i]['shiftHist'][stateNumber][8] = eventData[i]['shiftHist'][stateNumber][8]+1;
			break;

			case (actualData < config[7][10] && actualData > config[7][9]):
				eventData[i]['shiftHist'][stateNumber][9] = eventData[i]['shiftHist'][stateNumber][9]+1;
			break;

			case (actualData < config[7][11] && actualData > config[7][10]):
				eventData[i]['shiftHist'][stateNumber][10] = eventData[i]['shiftHist'][stateNumber][10]+1;
			break;

			case (actualData < config[7][12]):
				eventData[i]['shiftHist'][stateNumber][11] = eventData[i]['shiftHist'][stateNumber][11]+1;
			break;

			};


 

		//console.log("Entering the if statement with date",files,stateNumber)
		switch (true){
			case (stateNumber==0):
				for (var j = 0; j < eventData[i]["shift1"].length; j++) {
						if (tempStateMatrix[j]["activeState"] == true) {
							eventData[i]["shift1"][j]+=1;
						}else{
							 eventData[i]["shift1"][j]+=0;
						};	
				};
			break;
			case (stateNumber==1):
				for (var j = 0; j < eventData[i]["shift2"].length; j++) {
						if (tempStateMatrix[j]["activeState"] == true) {
							eventData[i]["shift2"][j]+=1;
						}else{
							 eventData[i]["shift2"][j]+=0;
						};	
				};
			break;
			case (stateNumber==2):
				for (var j = 0; j < eventData[i]["shift3"].length; j++) {
						if (tempStateMatrix[j]["activeState"] == true) {
							eventData[i]["shift3"][j]+=1;
						}else{
							 eventData[i]["shift3"][j]+=0;
						};	
				};
			break;
		}
	};
};


};

 

function printMatrix(){
 
html='';
html+='<tr>';

for (var i = 0; i < eventData.length; i++) {
	for (var j = 0; j < eventData[i]["shift1"].length; j++) {

switch (true) {
		case (j == 14   ):

		html+='<td>1</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	

		break;

		case (j == 28   ):
		html+='<td>2</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 42   ):
		html+='<td>3</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;


		case (j == 56   ):
		html+='<td>4</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;


		case (j == 70   ):
		html+='<td>5</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;


		case (j == 84   ):
		html+='<td>6</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 98   ):
		html+='<td>7</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 112  ):
		html+='<td>8</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 126   ):
		html+='<td>9</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 140   ):
		html+='<td>10</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;

		case (j == 154  ):
		html+='<td>11</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;
		case (j == 168  ):
		html+='<td>12</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;
		case (j == 182  ):
		html+='<td>13</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;
		case (j == 196  ):
		html+='<td>14</td></tr></tr>'
		html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
		break;



	default :  
	html+='<td>'+eventData[i]["shift1"][j]+'</td>'	
 	 
}

			
		
	};
html+='</tr>';	
 html+='<tr><td colspan="14"></td></tr>';
};



$("#shift1Table").append(html);


};
/*

function highchartsLoad() {
    $('#container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Daily Tonnages'
        },
        xAxis: {
            categories: [config[7][1],config[7][2],config[7][3],config[7][4],config[7][5],config[7][6],config[7][7],config[7][8],config[7][9],config[7][10],config[7][11]
            ],
            crosshair: true
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Count'
            }
        },
        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0
            }
        },
                series: [{
            name: 'Early Morninig',
            data: shiftHist[0]

        }, {
            name: 'Day',
            data: shiftHist[1]
        }, {
            name: 'Night',
            data: shiftHist[2]

        }]
    });
};*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////
//          C.R.U.D         //
/////////////////////////////

	///////////////////////////////
	//           CREATE         //
	/////////////////////////////

	///////////////////////////////
	//           READ           //
	/////////////////////////////

	///////////////////////////////
	//           UPDATE         //
	/////////////////////////////
	function writeJSON(){
	        //write the eventData variable to JSON file.
	        jQuery.ajax
	        ({
	          type: "POST",
	          dataType : 'json',
	          async: true,
	          url: 'http://localhost/github/Heavy-Lifting-Version-2/save_json.php',
	          data: { data: JSON.stringify(eventData,undefined,3) },
	          	success: function () {alert("Thanks!"); },
	          	failure: function() {alert("Error!");}
	        });
	}

	///////////////////////////////
	//           DELETE         //
	/////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////////////////////////