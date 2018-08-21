const stdin = process.openStdin(); 
const readline = require('readline');
const fs = require('fs');
const https = require('https');
const FBsampleAPI = require('./SAMPLE_FB_CODE.js');		//Sample Facebook Marketing API code for publishing campaigns
const savedCampaigns = require('./campaigns.json'); 	//JSON file where we export our saved campaigns to for now -- Normally I assume these would be stored in a DB
const rl = readline.createInterface({	//readline allows me to grab a line of input to variable as well as make the console somewhat interactive by using if statements depending on user input
				    input: process.stdin,
				    output: process.stdout,
				    terminal: false
				});





function pretendPublish(campaign) {


/*
https.post('https://graph.facebook.com/{API_VERSION}/act_{AD_ACCOUNT_ID}/ads', (resp) => {  //assuming this is something close to an appropriate url for the facebook ad api call
  let data = campaign;  //Assuming the campaign has all of the relevant fields needed to be accepted and used by facebook...

  resp.on('data', (incoming) => {
    data += incoming;
  });

  resp.on('end', () => {
    let returned = JSON.parse(data);

    console.log(returned); //See what was sent back
    
    TODO maniuplate the returned data, successful creation, ad campaign status, etc.?

  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
  templateChooser(); //restart app

});
*/

/* I also looked in to the Facebook marketing API and found some sample code (for what I believe to be ad/campaign creation) that is included in this directory
 that may be able to be externally called from this function to publish ad campaigns.*/

	console.log(`You pretend published your campaign!\n================================\n\n`);
	templateChooser();	//back to main menu

}





function campaignFill(fetchedInfo, campaign) {

	let numOfProps = Object.keys(campaign);	//creates an array of keys from the object passed

	let campLength = numOfProps.length;	//takes length of numOfProps therefore telling us how many keys our campaign has so we can iterate through all of them easily

	if (campaign.Template === `Single Image Ad Template`) { 
		for (i = 0; i <= 0; i++) {	/*iterate through the obj properties, looking for the ones we want to update as per Tech Test instructions 
																('use product name as the Ad Title and product description for the Ad Copy.') */
			for (var property in fetchedInfo[i]) {

		    	if (fetchedInfo[i].hasOwnProperty(property)) {

		    		if (property == 'Name') {
		    			campaign['Ad title'] = fetchedInfo[i][property];
		    		} else if (property == 'Description') {
		    			campaign['Ad Copy'] = fetchedInfo[i][property] + ', ';

		    		} else if (property == 'Image') {
		    			campaign.Image = fetchedInfo[i][property] + ', ';
		    		}
		    	}
			}
		}

	} else if (campaign.templateName === `Multi Image Carousel Ad Template` || `Multi Image Slider Ad Template`) {	//based on the specs of our templates we know how many products can fit in our ad, therefore '<=2' 3 lines down tells us only to grab the first 3 products from the api call when there could be more returned (as is the case).
		campaign.title = '';	//need to clear the default values or else we would end up with "default value, actual value0, actual value1" because we are adding values from the api when there are multiple products, not just overwriting them
		campaign.image = '';	//we didn't need to clear the values for the single image ad because we just overwrote them.
		campaign.adCopy = '';
		for (i = 0; i <= 2; i++) {	//iterate through the obj properties, looking for the ones we want to update as per Tech Test instructions ('use product name as the Ad Title and product description for the Ad Copy.') 
			for (var property in fetchedInfo[i]) {	//I know the API call from Shoelace returns product price, but it was explicitly stated that we are trying to recreate the campaigns found in Appendix B(which doesn't include a price), so that's exactly what we will do.

		    	if (fetchedInfo[i].hasOwnProperty(property)) {

		    		if (property == 'Name') {
		    			campaign['Ad title'] += fetchedInfo[i][property] + ',';	//set values in our campaign.

		    		} else if (property == 'Description') {
		    			
		    			campaign['Ad Copy'] += fetchedInfo[i][property] + ', ';

		    		} else if (property == 'Image') {

		    			campaign.Image += fetchedInfo[i][property] + ', ';

		    		}
		    	}
			}
		}
	}

	console.log(campaign);	//spits out the custom campaign with values pulled from https://shoelace-dev-test.azurewebsites.net/api/UserProducts (this should be the end product - the campaing(s) found in appendix B, if all was done correctly)

}	//end of campaignFill();





