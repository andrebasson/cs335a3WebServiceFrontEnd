/* 
 * AUTHOR: 		Andre Basson	
 * COURSE: 		Compsci 335
 * ASSIGNMENT:	3, part 1 (building a web UI, that consumes a webseriver)
 * YEAR: 		2015 s2
 */

/* 
 * a function to dynamically create the HTML content specific to the shop front UI 
 */ 
function createShopFront() {
	// build the dynamic HTML content
	var outputContent = "<input id='searchTextBox' type='text' value='enter item name here' size='100'></input>"
					+ 	"<input id='searchButton' type='button' value='Search' onclick='displayItems()'/>"
					+ 	"<select id='mySelect'>"
					+		"<option value='books'>Books</option>"
					+		"<option value='bluRays'>BluRays</option>"
					+	"</select>"				
					+	"<table id='showTable'></table>"
					
	// update the output placeholder (div)
	document.getElementById("output").innerHTML = outputContent;
	
	// display items in shop front
	displayItems();
	
	// update the HTML footer:	1. display NOTHING for the Registration Status
	//						   	2. display the web-service version 
	document.getElementById("registrationStatus").innerHTML = "";
	
	// get the web-service's current version, then populate the HTML code dynamically created earlier.
	getVersion(null);		
}
 
/* 
 * a function to dynamically create the HTML specific to the User Registration Section UI 
 */ 
function createRegistrationSection(){
	var outputContent = "Username: <input id='usernameInput' type='text' value='Username' size='100'></input></br>"
					+ 	"Password: <input id='passwordInput' type='password' value='Password' size='100'></input>"				
					+	"<p>Address:</br><textarea id='addressInput' rows='5' cols='113'>Type address here</textarea></p>"							
					+	"<input id='regButton' type='button' value='Join' onclick='registerUser()'/>";
	
	// update the output placeholder (div)
	document.getElementById("output").innerHTML = outputContent;

	// update the HTML footer:	1. display the Registration Status
	//						   	2. display the web-service version 
	document.getElementById("registrationStatus").innerHTML = "(Registration Status)"/*getRegStatus()*/;
	
	// get the web-service's current version, then populate the HTML code dynamically created earlier.
	getVersion(null);	
}

/* 
 * a function to dynamically create the HTML specific to the Comments Section UI 
 */
function createCommentSection() {
	// build the dynamic HTML content
	var outputContent = "Your feedback here is greatly appreciated:"
					+ 	"</br><textarea id='feedbackInput' rows='5' cols='113'></textarea>"
					+	"</br>Your name:     " + "<input id='usernameInput' type='text' value='username' size='100'></input>"
					+		"<input id='submitCommentButton' type='button' value='Submit' onclick='submitComment()'></input>"
					+	"<h2>Recent Comments</h2>"
					+	"<div id='recentComments'></div>"
	
	// update the output placeholder (div) with the HTML built above
	document.getElementById("output").innerHTML = outputContent;
	
	// populate the inner HTML op the placeholder created above ( i.e. the <div> with id='recentComments' )
	displayComments();

	// update the HTML footer:	1. display NOTHING for the Registration Status
	//						   	2. display the web-service version 
	document.getElementById("registrationStatus").innerHTML = ""/*getRegStatus()*/;

	// get the web-service's current version, then populate the HTML code dynamically created earlier.	
	getVersion(null);	
}

/*
 * A helper function to populate the Shop Front HTML code with either items books or blurays.
 * NOTE: envokes either getBooks() or getBluRays(), which in turn envokes populateShopFrontTable()
 *		 which does the actual population.
 * ( Detailed comments covered earlier )
 */
