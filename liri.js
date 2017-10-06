//requires for npm modules and files
var client = require("./keys.js");
var Spotify = require('node-spotify-api');
var request = require('request');
var fs = require('fs');
var inquirer = require('inquirer');

displayCommands();

function displayCommands(){

	//lists command options 
	//if request is song or movie then requets for title
	inquirer
	.prompt([
		{
			type:"list",
			message: "Select a request",
			choices: ["Tweets","Spotify","Movie Look Up","Pull From File"],
			name: "actionOption",
		},
		{
			type: "input",
			name: "song",
			message: "what song do you want to lookup?",
			when: function(answers){
				return answers.actionOption === "Spotify";
			}
		},
		{
			type: "input",
			name: "movie",
			message: "what movie do you want to lookup?",
			when: function(answers){
				return answers.actionOption === "Movie Look Up"; 
			}
		}
	])
	.then(function (answers){
			
		//removes quotes from selected option
		var ans = JSON.stringify(answers.actionOption).replace(/\"/g,"");
		var input="";

		// only process these 2 if answers.song or answers.movie are not empty
		if(answers.song){
			input = JSON.stringify(answers.song).replace(/\"/g,"");
		}
		
		if(answers.movie){
			input = JSON.stringify(answers.movie).replace(/\"/g,"");
		}

		//pass values to the function call function
		functionCaller(ans, input);

	});
}


//Function that handles a switch statement to forward to the correct function
function functionCaller(action, input){
	// pass information to the logging function
	if(!input){
		log("action: " + action + "was requested");
	}else{
		log("action: " + action + "was requested for " + input);
	}

	//process requested information
	switch(action){
		case "Tweets":
			myTweets();
			break;
		case "Spotify":
			spotifyThisSong(input);
			break;
		case "Movie Look Up":
			movieThis(input);
			break;
		case "Pull From File":
			doWhatItSays();
			break;
		default:
			log("invalid selection: " + action);
			console.log("invalid selection: " + action);
			break;
	}
}

//Tweet request processing function
function myTweets(){
	var params = {screen_name: 'MrCoder246'};
	var results = "";

	// Get tweet info
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
		//log and display errors
		if (error) {
			log("An error occured: " + error)
	    	return console.log("An error occured: " + error);
	   }

	   //loop through tweets and get the created time and tweet text
	 	for(key in tweets){
	    	results += "\r\n" + tweets[key].created_at + "\r\n" + tweets[key].text + "\r\n" + "---------";
	   }
	   //log and display tweet info
	   console.log(results);
	   log("Result for My Tweets: \r\n" + results);
	});
}

//spotify request processing function
function spotifyThisSong(song){
	var results = "";

	//log and display error if song was not entered
	if(!song){
		log("Error: A song was not entered");
		return console.log("Error: A song was not entered");
	}

	//spotify key info
	var spotify = new Spotify({
	id: "c436228a7bd54dd280ac01c67f96e060",
	secret: "22f55cfbfa8e4272953711027218b11f"
	});

	//spotify api caller
	spotify.search({ type: 'track', query: song}, function(error, data) {
	var path = data.tracks.items[0];
	
	//sotify api call error logger
	if (error) {
		log('Error occurred: ' + error);
		return console.log('Error occurred: ' + error);
	}

	//loop through response data and place information into results variable
	for(var key in data){
		
		results = "\r\n Preview URL: " + path.preview_url;
		results += "\r\n Title: " + path.name;
		
		for(var artists in path.artists){ 
			results += "\r\n Artist: " + path.artists[artists].name;
		}
		
		results += "\r\n Album: " + path.album.name;
		results += "\r\n ==========";
	}

	//display and log results
	console.log(results);
	log("Results for " + song + ":\r\n" + results);
	 
	});
}

//movie request processing function
function movieThis(movie){
	var results = "";

	//if movie title wasn't input display and log error
	if(!movie){
		log("Error: A title was not entered");
		return console.log("Error: A title was not entered");
	}

	//omdb api call
	request("http://www.omdbapi.com/?apikey=40e9cece&t=" + movie, function (error, response, body) {
		var bodyParsed = JSON.parse(response.body);

		//log and display omdbi api call error
		if (error){
		 log('Error occurred: ' + error);
		 return console.log('Error occurred: ' + error);
		}

		//process information and assign to results variable
		results += "\r\nTitle: " + bodyParsed.Title;
		
		//loop through ratings array and only get IMDB and rotten tomatoes info
		for(var rating in bodyParsed.Ratings){
			if(bodyParsed.Ratings[rating].Source === "Internet Movie Database" || bodyParsed.Ratings[rating].Source === "Rotten Tomatoes"){
				results +=  "\r\n" + bodyParsed.Ratings[rating].Source +": " + bodyParsed.Ratings[rating].Value;
			}
			
		}
		
		results += "\r\nReleased: " + bodyParsed.Year;
		results += "\r\nCountry: " + bodyParsed.Country;
		results += "\r\nLanguage: " + bodyParsed.Language;
		results += "\r\nPlot: " + bodyParsed.Plot;
		results += "\r\nActors: " + bodyParsed.Actors;

		//log and display results
		console.log(results);
		log("Result for "+ movie + ":\r\n" + results);

	});
}


function doWhatItSays(){
	var datas = [];
	
	//open random.txt file and get information
	fs.readFile("random.txt", "utf-8", function(error, data){
		
		//log and display errors
		if (error){
		 log('Error occurred: ' + error);
		 return console.log('Error occurred: ' + error);
		}
		
		//place information into an array
		datas = data.split(",");

		//pass information to the functionCaller function to process the requested info in the txt file
		functionCaller(datas[0],datas[1]);

	});
}

//logs all results into log.txt
function log(logInfo){
	//get current data and time
	var currentDate = new Date();
	//assign current date to log variable
	logEntry = "\r\n" + currentDate + "-";
	//add the log Information to the log variable
	logEntry += "\r\n" + logInfo;

	//add the information to the bottom of the log file
	fs.appendFile("log.txt", logEntry, function(error){
		
		//display any errors while writing to file
		//cannot log because there is an error with the log
		if (error){
		 return console.log('Logging Error: ' + error);
		}
	});
}