function pullSavedCampaigns() {			//Prints saved campaigns from campaigns.json - Simply shows you what you have saved already

	console.log(`\n`, savedCampaigns, `\n`);
	templateChooser();

}	//end of pullSavedCampaigns





function saveCampaign(campaign){	//Campaign save function -- I imagine in actual practice these would be stored in a Mongo db, for now we are storing them in an external JSON file, suitable for smaller scalability

	const rl = readline.createInterface({	//readline allows me to grab a line of input to variable as well as make the console somewhat interactive.
				    input: process.stdin,
				    output: process.stdout, 
				    terminal: false
				});



	fs.writeFile('campaigns.json', JSON.stringify(campaign), 'utf8', function (err) {
		if (err) throw err;	
	});

	console.log('Campaign Saved.\n');

	rl.question('\nWould you like to PUBlish your campaign, RESTART the program, or EXIT?(PUB/RESTART/EXIT):  \n', (value) => {
	    if (value == `RESTART`){
	    	console.log(`Restarted!`);
	    	templateChooser();
	    } else if (value == `PUB`) {
	    	pretendPublish();
	    	templateChooser();
	    } else if (value == `EXIT`) {
	    	process.exit();

	    }
	});

		//process.exit() // This ends the script in node with default 0 success code -- I normally would use something like 'nodemon' or 'forever' to keep the script running in Node
		
	

	
}	//end of saveCampaign


function pingAPI(urlPing, campaign) {		//Our API calling function, sends HTTP GET request to the provided url and stores response in 'data' to be parsed and used

	https.get('https://shoelace-dev-test.azurewebsites.net/api/UserProducts', (resp) => {		//in practise this url would be able to be specified by user
		let data = '';

		resp.on('data', (incoming) => {
			data += incoming;
		});

		resp.on('end', () => {
			let fetchedInfo = JSON.parse(data);		//parse the received JSON data so it is usable
		    campaignFill(fetchedInfo, campaign);	//fill our campaign with the data we pulled from the API!
		});

	}).on("error", (err) => {
	  console.log("Error: " + err.message);		//log errors if present
	});
	

}		//end of pingAPI



function updateCampaign(campaign) {	//this is where you edit your template and it becomes a 'campaign'

	rl.question('Do you want to add another new property to the campaign? (YES/NO):  ', (value) => { 
	    if (value == 'YES') {

		    rl.question('\nEnter the name of the new property: ', (value2) => {
		    		if (value2 !== '') {
		    			let propNew = value2; //give this a default or else it won't be added to the object no matter what

		    	rl.question('\nEnter the value of the new property: ', (value3) => {
		    		let propValue = value3;
		    		campaign[propNew] = propValue;
		    		console.log(`\nNEW OBJECT PROPERTY ADDED TO CAMPAIGN.\n ${propNew} : ${propValue}\n`)
		    		console.log(campaign);
		    		updateCampaign(campaign);
		    	});

		    	} else {
		    		console.log(`Please enter a non-blank property name.`);	//Bad practise imo to have blank objects keys...
		    		updateCampaign(campaign);	//re-try without leaving it blank this time!
		    	}

		    });

	    
		} else if (value == `NO`) {	//if you are done editing
	    	console.log(`========================================================================\nYour current campaign looks like this:\n`);
	    	console.log(campaign); console.log(`\n`);

	    	rl.question(`To save your campaign type SAVE, to populate your campaign from an API call type API, else type EXIT.(SAVE/API/EXIT):  `, (value) => { 
	    		if (value == `SAVE`) {

					let savedCamp = campaign;
					let savedCampaigns2 = savedCampaigns; //copies the JSON array from campaigns.json
	    			savedCampaigns2.push(savedCamp);	//we retrieved a list of saved JSON objects on line 5, this pushes our newly crafted campaign in to that array
	    			saveCampaign(savedCampaigns2);	//and then writes that array to the external campaigns.json file -- I ASSUME THIS IS ACTUALLY SAVED TO A DATABASE IN PRACTISE/PRODUCTION - this is just my workaround for the test, not at ALL suitable for higher scalability, I would NOT normally do this at all!

	    		} else if (value == `API`) { //If you want to populate the campaign with data from the Shoelace API call

	    			pingAPI('https://shoelace-dev-test.azurewebsites.net/api/UserProducts', campaign); //In practise this should be a user-supplied url, so you can ping whichever endpoint you'd like to, for now we know we are pinging this exact one.

	    		} else if (value == `EXIT`) {	//If you are done.

	    			//console.log(savedCampaigns); //can uncomment this just for a visual representation of what could have been saved...

	    			process.exit() 	//Have this here or else the app hangs in Node, again would normally use something like npm's 'forever' to retstart the app

	    		} else {	//no appropriate input from user.
	    			console.log(`\nSorry, not understood.`);
	    			updateCampaign(campaign);	//recursive call to try again!
	    		}
	    	});

	    } else {	//this is here to combat issues that sometimes arise with 'interactivity' in Node and readline functionality when a user sometimes tries to backspace
	    	console.log(`\nOops, plese try again!\n`);
	    	updateCampaign(campaign);	//recursive call to try again
	    }
	});

} // END OF createCampaign





