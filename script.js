var displayModel;
var animationTimer;
var animationSpeed = 5;
var animationInterval = 10;
var eventSensitivity = 0.3;
var eventStartX;
var demoTimer;
var demoIdle = 60;
var demoCounter;
var demoSpeed = 1;
var demoDirection = 1;

//dynamic load js sources
loadJSSource("Setting.js");
loadJSSource("js/Book.js");
loadJSSource("js/Spiral.js");
loadJSSource("js/Line.js");
loadJSSource("js/EBook.js");
loadJSSource("js/thumbnail_list.js");

function init(){
	//set attributes from setting
	animationSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.general) ? Setting.animationSpeed.general : animationSpeed;
	eventSensitivity = (Setting && Setting.eventSensitivity) ? Setting.eventSensitivity : eventSensitivity;
	demoIdle = (Setting && Setting.demoIdle) ? Setting.demoIdle : demoIdle;
	demoSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.relative && Setting.animationSpeed.relative.demo) ? Setting.animationSpeed.relative.demo : demoSpeed;

	//initialize objects
	Spiral.init();
	Line.init();
	Book.init(thumbnail_list);
	EBook.init();
	
	//set default display model to spiral
	Spiral.arrange();
	Spiral.addEvents();
	
	//disable mouse wheel event
	document.addEventListener("mousewheel", eventPreventDefault);
	
	//set demo timer to tick
	setDemo();
}

//dynamic load js source
//source: file name
function loadJSSource(source){
	if(!source){return;}
	
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = source;
	document.getElementsByTagName("head")[0].appendChild(script);
}

//change display model
function changeDisplayModel(e){
	e.preventDefault();
	if(e.changedTouches && e.changedTouches[0].pageX != undefined && eventStartX != e.changedTouches[0].pageX){return;}
	
	clearInterval(animationTimer);
	clearInterval(demoTimer);
	if(displayModel == Spiral){
		Spiral.removeEvents();
		Line.centerBook = this;
		Spiral.autoRotate(this, transformToLine);
	}else{
		Line.removeEvents();
		transformToSpiral(Line.centerBook);
	}
	
	e.stopPropagation();
}

//transform spiral to line formation
function transformToLine(centerBook){
	showSection(centerBook.section);

	var transformSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.relative && Setting.animationSpeed.relative.transformToLine) ? Setting.animationSpeed.relative.transformToLine : 1;
	
	var offsetRatio = Math.abs(Spiral.lastRotateY) / animationSpeed / transformSpeed;
	var rotateYOffset = Math.abs(Spiral.lastRotateY) / offsetRatio;
	var translateXOffset = (Line.bookMarginX * (Book.list.length - 1)) / offsetRatio;
	var translateYOffset = (Spiral.lastTranslateY - Line.bookTranslateY) / offsetRatio;
	var translateZOffset = (Line.bookMarginZ * (Book.list.length - 1)) / offsetRatio;
	var animationLimit = Math.floor(innerWidth / Line.bookMarginX) + Spiral.frontAmount;
	
	var books = new Array();
	for(var i = 0; i < Book.list.length; i++){
		books.push(Book.list[i]);
	}
	var animate = function(){
		//set book transform
		var newArray = new Array();
		for(var i = 0; i < books.length; i++){
			var complete = true;
			//reset spiral
			if(books[i].rotateY != 0 || books[i].translateY != Line.bookTranslateY){
				Spiral.resetBook(books[i], rotateYOffset, translateYOffset, Line.bookTranslateY);
				complete = false;
			}
			
			//arrange line
			if(books[i].translateX != Line.getBookTranslateX(books[i]) || books[i].translateZ != Line.getBookTranslateZ(books[i])){
				Line.arrangeBook(books[i], translateXOffset, translateZOffset);
				complete = false;
			}
			
			if(!complete){
				newArray.push(books[i]);
			}else{
				books[i].style.opacity = Line.getBookOpacity(books[i].translateZ);
				Book.showInfo();
			}
		}
		books = newArray;
		
		//stop animation
		if(Book.list.length - books.length >= animationLimit){
			for(var i = 0; i < books.length; i++){
				Spiral.resetBook(books[i], null, null, Line.bookTranslateY);
				Line.arrangeBook(books[i]);
				books[i].style.opacity = Line.getBookOpacity(books[i].translateZ);
			}
			Book.showInfo();
			books = new Array();
		}
		if(books.length == 0){
			clearInterval(animationTimer);
			displayModel = Line;
			Line.addEvents();
			setDemo();
		}
	}
	
	Book.setBook(centerBook, null, Book.list.length, 1);
	Book.setInfo(centerBook);
	
	animationTimer = setInterval(animate, animationInterval);
	
	Book.initBooks(Line);
	document.body.style.webkitPerspectiveOrigin = "center " + (innerHeight / 2 + Line.bookTranslateY) + "px";
}