function displayItems() {
	// first check the HTML drop-down box to see whether 'books' or 'blurays' had been selected
	var selectOption = document.getElementById("mySelect");
	
	// check whether a search text had been entered in the search text box
	var searchString = document.getElementById("searchTextBox").value;	
	
	if(selectOption.value === "books") { 
		// it's books!
		if (searchString == null || searchString == "" || searchString == "enter item name here") {
			// then there's no method parameter - we display ALL the books
			getBooks();
		} else {
			// else there is parameter - we display ONLY the books matching this search string
			getBooks(searchString); 
		}		
	}
	else if (selectOption.value === "bluRays") {
		// it's blurays!
		if (searchString == null || searchString == "" || searchString == "enter item name here") {
			//  no method parameter (search string) - we display ALL the blurays
			getBluRays();
		} else {
			// there is a parameter (search string) - we display ONLY the blurays matching this string
			getBluRays(searchString); 
		}			
	} 
	
	// this shouldn't ever occur
	else {alert("ERROR: that option does not exist");}
}

/*
 * Function that creates an http connection with the web-service at either URIs:
 * 1. http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/booklist , or
 * 2. http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/booksearch?term={TERM}
 * ...to GET one or more books, in JSON format, as stored by the web-service on the server.
 * Upon receiving said list of books from the web-service, the HTML representing the Shop Front
 * is then dynamically updated via function populateShopFrontTable().
 */
function getBooks(searchString) {

	// create target URI to identify the correct web-service handler
	if (searchString == null || searchString == "" || searchString == "enter item name here") {
		// no parameter received, thus target the 'booklist' web-service handler
		var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/booklist";
	} else {
		// no parameter received, thus target the 'booksearch' web-service handler	
		var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/booksearch?term=" + searchString;
	}
	
	// create http connection object xhr
	var xhr = new XMLHttpRequest();
	
	// open connection/URI with a particular HTTP method/action (e.G. GET, POST, PUT, DELETE),
	// and initialise whether sync (false) or async (true).  (See xhr.onload delegate below)
	xhr.open("GET", uri, true);
	
	// after xhr is opened, set the Content-Type request header (in the HTTP request packet)
	// to inform the web-service that the incoming request will be sending data in the request payload
	// in JSON format.  The web-service can then consume the JSON formatted data.
	xhr.setRequestHeader("Accept", "application/json");		// request for JSON format (I've checked with w3 client toolkit; JSON is supported by web-service)
	
	// if async, setup a callback function using an anonymous function and store a pointer to it in 
	// the delegate/function pointer 'onload'.  
	// The body of this callback function is executed upon receiving response from the web-service	
	xhr.onload = function () {
		// GET succeeded...
		// ...Parse (deserialize) the JSON formatted text in the body of the http RESPONSE
		//  received from the web-service, to a local variable (arrayOfBooks)
		var arrayOfBooks = JSON.parse(xhr.responseText);		
		
		// now dynamically create and populate HTML representing our shop front table of items
		populateShopFrontTable(arrayOfBooks);	  
	}
	// only now send the HTTP request; placing the serialized object (i.e. converted to string) in the request payload/body
	// When sending the request, we have to send via the http request's body/payload the JSON string, so as to
	// allow the web-service handler to "consume" (deserialize) it to a local object.	
	xhr.send(null);
}

/*
 * ...as per function getBooks(), now we repeat for blurays to GET & populate the shop front HTML
 * to be displayed to the user
 */
function getBluRays(searchString) {
	if (searchString == null || searchString == "" || searchString == "enter item name here") {
		var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/brlist";
	} else {
		var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/brsearch?term=" + searchString;
	}
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.setRequestHeader("Accept", "application/json");		// request for JSON format
	
	xhr.onload = function () {
      var arrayOfBluRays = JSON.parse(xhr.responseText);	// request for JSON format (I've checked with w3 client toolkit; JSON is supported by web-service)
      populateShopFrontTable(arrayOfBluRays);
	}
	xhr.send(null);
}


/* 
 * Function to dynamically create and populate the HTML "shop front" table
 * Params: arraOfItems	-	an array of JSON objects (i.e. either books or blurays)
 */
