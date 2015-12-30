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
	  preview: 15,
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
			stateQuery(0,row)
		break;

		case (time > shiftCat[2] && time < shiftCat[0]) :
			//console.log("Day Time")
			stateQuery(1,row)
		break;

		case (time > shiftCat[0] ) :
			//console.log("Night Time")
			stateQuery(2,row)
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
function stateQuery(stateNumber,row){



//loop through each state type.
for (var i = config.length - 1; i >= 0; i--) {
	//console.log(config[i]["tag"])
	//loop through data set.

	for (var key in row.data[0]){
		//Define Variables for Simplicity
		//actualData = row.data[0][key]
		//console.log(key)

		//this is to find the result row currently parsed and find the tag to check for the state condition.
		if (key == config[i]["tag"]) {
			//console.log(key)
			//console.log(config[i]["tag"])
			console.log(config[i]["stateNumber"])
		};

		}



};



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