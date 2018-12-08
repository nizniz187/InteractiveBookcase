var Spiral = {
	init:function(){
		//set attributes from setting
		this.bookWidth = Setting.spiralBookWidth ? Setting.spiralBookWidth : this.bookWidth;
		this.bookHeight = Setting.spiralBookHeight ? Setting.spiralBookHeight : this.bookHeight;
		this.bookOriginX = (innerWidth - this.bookWidth) / 2;
		this.bookOriginY = (innerHeight - this.bookHeight) / 2;
		this.frontAmount = (Setting && Setting.frontAmount) ? Setting.frontAmount : Math.ceil(innerWidth / this.bookWidth * 2);
		this.threadPitch = (Setting && Setting.threadPitch) ? Setting.threadPitch : this.threadPitch;
		this.bookMarginY = this.threadPitch / (this.frontAmount * 2 - 1);
		this.bookMarginRotate = 1 / (this.frontAmount - 1) * 180;
		this.bookTranslateRatio = this.bookMarginY / this.bookMarginRotate;
		this.bookOpacityOffset = 1 / this.frontAmount / 2;
		this.bookOpacityEnd = 1 - (this.frontAmount - 1) * this.bookOpacityOffset;
		this.radius = (Setting && Setting.radius) ? Setting.radius : innerWidth / 2;
		this.eventSensitivity = (Setting && Setting.eventSensitivity) ? Setting.eventSensitivity : this.eventSensitivity;
		this.autoRotateSpeed = (Setting && Setting.animationSpeed && Setting.animationSpeed.relative && Setting.animationSpeed.relative.autoRotate) ? Setting.animationSpeed.relative.autoRotate : this.autoRotateSpeed;
		
		//bind event listener with this obj
		this.eventRotateStart = this.eventRotateStart.bind(this);
		this.eventRotate = this.eventRotate.bind(this);
		this.eventRotateEnd = this.eventRotateEnd.bind(this);
	},
	//set spiral formation
	arrange:function(){
		displayModel = this;
	
		var book;
		var zIndex = this.frontAmount;
		var opacity = 1;
		var rotateY = 0;
		var translateY = 0;
		for(var i = 0; i < Book.list.length; i++){
			Book.setBook(Book.list[i], {rotateY:rotateY, translateX:0, translateY:translateY, translateZ:0, update:true}, zIndex, opacity);
			
			if(i == Book.list.length - 1){
				this.lastRotateY = rotateY;
				this.lastTranslateY = translateY;
			}
			
			if(Math.floor(i / (this.frontAmount - 1)) % 2 == 0){
				zIndex--;
				opacity -= this.bookOpacityOffset;
			}else{
				zIndex++;
				opacity += this.bookOpacityOffset;
			}
			translateY += this.bookMarginY;
			rotateY = rotateY - this.bookMarginRotate;
		}
		
		Book.initBooks(this);
	},
	//arrange book transform toward spiral formation
	arrangeBook:function(book, centerBook, rotateYOffset, translateYOffset){
		var rotateY = this.getBookRotateY(book, centerBook);
		rotateY = rotateYOffset == undefined ? rotateY : getUpdateValue(book.rotateY, rotateYOffset, rotateY);
		var translateY = this.getBookTranslateY(book, centerBook);
		translateY = translateYOffset == undefined ? translateY : getUpdateValue(book.translateY, translateYOffset, translateY);
		var zIndex = this.getBookZIndex(rotateY);
		var opacity = this.getBookOpacity(rotateY);
		
		Book.setBook(book, {rotateY:rotateY, translateY:translateY, update:true}, zIndex, opacity);
	},
	//set book transform toward specific origin
	resetBook:function(book, rotateYOffset, translateYOffset, translateOrigin){
		var rotateY = rotateYOffset == undefined ? 0 : getUpdateValue(book.rotateY, rotateYOffset, 0);
		var translateY = translateYOffset == undefined ? translateOrigin : getUpdateValue(book.translateY, translateYOffset, translateOrigin);
		
		if(book.rotateY == 0){
			Book.setBook(book, {translateY:translateY, update:true});
		}else{
			Book.setBook(book, {rotateY:rotateY, translateY:translateY, update:true}, this.getBookZIndex(rotateY), this.getBookOpacity(rotateY));
		}
	},
	//rotate by assigned rotation degree & translation distance
	rotate:function(rotate, translate){
		var book;
		for(var i = 0; i < Book.list.length; i++){
			book = Book.list[i];
			
			var rotateY = formatNumber(book.rotateY + rotate);
			var translateY = book.translateY + translate;
			book.style.webkitTransform = "rotateY(" + rotateY + "deg) translateY(" + translateY + "px)";
			Book.setBook(book, null, this.getBookZIndex(rotateY), this.getBookOpacity(rotateY));
		}
	},
	//auto rotate assigned book to center
	autoRotate:function(book, callback){
		var rotateToCenter = function(){
			if(book.rotateY == 0){
				clearInterval(animationTimer);
				if(callback){
					callback(book);
				}
				return;
			}
			
			var rotateY = getUpdateOffset(book.rotateY, animationSpeed * Spiral.autoRotateSpeed, 0);
			var translateY = -rotateY * Spiral.bookTranslateRatio;
			
			Spiral.rotate(rotateY, translateY);
			Book.updateBooksTransform(rotateY, 0, translateY, 0);
		}
		animationTimer = setInterval(rotateToCenter, animationInterval);
	},
	//auto demo mode
	demo:function(){
		var demonstrate = function(){
			var rotateY = demoDirection * demoSpeed / 10;
			var translateY = -rotateY * Spiral.bookTranslateRatio;
			if(rotateY < 0 && Book.list[0].translateY + translateY > 0){
				rotateY = -Book.list[0].rotateY;
				translateY = -Book.list[0].translateY;
				demoDirection *= -1;
			}else if(rotateY > 0 && Book.list[Book.list.length - 1].translateY + translateY < 0){
				rotateY = -Book.list[Book.list.length - 1].rotateY;
				translateY = -Book.list[Book.list.length - 1].translateY;
				demoDirection *= -1;
			}
			Spiral.rotate(rotateY, translateY);
			Book.updateBooksTransform(rotateY, 0, translateY, 0);
		}
		animationTimer = setInterval(demonstrate, animationInterval);
	},
	//get book rotate Y value
	getBookRotateY:function(book, centerBook){
		return formatNumber((centerBook.index - book.index) * this.bookMarginRotate);
	},
	//get book translate Y value
	getBookTranslateY:function(book, centerBook){
		return formatNumber((book.index - centerBook.index) * this.bookMarginY);
	},
	//get book z-index value by given rotate Y
	getBookZIndex:function(rotateY){
		var rotate = formatNumber(Math.abs(rotateY) % 360 + this.bookMarginRotate / 2);
		if(rotate <= 180){
			return this.frontAmount - Math.ceil(rotate / this.bookMarginRotate);
		}else{
			return Math.floor((rotate - 180) / this.bookMarginRotate);
		}
	},
	//get book opacity value by given rotate Y
	getBookOpacity:function(rotateY){
		var rotate = formatNumber(Math.abs(rotateY) % 360 + this.bookMarginRotate / 2);
		if(rotate <= 180){
			return 1 - Math.ceil(rotate / this.bookMarginRotate) * this.bookOpacityOffset;
		}else{
			return this.bookOpacityEnd + Math.floor((rotate - 180) / this.bookMarginRotate) * this.bookOpacityOffset;
		}
	},
	//for event mousedown & touchdown
	eventRotateStart:function(e){
		e.preventDefault();
		
		clearInterval(animationTimer);
		clearInterval(demoTimer);
		eventStartX = e.clientX || e.changedTouches[0].pageX;
		document.addEventListener("mousemove", this.eventRotate);
		document.addEventListener("touchmove", this.eventRotate);
	},
	//for event mousemove & touchmove
	eventRotate:function(e){
		e.preventDefault();
		
		var x = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		if(x == eventStartX){return;}
		
		var rotateY = (x - eventStartX) * this.eventSensitivity;
		var translateY = -rotateY * this.bookTranslateRatio;
		if(rotateY < 0 && Book.list[0].translateY + translateY > 0){
			rotateY = -Book.list[0].rotateY;
			translateY = -Book.list[0].translateY;
		}else if(rotateY > 0 && Book.list[Book.list.length - 1].translateY + translateY < 0){
			rotateY = -Book.list[Book.list.length - 1].rotateY;
			translateY = -Book.list[Book.list.length - 1].translateY;
		}
		this.rotate(rotateY, translateY);
		this.eventRotateRotate = rotateY;
		this.eventRotateTranslate = translateY;
	},
	//for event mouseup & touchend & touchcancel
	eventRotateEnd:function(e){
		e.preventDefault();
		
		var endX = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		document.removeEventListener("mousemove", this.eventRotate);
		document.removeEventListener("touchmove", this.eventRotate);
		if(eventStartX != endX){
			Book.updateBooksTransform(this.eventRotateRotate, 0, this.eventRotateTranslate, 0);
		}
		setDemo();
	},
	//add all relavant events
	addEvents:function(){		
		document.addEventListener("mousedown", this.eventRotateStart);
		document.addEventListener("touchstart", this.eventRotateStart);
		document.addEventListener("mouseup", this.eventRotateEnd);
		document.addEventListener("touchend", this.eventRotateEnd);
		document.addEventListener("touchcancel", this.eventRotateEnd);
		
		Book.addBooksEvent("dblclick", changeDisplayModel);
		Book.addBooksEvent("touchend", changeDisplayModel);
		
		document.removeEventListener("mousedown", eventPreventDefault);
		document.removeEventListener("touchstart", eventPreventDefault);
		document.removeEventListener("touchmove", eventPreventDefault);
	},
	//remove all relavant events
	removeEvents:function(){
		document.addEventListener("mousedown", eventPreventDefault);
		document.addEventListener("touchstart", eventPreventDefault);
		document.addEventListener("touchmove", eventPreventDefault);
		
		document.removeEventListener("mousedown", this.eventRotateStart);
		document.removeEventListener("touchstart", this.eventRotateStart);
		document.removeEventListener("mousemove", this.eventRotate);
		document.removeEventListener("touchmove", this.eventRotate);
		document.removeEventListener("mouseup", this.eventRotateEnd);
		document.removeEventListener("touchend", this.eventRotateEnd);
		document.removeEventListener("touchcancel", this.eventRotateEnd);
				
		Book.removeBooksEvent("dblclick", changeDisplayModel);
		Book.removeBooksEvent("touchend", changeDisplayModel);
	},
	
	bookWidth:150,
	bookHeight:180,
	threadPitch:300,
	eventSensitivity:0.3,
	autoRotateSpeed:1,
};