function populateShopFrontTable(arrayOfItems){	
	
	// string representing the HTML we dynamically create below
	var tableContent = "";
	
	// determine whether arrayOfItems contain books or blurays
	var itemType = determineItemType(arrayOfItems[0]);

/* a) REMOVED IN 2015.10.16c
	// create a method name, along with parameters 
	// - to be used in generating 'onclick' event handler in HTML
	var method = "";
	if (determineItemType(arrayOfItems[0]) == "book"){
		var method = "buyNow(this, true)";
	} else {
		var method = "buyNow(this, false)";	
	}
*/

/* REPLACED (a) ABOVE WITH */
	// initialize the base target URIs for purchasing either book or bluray item
	if (itemType == "book"){
		var baseBuyItemURI = "http://redsox.tcs.auckland.ac.nz/BC/Closed/Service.svc/bookbuy?id=";
	} else {
		var baseBuyItemURI = "http://redsox.tcs.auckland.ac.nz/BC/Closed/Service.svc/brbuy?id=";
	}
	
	// loop through all the array of JSON formatted items (either books or blurays)
	// and build the HTML table required.  
	// To Note: the final column, or <td>; contains a link tag (<a>) targeting a 'buy' web-service 
	//			handler.  Effectively, when you click this link, it will create a connection to
	//			and envoke either 'bookbuy' or 'brbuy' service handler.
	//
	for (var i = 0; i < arrayOfItems.length; ++i) {
		var item = arrayOfItems[i];		
		
		// dynamically build the HTML to display to the user
		tableContent += "<tr>"
						+ "<td><img id='" + item.Id + "' src='' alt='" + item.Id + "'>" + "</td>"
						+ "<td>" + item.Title + "</td>" 						
//  -------- b) REMOVED IN 2015.10.16c ---------
// 						+ "<td><img id='Item: " + item.Id + "' src='images/BuyNow.png' "
//						+ 	"onclick='" + method + "'></td>"						
/* --------- REPLACED (b) WITH -----------------------*/			
						+ "<td>	<a href='"+ baseBuyItemURI + item.Id + "'>"
						+		"<img id='buynowImage' src='images/BuyNow.png' />"
						
						+ "</tr>\n";						
		
		document.getElementById("showTable").innerHTML = tableContent;		
	}
	
	// specifically update the cover art for either book or bluray
	setCoverArt(arrayOfItems);
}

/*
 * A Function that returns a string representation of the type of the object received
 */
function determineItemType(item){
	// if item has an "AuthorInitials" attribute, then that attributes will have a definite value, 
	// which implies the item must be a BOOK because a BLURAY does NOT have such an attribute
	if (item.AuthorInitials == null || item.AuthorInitials == "") {
		// then the arrayOfItems are blurays
		return "bluray";
		
	} else {
		// then the arrayOfItems are books
		return "book";
	}		
}

/*  -------- REMOVED COMPLETELY IN VERSION 2015.10.16c -------- */
/*
function buyNow(htmlTagObj, isBook){	
	
	var baseURI = "http://redsox.tcs.auckland.ac.nz/BC/Closed/Service.svc";
	
	// the target uri - to identify the web-service entry point/appropriate web-service handler
	var uri = null;
	
	// build the target uri
	if (isBook) {
		// is a book item
		uri = baseURI + "/bookbuy?id=" + htmlTagObj.id.substring(6);		
	} else {
		// is a Bluray item
		uri = baseURI + "/brbuy?id=" + htmlTagObj.id.substring(6);
	}	
	
	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);	
	xhr.onload = function(){
		// GET succeeded, do something...

		// output the response received from the web-service
		// 	NOTE: 	Response received is in XML format ONLY (non-negotiable), containing a single <string> tag. 
		//			Hence the use of .responseXML attribute to retrieve the body of the http response.
		alert(xhr.responseXML.getElementsByTagName("string")[0].childNodes[0].nodeValue);
	}
	xhr.send(null);	// no POST, so http request body = null
	
}
*/

/* 
 * A helper function to replace (populate) each image id string value in the "shop front" HTML table 
 * dynamically created earlier, with an actual image retrieved from the web-service.
 * NOTE: exclusively called by function populateShopFrontTable()
 */
