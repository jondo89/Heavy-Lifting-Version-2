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
    console.log('Complete')
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
	for (var i = shifts.length - 1; i >= 0; i--) {
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
var start = new Date().getTime();

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
	switch (true){
		case (time < shiftCat[2]) :
			//console.log("Eary Morning")
			stateQuery(0,row,file)
		break;

		case (time > shiftCat[2] && time < shiftCat[0]) :
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
		printMatrix()
		//write to the temp.json file
		writeJSON()
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
for (var i = config.length - 1; i >= 0; i--) {
	tempStateVariable[i] = { 
		"stateNumber" 	: config[i]["stateNumber"] ,
		"activeState" 	: false,
		"stateName" 	: config[i]["stateName"] 
	}
};
//console.log(tempStateVariable)

//loop through each state type.
for (var i = config.length - 1; i >= 0; i--) {
	//console.log(config[i]["tag"])
	//loop through data set.

	for (var key in row.data[0]){

		//Define Variables for Simplicity
		actualData = row.data[0][key]

		//this is to find the result row currently parsed and find the tag to check for the state condition.
		if (key == config[i]["tag"]) {

			//console.log(key)
			//console.log(config[i]["tag"])
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
		};

			};
		}
};
			//console.log("counting here")

			//create the empty matrix.
			var tempStateMatrix =([]);
			//simple counter
			counts = 0;
			for (var i = tempStateVariable.length - 1; i >= 0; i--) {
				for (var j = tempStateVariable.length - 1; j >= 0; j--) {
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


//console.log(tempStateMatrix)

///////////////////////////////
// THIS IS THE WORKING AREA //
/////////////////////////////

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

///////////////////////////////
// THIS IS THE WORKING AREA //
/////////////////////////////


//???????????????????????????????????????????????????????????????
			////////////////////////////////////
			// MAX MIN AVERAGE COUNT AND SUM //
			//////////////////////////////////
//???????????????????????????????????????????????????????????????

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
	
};

html+='</tr>';
 
$("#shift1Table").append(html);


};


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