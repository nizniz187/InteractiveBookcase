var Line = {
	init:function(){
		//set attributes from setting
		this.bookWidth = Setting.lineBookWidth ? Setting.lineBookWidth : this.bookWidth;
		this.bookHeight = Setting.lineBookHeight ? Setting.lineBookHeight : this.bookHeight;
		this.bookOriginX = (innerWidth - this.bookWidth) / 2;
		this.bookOriginY = (innerHeight - this.bookHeight) / 2;
		this.bookMarginX = Setting.bookMarginX ? Setting.bookMarginX : this.bookWidth * 0.8;
		this.bookMarginZ = Setting.bookMarginZ ? Setting.bookMarginZ : this.bookMarginZ;
		this.bookMarginRatio = this.bookMarginZ / this.bookMarginX;
		this.bookTranslateY = -this.bookHeight / 2 - 20;
		this.bookOpacityOffset = 0.3 / Math.ceil(innerWidth / this.bookWidth - 1);
		this.autoSlideSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.relative && Setting.animationSpeed.relative.autoSlide) ? Setting.animationSpeed.relative.autoSlide : this.autoSlideSpeed;
		
		//bind event listener with this obj
		this.eventSlideStart = this.eventSlideStart.bind(this);
		this.eventSlide = this.eventSlide.bind(this);
		this.eventSlideEnd = this.eventSlideEnd.bind(this);
	},
	//arrange book transform toward line formation
	arrangeBook:function(book, translateXOffset, translateZOffset){
		var translateX = this.getBookTranslateX(book);
		translateX = translateXOffset == undefined ? translateX : getUpdateValue(book.translateX, translateXOffset, translateX);
		var translateZ = this.getBookTranslateZ(book)
		translateZ = translateZOffset == undefined ? translateZ : getUpdateValue(book.translateZ, translateZOffset, translateZ);
		var zIndex = Book.list.length - Math.abs(book.index - this.centerBook.index);
		Book.setBook(book, {translateX:translateX, translateZ:translateZ, update:true}, zIndex);
	},
	//set book transform toward origin
	resetBook:function(book, translateXOffset, translateZOffset){
		var translateX = translateXOffset == undefined ? 0 : getUpdateValue(book.translateX, translateXOffset, 0);
		var translateZ = translateZOffset == undefined ? 0 : getUpdateValue(book.translateZ, translateZOffset, 0);
		
		Book.setBook(book, {translateX:translateX, translateZ:translateZ, update:true});
	},
	//slide assigned translation x & z
	slide:function(tx, tz){
		var book;
		var translateX, translateZ, opacity;
		var center;
		for(var i = 0; i < Book.list.length; i++){
			book = Book.list[i];
			translateX = book.translateX + tx;
			if(tx >= 0){
				if(book.translateX >= 0){
					translateZ = book.translateZ - tz;
				}else{
					translateZ = book.translateZ + tz;
				}
			}else{
				if(book.translateX <= 0){
					translateZ = book.translateZ - tz;
				}else{
					translateZ = book.translateZ + tz;
				}
			}
			translateZ = translateZ > 0 ? -translateZ : translateZ;
			opacity = this.getBookOpacity(translateZ);
			Book.setBook(book, {translateX:translateX, translateZ:translateZ}, Math.floor(translateZ), opacity);
			
			if(i == 0 || parseInt(book.style.zIndex) >= parseInt(Book.list[i - 1].style.zIndex)){
				this.centerBook = book;
			}
		}
		Book.setInfo(this.centerBook);
	},
	//auto slide assigned book to center
	autoSlide:function(book, callback){
		var slideToCenter = function(){
			if(book.translateX == 0){
				clearInterval(animationTimer);
				callback(book);
				return;
			}
			
			var translateX = getUpdateOffset(book.translateX, animationSpeed * Line.autoSlideSpeed, 0);
			var translateZ = Math.abs(translateX * Line.bookMarginRatio);
			
			Line.slide(translateX, translateZ);
			Book.updateBooksTransform(0, translateX, 0, translateZ);
		}
		animationTimer = setInterval(slideToCenter, animationInterval);
	},
	//auto demo mode
	demo:function(){
		var demonstrate = function(){
			var translateX = demoDirection * demoSpeed;
			var cb = Line.centerBook;
			if(translateX < 0 && Book.list[0].translateX + translateX < 0){
				translateX = -Book.list[0].translateX;
				demoDirection *= -1;
			}else if(translateX > 0 && Book.list[Book.list.length - 1].translateX + translateX > 0){
				translateX = -Book.list[Book.list.length - 1].translateX;
				demoDirection *= -1;
			}else if(translateX < 0 && cb.translateX + translateX < 0 && cb.section != Book.list[cb.index - 1].section){
				translateX = -Line.centerBook.translateX;
				demoDirection *= -1;
			}else if(translateX > 0 && cb.translateX + translateX > 0 && cb.section != Book.list[cb.index + 1].section){
				translateX = -Line.centerBook.translateX;
				demoDirection *= -1;
			}
			var translateZ = Math.abs(translateX * Line.bookMarginRatio);
			Line.slide(translateX, translateZ);
			Book.updateBooksTransform(0, translateX, 0, translateZ);
		}
		animationTimer = setInterval(demonstrate, animationInterval);
	},
	//get center book object
	getCenterBook:function(){
		var centerBook = Book.list[0];
		for(var i = 1; i < Book.list.length; i++){
			centerBook = Math.abs(Book.list[i].translateX) < Math.abs(centerBook.translateX) ? Book.list[i] : centerBook;
		}
		return centerBook;
	},
	//get book translate x value
	getBookTranslateX:function(book, centerBook){
		return formatNumber((this.centerBook.index - book.index) * this.bookMarginX);
	},
	//get book translate z value
	getBookTranslateZ:function(book, centerBook){
		return formatNumber(Math.abs(this.centerBook.index - book.index) * -this.bookMarginZ);
	},
	//get book opacity value by given translate z
	getBookOpacity:function(translateZ){
		return 1 + (translateZ / this.bookMarginZ * this.bookOpacityOffset);
	},
	//for event mousedown & touchdown
	eventSlideStart:function(e){
		e.preventDefault();
		
		clearInterval(animationTimer);
		clearInterval(demoTimer);
		eventStartX = e.clientX || e.changedTouches[0].pageX;
		document.addEventListener("mousemove", this.eventSlide);
		document.addEventListener("touchmove", this.eventSlide);
	},
	//for event mousemove & touchmove
	eventSlide:function(e){
		e.preventDefault();
		
		var x = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		if(x == eventStartX){return;}
		
		var translateX = (x - eventStartX) * eventSensitivity * 5;
		var cb = this.centerBook;
		if(translateX < 0 && Book.list[0].translateX + translateX < 0){
			translateX = -Book.list[0].translateX;
		}else if(translateX > 0 && Book.list[Book.list.length - 1].translateX + translateX > 0){
			translateX = -Book.list[Book.list.length - 1].translateX;
		}else if(translateX < 0 && cb.translateX + translateX < 0 && cb.section != Book.list[cb.index - 1].section){
			translateX = -this.centerBook.translateX;
			demoDirection *= -1;
		}else if(translateX > 0 && cb.translateX + translateX > 0 && cb.section != Book.list[cb.index + 1].section){
			translateX = -this.centerBook.translateX;
			demoDirection *= -1;
		}
		var translateZ = Math.abs(translateX * this.bookMarginRatio);
		this.slide(translateX, translateZ);
		this.eventSlideX = translateX;
		this.eventSlideZ = translateZ;
	},
	//for event mouseup & touchend & touchcancel
	eventSlideEnd:function(e){
		e.preventDefault();
		if(eventStartX == undefined){return;}
		
		var endX = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		document.removeEventListener("mousemove", this.eventSlide);
		document.removeEventListener("touchmove", this.eventSlide);
		if(eventStartX != endX && this.eventSlideX != undefined && this.eventSlideZ != undefined){
			Book.updateBooksTransform(0, this.eventSlideX, 0, this.eventSlideZ);
		}
		setDemo();
	},
	//add all relavant events
	addEvents:function(){		
		document.addEventListener("mousedown", this.eventSlideStart);		
		document.addEventListener("touchstart", this.eventSlideStart);
		document.addEventListener("mouseup", this.eventSlideEnd);
		document.addEventListener("touchend", this.eventSlideEnd);
		document.addEventListener("touchcancel", this.eventSlideEnd);
		
		document.addEventListener("dblclick", changeDisplayModel);
		document.addEventListener("touchend", changeDisplayModel);
		Book.addBooksEvent("dblclick", openEBook);
		Book.addBooksEvent("touchend", openEBook);
		
		document.removeEventListener("mousedown", eventPreventDefault);
		document.removeEventListener("touchstart", eventPreventDefault);
		document.removeEventListener("touchmove", eventPreventDefault);
	},
	//remove all relavant events
	removeEvents:function(){
		document.addEventListener("mousedown", eventPreventDefault);
		document.addEventListener("touchstart", eventPreventDefault);
		document.addEventListener("touchmove", eventPreventDefault);
		
		document.removeEventListener("mousedown", this.eventSlideStart);
		document.removeEventListener("touchstart", this.eventSlideStart);
		document.removeEventListener("mousemove", this.eventSlide);
		document.removeEventListener("touchmove", this.eventSlide);
		document.removeEventListener("mouseup", this.eventSlideEnd);
		document.removeEventListener("touchend", this.eventSlideEnd);
		document.removeEventListener("touchcancel", this.eventSlideEnd);		
		
		document.removeEventListener("dblclick", changeDisplayModel);
		document.removeEventListener("touchend", changeDisplayModel);
		Book.removeBooksEvent("dblclick", openEBook);
		Book.removeBooksEvent("touchend", openEBook);
	},
	
	bookWidth:225,
	bookHeight:270,
	bookMarginX:200,
	bookMarginZ:200,
	autoSlideSpeed:5
};