function setCoverArt(/*xhr, */arrayOfItems){		
	
	if(arrayOfItems[0].AuthorInitials != null) {
		var baseURI = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/bookimg?";
	} else {
		var baseURI = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/brimg?";	
	}
	
	var uri = "";
	for (var i=0; i<arrayOfItems.length; ++i){
		var item = arrayOfItems[i];
		uri = baseURI + "id=" + item.Id;		
	
		document.getElementById(item.Id).src = uri;
		console.log("item.Id"+item.Id);
		console.log("uri"+uri);
	}
}

/*
 * Function that creates an http connection with the web-service at
 * URI http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/comment?name={NAME} ,
 * to POST a new comment as stored by the web-service on the server.
 */
function submitComment(){
	// get the feedback (comment) entered from the DOM
	var commentString = document.getElementById("feedbackInput").value;
	
	// get the user name entered from the DOM
	var uName = document.getElementById("usernameInput").value;
	
	// create a URI targeting/identifying the 'create comment' web-service handler
	var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/comment?name=" + uName;
	
	// create http connection object xhr
	var xhr = new XMLHttpRequest();
	
	// open connection/URI with a particular HTTP method/action (GET, POST, PUT, DELETE),
	// and initialise whether sync (false) or async (true)
	xhr.open("POST", uri, true);
	
	// after xhr is opened, set the Content-Type request header (in the HTTP request packet)
	// to inform the web-service that the incoming request will be sending data in the request payload
	// in JSON format.  The web-service will then consume the data in JSON format.	
	xhr.setRequestHeader("Content-Type", "application/json");  // ;charset=UTF-8
	
	// if async, setup a callback function using an anonymous function and store a pointer to it in 
	// the delegate/function pointer 'onload'; body of the function executed upon receiving response from web-service
	xhr.onload = function() {
		// the web-service's http response body equals the content that you've sent/POSTed
		// earlier, IF the POST was successful.  xhr.status = status code
		if (xhr.status == "200") {		
			// re-populate comments in HTML output
			displayComments();					
		}	
	}	

	// Only now send the HTTP request; placing the serialized object (i.e. converted to JSON string) in the request payload/body.
	// NOTE: When sending the request, we have to send the string via the http request's body, so as to
	// 		 allow the web-service handler to "consume" (parse/deserialize) it to a local object again.	
	xhr.send(JSON.stringify(commentString));
}

/*
 * A function to (re-)populate the HTML code dynamically created in function createCommentSection().
 * Also called by function submitComment() upon a newly created comment.  
 * ( Detailed comments covered earlier )
 */
function displayComments(){	
	var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/htmlcomments";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.onload = function() {
		// responseText = content (string) in the payload of the http response received from the web-service
		var response = xhr.responseText;

		// update the innerHTML with this response text received
		document.getElementById("recentComments").innerHTML = response;		
	}	
	xhr.send(null);
}

/*
 * A function to register/sign-up a new user  
 * ( Detailed comments covered earlier )
 */