function createCampaign(clone) {	//function clones a template object allowing us to edit it while maintaining the original template's integrity - gets called inside of templateChooser();

	let newCampaign = Object.assign({}, clone); //ES6 for easily cloning objects
	console.log(`\n`, newCampaign, `\n`);
	console.log('Now editing template:\nEnter "NEW" if you would like to add a new property to the campaign template.\nIf you wish to edit an existing keypair value simply overwrite it.\nEnter "CONT" to finish editing campaign template');


	function killStream(data) {	//this is an eventListener that is called and executed by the LISTENTOME() function and looks for user-input similar to readline() but it doesn't create a new readline interface - nested readlines sometimes cause issues

		var trimmed = (data.toString().trim());	//this needs to be trimmed because the stdinput itself has buffer whitespaces and a '\r' that are present behind the scenes, The data being passed is also of type object before converting it to string, therefore unusable for our purpose
		let propNew = '';
								//If you choose to add a new obj key and value to your template/campaign
		    if ( trimmed == "NEW" ) {    // I don't use the hard comparators in these situations because everything is being converted to a string two lines up via the "trimmed" variable. Less typing than hard comparing the input to strings, ie. if trimmed === '0'
		    	console.log(`You are now editing the ${newCampaign.Template}:`);	//template literals makes this much easier

		    	rl.question('Please name your new campaign template:  ', (value) => { 
				     let propNew = value; //THIS IS COMPLETELY OPTIONAL TO MY SCRIPT - I understand "campaignName" is not something that is present in Appendix B - Assigning a campaign name is something that I assume is done when a campaign is actually created and saved at Shoelace, or SOME kind of unique identifier is attached to it, !!!For the purposes of visually seeing which campaigns you have created and saved with my save function we assign them a name.
				     let propValue = '';

				     if (value !== '') {	//as long as the obj key's value isn't blank - bad practise to leave blank.

					    newCampaign.campaignName = value;	//assign the campaign a name
					    
					    console.log(newCampaign);
					    
					    stdin.removeListener("data", killStream);	//kills the listener created by LISTENTOME() below which is reading user input
					    
					    updateCampaign(newCampaign);	//send template for editing
 
					} else {
				    	console.log('Something went wrong.');	//this should realistically never be triggered, the campaign will have a name, or not be accepted.
				    }

				});

		    } else if (trimmed == 'CONT') {	//if you are done editing

		    	rl.question('Enter a name for your new campaign template:  ', (value) => { 
				     let propNew = value; //Again - this is part of my script and used to visually identify/differentiate between saved campaigns - I understand this is not found as a property of the campaigns found in Appendix B, but is more for the UX
				     let propValue = '';

				     if (value !== '') {

					    newCampaign.campaignName = value;

					    console.log(newCampaign);
					    
					    stdin.removeListener("data", killStream);

					    updateCampaign(newCampaign);
					}
				});
			} //else {
				//console.log(`Your choices are 'CONT' or 'NEW'`);
			//}
	} //end of killStream





	function LISTENTOME() {
		stdin.addListener("data", killStream);

	} //end of LISTENTOME()

LISTENTOME();

} // END OF createCampaign()