//transform line to spiral formation
function transformToSpiral(centerBook){
	showSection();

	var transformSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.relative && Setting.animationSpeed.relative.transformToSpiral) ? Setting.animationSpeed.relative.transformToSpiral : 1;
	
	var offsetRatio = Math.abs(Spiral.lastRotateY) / animationSpeed / transformSpeed;
	var rotateYOffset = Math.abs(Spiral.lastRotateY) / offsetRatio;
	var translateXOffset = (Line.bookMarginX * (Book.list.length - 1)) / offsetRatio;
	var translateYOffset = (Spiral.lastTranslateY - Line.bookTranslateY) / offsetRatio;
	var translateZOffset = (Line.bookMarginZ * (Book.list.length - 1)) / offsetRatio;
	var animationLimit = Math.floor(innerHeight / Spiral.bookMarginY);
	
	var books = new Array();
	for(var i = 0; i < Book.list.length; i++){
		books.push(Book.list[i]);
	}
	var animate = function(){
		//set book transform
		var newArray = new Array();
		for(var i = 0; i < books.length; i++){
			var complete = true;
			
			//reset line
			if(books[i].translateX != 0 || books[i].translateZ != 0){
				Line.resetBook(books[i], translateXOffset, translateZOffset);
				complete = false;
			}
			
			//arrange spiral
			if(books[i].rotateY != Spiral.getBookRotateY(books[i], centerBook) || books[i].translateY != Spiral.getBookTranslateY(books[i], centerBook)){
				Spiral.arrangeBook(books[i], centerBook, rotateYOffset, translateYOffset);
				complete = false;
			}
			
			if(!complete){
				newArray.push(books[i]);
			}else{
				Book.hideInfo();
			}
		}
		books = newArray;
		
		//stop animation
		if(Book.list.length - books.length >= animationLimit){
			for(var i = 0; i < books.length; i++){
				Line.resetBook(books[i]);
				Spiral.arrangeBook(books[i], centerBook);
			}
			books = new Array();
		}
		if(books.length == 0){
			clearInterval(animationTimer);
			displayModel = Spiral;
			Spiral.addEvents();
			setDemo();
		}
	}
	Book.hideInfo();
	
	animationTimer = setInterval(animate, animationInterval);
	
	Book.initBooks(Spiral);
	document.body.style.webkitPerspectiveOrigin = "center center";
}

//move book to center & show ebook in Line model
function openEBook(e){
	if(e.changedTouches && e.changedTouches[0].pageX != undefined && eventStartX != e.changedTouches[0].pageX){return;}
	
	clearInterval(demoTimer);
	clearInterval(animationTimer);
	Line.removeEvents();
	Line.autoSlide(this, function(book){EBook.open(book);});
	e.stopPropagation();
	
	EBook.addEvents();
}
//close ebook
function closeEBook(e){
	if(e.changedTouches && e.changedTouches[0].pageX != undefined && eventStartX != e.changedTouches[0].pageX){return;}
	
	EBook.removeEvents();
	EBook.close();
	Line.addEvents();
	
	setDemo();
}

//set demo timer to tick
function setDemo(){
	demoCount = 0;
	var count = function(){
		demoCount++;
		if(demoCount == demoIdle){
			if(displayModel == Spiral){
				Spiral.demo();
			}else{
				Line.demo();
			}
			clearInterval(demoTimer);
		}
	}
	clearInterval(demoTimer);
	demoTimer = setInterval(count, 1000);
}

//calculate updated value after moving
//value: value to be calulated; offset: movement offset; target: destination value
//return: calulated value
var getUpdateValue = function(value, offset, target){
	var result;
	if(value > target){
		result = value - offset;
		if(result < target){return target;}
		return result;
	}else if(value < target){
		result = value + offset;
		if(result > target){return target;}
		return result;
	}
	return target;
}

//calculate updated offset for moving
//value: value to be calulated; offset: movement offset; target: destination value
//return: calulated value
var getUpdateOffset = function(value, offset, target){
	if(value > target){
		if(value - offset < target){
			return target - value;
		}
		return -offset;
	}else if(value < target){
		if(value + offset > target){
			return target - value;
		}
		return offset;
	}
	return 0;
}

//get available value with given min & max bound
//value: value to be checked; min: minimum lower bound; max: maximum upper bound
//return: available value
var getAvailValue = function(value, min, max){
	if(typeof(value) != "number" || typeof(min) != "number" || typeof(max) != "number" || max < min){return value;}
	return Math.max(Math.min(value, max), min);
}

//format number to avoid exponential expression
function formatNumber(rotate){
	return Number(rotate.toPrecision(9));
}

//prevent default event
function eventPreventDefault(e){
	e.preventDefault();
}

//show section assigned only, otherwise show all of them
function showSection(section){
	section = section != 0 && !section ? -1 : section;
	
	var book;
	for(var i = 0; i < Book.list.length; i++){
		book = Book.list[i];
		if(section == -1 || book.section == section){
			book.style.display = "block";
		}else{
			book.style.display = "none";
		}
	}
}