function registerUser() {

	var uName = document.getElementById("usernameInput").value;
	var uPassw = document.getElementById("passwordInput").value;
	var uAddress = document.getElementById("addressInput").value;
	
	// register a new user if the user has entered values at all the required fields on display
	if (checkRegEntries(uName, uPassw, uAddress) == "") {
		// construct a user object, with which we can construct a JSON string that we can pass in a HTTP POST request payload body

/* A simpler/singleton user object
		var userObj = {
			Address: uAddress,
			Name: uName,
			Password: uPassw
		};
*/		
		var userObj = new User(uAddress, uName, uPassw);		
		var jsonString = '{ "Address":"' + userObj.getAddress() + '", "Name":"' + userObj.getName() + '", "Password":"' + userObj.getPassword() + '" }';

		// create http connection object xhr
		var xhr = new XMLHttpRequest();
		
		// create target URI to identify web-service operation
		var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/register";
		
		// open connection/URI with a particular HTTP method/action (e.G. GET, POST, PUT, DELETE),
		// and initialise whether sync (false) or async (true)
		xhr.open("POST", uri, true);
		
		// after xhr is opened, set the Content-Type request header (in the HTTP request packet)
		// to inform the web-service that the incoming request will be sending data in the request payload
		// in JSON format.  The web-service will then consume the data in JSON format.
		xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
		
		// if async, setup a callback function using an anonymous function and store a pointer to it in 
		// the delegate/function pointer 'onload'; body of the function is where work gets done!		
		xhr.onload = function(){
			// POST succeeds; do something
			if (xhr.status == "200" /*&& xhr.responseText == userObj.getName()*/) {
				//alert("success");				
				document.getElementById("registrationStatus").innerHTML = "(User Registered)";
				//alert("xhr.responseText = " + JSON.parse(xhr.responseText));
			} else {
				document.getElementById("registrationStatus").innerHTML = "(User Registration failed)";
			}	
		}
		
		// only now send the HTTP request; placing the serialized object (i.e. converted to string) in the request payload/body
		// When sending the request, we have to send via the http request's body/payload the JSON string, so as to
		// allow the web-service handler to "consume" (deserialize) it to a local object.
		xhr.send(jsonString);

	} else {
		// don't register any user; output an error to screen
		alert("You've ommitted some details: " + checkRegEntries(uName, uPassw, uAddress) + "\n");
	}
}

/* 
 * Checks that the user has a name, password & address value entered 
 *	NOTE: only checks that each field is NOT empty
 */
function checkRegEntries(uName, uPassw, uAddress) {

	var errorString = "";
	switch(uName){
		case "":
			errorString += "\nUsername required please";			
			break;
		case "Username":	
			errorString += "\nUsername required please";
			break;
		default:			
	}
	
	switch(uPassw){
		case "":
			errorString += "\nPassword required please";			
			break;
		case "Password":	
			errorString += "\nPassword required please";
			break;
		default:			
	}	
	
	switch(uAddress){
		case "":
			errorString += "\nAddress required please";			
			break;
		case "Type address here":	
			errorString += "\nAddress required please";
			break;
		default:			
	}

	if (errorString != "") {
		return errorString;
	} else {
		return "";
	}

}

/*
 * A function to get the web-service's current version, then populate the HTML code dynamically created earlier.
 * ( Detailed comments covered earlier )
 */
function getVersion() {
	var uri = "http://redsox.tcs.auckland.ac.nz/BC/Open/Service.svc/version";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", uri, true);
	xhr.setRequestHeader("Accept", "application/json");	
	
	// callback function: called after receiving an http response message from the web-service
	xhr.onload = function(){		
		// responseText = content (string) in the payload of the http response received 
		// i.e. the response is a string representing the versions of the web-service used
		var response = xhr.responseText;	

		// update the innerHTML with this response text received
		var versionID = document.getElementById("version");
		versionID.innerHTML = response;		
	}
	xhr.send(null);	
}

/* create an custom USER Class (using a method with custom constructors)
 * (you didn't have to create this class/template, a singlet anonymous object would've been okay!)
 *	NOTE: 
 *		1. not all constructor parameters have to be defined via parameters passed!
 *		
 */
function User( uAddress, uName, uPassw ) {
	
	// properties (states)
	//
	this.Address = uAddress;		
	this.Name = uName;
	this.Password = uPassw
	  
	// setter methods (behaviour)
	//	
	this.setAddress = function(uAddress){
		// update the current object's Address
		this.Address = uAddress;
	};	
	this.setName = function(uName){
		// update the current object's Name
		this.Name = uName;
	}
	this.setPassword = function(uPassw){
		// update the current object's Password
		this.Password = uPassw;
	}

	// getter methods (behaviour)
	//		
	this.getAddress = function(){
		// return the current object's Address
		return this.Address;
	}	

	this.getName = function(){
		// update the current object's Name
		return this.Name;
	};	
	
	this.getPassword = function(){
		// return the current object's Password
		return this.Password;
	}  
}	// e/o constructor