function templateChooser() {
	
	//create the templates as objects, reuseable and customize
	const bronze_template = {
		'Template':'Single Image Ad Template',
		'Ad Title': 'Single Image Ad Default Description',
		//'image': 'default.jpg',	these image keys should be added in the app.
		'Ad Copy': 'Single Image Ad Default Ad Copy',
		'Campaign Objective': 'Lead generation',
	}

	const silv_template = {
		'Template': 'Multi Image Carousel Ad Template',
		'Ad Title': 'Default title0, Default title2, Default title2',
		'Ad Copy': 'Default text1, Default text2, Default text3',
		'Campaign Objective': 'Conversions',
	}

	const gold_template = {
		'Template': 'Multi Image Slider Ad Template',
		'Ad Title': 'Default title0, Default title1, Default title2',
		'Ad Copy': 'Default text1, Default text2, Default text3',
		'Campaign Objective': 'Impressions',
	}

	console.log('====================================================================\nCampaign Creator 1.0 - by Nathan Roane \nPlease choose your starting template:\n');

	console.log("(0)" + bronze_template.Template, '\n');
	console.log(bronze_template);

	console.log("\n(1)" + silv_template.Template, '\n');
	console.log(silv_template);

	console.log("\n(2)" + gold_template.Template, '\n');
	console.log(gold_template);

	console.log(`\nEnter a template number to begin editing - or typed 'SAVED' to view your saved campaigns (0/1/2/SAVED): `);	





	function killStream(data) {		//I believe that using these listeners when needed is faster than calling a new readline console class to be instantiated.
		trimmed = (data.toString().trim());

		if ( trimmed == 0) {

			console.log("====================================================================\nYou chose 0 - the Single Image Ad Template");	//eye-candy formatting for the console, makes it much easier to understand what just happened when multiple things get logged all at once
	    	stdin.removeListener("data", killStream); //need to kill the listener here - because it is not yet defined if killed in createCampaign() and this listener is local to the templateChooser() function, where it is sending stdin data back to
	    	createCampaign(bronze_template);	//calls on createCampaign function which clones the template object and allows the user to customize it

	    } else if ( trimmed == 1) {

	    	console.log("====================================================================\nYou chose 1 - the Multi Image Carousel Ad");	//Eye-candy
		    stdin.removeListener("data", killStream);
		    createCampaign(silv_template);
		    	
		} else if ( trimmed == 2) {
		    console.log("====================================================================\nYou chose 2 - Multi Image Slider Ad");
	    	stdin.removeListener("data", killStream);
	    	createCampaign(gold_template);

		} else if ( trimmed == 'ping') {	//FOR DEBUGGING -- does not show up as an option in the original 'menu', but is more like a hidden dev feature
		    console.log("You are testing the endpoint ping\n");
	    	stdin.removeListener("data", killStream);
	    	pingAPI('https://shoelace-dev-test.azurewebsites.net/api/UserProducts');

		} else if ( trimmed == 'SAVED') {	//view the campaigns that are saved in campaigns.json
		    console.log("====================VIEWING SAVED CAMPAIGNS BELOW:====================\n");
	    	stdin.removeListener("data", killStream);
	    	pullSavedCampaigns();

		} else {
		    console.log('You entered '+ trimmed);
		    console.log("You did not enter a valid template number - please try again.");
		}
	} //end of killStream


	function LISTENTOME() {
		//stdin.removeListener(data);
		stdin.addListener("data", killStream);

	} //end of LISTENTOME()

	LISTENTOME();

}	//end of templateChooser();

templateChooser();