var EBook = {
	init:function(){
		//initialize mask
		this.mask = document.createElement("div");
		this.mask.id = "mask";
		this.mask.addEventListener("mousedown", eventPreventDefault);
		document.body.appendChild(this.mask);
		
		//set attributes from setting
		if(innerWidth >= innerHeight){
			this.bookWidth = innerWidth * 0.8;
			this.bookHeight = this.bookWidth / 2 / 3 * 4;
		}else{
			this.bookHeight = innerHeight * 0.8;
			this.bookWidth = this.bookHeight / 4 * 3 * 2;
		}
		this.bookWidth = Setting.ebookWidth ? Setting.ebookWidth : this.bookWidth;
		this.bookHeight = Setting.ebookHeight ? Setting.ebookHeight : this.bookHeight;
		
		//bind event listener with this obj
		this.eventFlipStart = this.eventFlipStart.bind(this);
		this.eventFlip = this.eventFlip.bind(this);
		this.eventFlipEnd = this.eventFlipEnd.bind(this);
		this.eventProgressBarChangeStart = this.eventProgressBarChangeStart.bind(this);
		this.eventProgressBarChange = this.eventProgressBarChange.bind(this);
		this.eventProgressBarChangeEnd = this.eventProgressBarChangeEnd.bind(this);
		
		//initialize ebook div
		this.ebook = document.createElement("div");
		this.ebook.id = "ebook";
		this.ebook.style.width = this.bookWidth + "px";
		this.ebook.style.height = this.bookHeight + "px";
		this.ebook.style.left = (innerWidth - this.bookWidth) / 2 + "px";
		this.ebook.style.top = (innerHeight - this.bookHeight) / 2 + "px";
		this.ebook.addEventListener("mousedown", this.eventFlipStart);
		this.ebook.addEventListener("touchstart", this.eventFlipStart);
		document.body.appendChild(this.ebook);
		
		//initialize ebook progress bar
		this.progressBar = document.createElement("div");
		this.progressBar.id = "ebook-progress-bar";
		this.progressBar.min = 1;
		this.progressBar.offsetLeft = (innerWidth - this.bookWidth) / 2;
		this.progressBar.style.width = this.bookWidth + "px";
		this.progressBar.style.left = this.ebook.style.left;
		this.progressBar.style.top = (innerHeight - this.bookHeight) / 2 + this.bookHeight + 20 + "px";
		this.progressBar.controller = document.createElement("div");
		this.progressBar.pageInfo = document.createElement("span");
		this.progressBar.appendChild(document.createElement("div"));
		this.progressBar.appendChild(this.progressBar.controller);
		this.progressBar.appendChild(this.progressBar.pageInfo);
		this.progressBar.addEventListener("mousedown", this.eventProgressBarChangeStart);
		this.progressBar.addEventListener("touchstart", this.eventProgressBarChangeStart);
		document.body.appendChild(this.progressBar);
	},
	//open book
	open:function(book){
		if(!book.page){
			book.page = 0;
		}
	
		this.mask.style.display = "block";
		this.ebook.style.display = "block";
		this.progressBar.style.display = "block";
		this.ebook.style.backgroundColor = book.style.backgroundColor;
		this.pageList = new Array(book.page + book.page % 2);
		this.flipRevert = book.flip == "left";
		this.currentPage = 0;
		this.progressBar.max = Math.ceil(this.pageList.length / 2) + 1;
		this.progressBar.step = this.bookWidth / (this.progressBar.max - this.progressBar.min);
		this.setProgress(0);
		
		if(book.page == 0){return;}
		
		var page, image, translateX, translateZ;
		var width = this.bookWidth / 2 - this.translateXOffset * 10;
		var height = this.bookHeight - this.translateXOffset * 10;
		var offsetLeft = this.bookWidth / 2 - width;
		var offsetTop = (this.bookHeight - height) / 2;
		this.topZIndex = 210 + book.page;
		this.topTranslateZ = this.translateZOffset * 10;
		for(var i = 0; i < this.pageList.length; i++){			
			page = document.createElement("div");
			page.className = "page";
			page.index = i;
			page.style.width = width + "px";
			page.style.height = height + "px";
			page.style.top = offsetTop + "px";
			if(this.flipRevert){
				if(i % 2 == 0){
					page.style.left = this.bookWidth / 2 + "px";
					page.style.webkitTransformOrigin = "0% 50% 0px";
					page.rotateY = 0;
				}else{
					page.style.left = offsetLeft + "px";
					page.style.webkitTransformOrigin = "100% 50% 0px";
					page.rotateY = 180;
				}
			}else{
				if(i % 2 == 0){
					page.style.left = offsetLeft + "px";
					page.style.webkitTransformOrigin = "100% 50% 0px";
					page.rotateY = 0;
				}else{
					page.style.left = this.bookWidth / 2 + "px";
					page.style.webkitTransformOrigin = "0% 50% 0px";
					page.rotateY = -180;
				}
			}
			
			if(i < book.page){
				image = document.createElement("img");
				//image.src = "image/data/" + book.data + "/" + (i + 1) + ".jpg";
				image.src = "image/data/demo/" + (i % 5 + 1) + ".jpg";
				page.appendChild(image);
			}
			this.ebook.appendChild(page);
			this.pageList[i] = page;
		}
		this.arrangeZIndex(0);
		this.arrangeTranslate(0);
	},
	//hide ebook & remove ebook pages
	close:function(){
		this.mask.style.display = "none";
		this.ebook.style.display = "none";
		this.progressBar.style.display = "none";
		
		for(var i = 0; i < this.pageList.length; i++){
			if(this.pageList[i]){
				this.ebook.removeChild(this.pageList[i]);
			}
		}
		this.pageList = null;
	},
	//set transform style by given page & transform values
	setTransform:function(page, translateX, translateZ, rotateY){
		this.pageList[page].translateX = translateX == undefined ? this.pageList[page].translateX : translateX;
		this.pageList[page].translateZ = translateZ == undefined ? this.pageList[page].translateZ : translateZ;
		this.pageList[page].rotateY = rotateY == undefined ? this.pageList[page].rotateY : rotateY;
		this.pageList[page].style.webkitTransform = "translateX(" + this.pageList[page].translateX + "px) translateZ(" + this.pageList[page].translateZ + "px) rotateY(" + this.pageList[page].rotateY + "deg)";
	},
	//flip given page to given degree
	flip:function(page, rotateY){
		if(!this.pageList || !this.pageList[page]){return;}
	
		this.setTransform(page, null, null, rotateY);
		if(page % 2 == 0){
			if(page != this.pageList.length - 1){
				this.setTransform(page + 1, null, null, this.flipRevert ? rotateY + 180 : rotateY - 180);
			}
			if(this.flipRevert){
				this.currentPage = rotateY < -90 ? page + 1 : page;
			}else{
				this.currentPage = rotateY < 90 ? page : page + 1;
			}
		}else{
			if(page != 0){
				this.setTransform(page - 1, null, null, this.flipRevert ? rotateY - 180 : rotateY + 180);
			}
			if(this.flipRevert){
				this.currentPage = rotateY > 90 ? page - 1 : page;
			}else{
				this.currentPage = rotateY > -90 ? page : page - 1;
			}
		}
		this.arrangeZIndex(this.currentPage);
		this.arrangeTranslate(this.currentPage);
	},
	//auto flip given page to given degree
	autoFlip:function(page, rotate){
		if(!this.pageList || !this.pageList[page]){return;}
	
		this.removeEvents();
		var flipPage = function(){
			this.flip(page, getUpdateValue(this.pageList[page].rotateY, 2, rotate));
			if(this.pageList[page].rotateY == rotate){
				clearInterval(this.pageList[page].animationTimer);
				this.arrangeTranslate(this.currentPage);
				this.addEvents();
			}
		}
		
		//clear interval before setting a new one
		clearInterval(this.pageList[page].animationTimer);
		if(page % 2 == 0 && this.pageList[page + 1]){
			clearInterval(this.pageList[page + 1].animationTimer);
		}else if(page % 2 == 1 && this.pageList[page - 1]){
			clearInterval(this.pageList[page - 1].animationTimer);
		}		
		this.pageList[page].animationTimer = setInterval(flipPage.bind(this), animationInterval);
	},
	//auto flip to given page
	autoFlipTo:function(page){
		var order = 0;
		var progress = (this.progressBar.value - 1) * 2;
		if(page > progress){
			var degree = this.flipRevert ? 180 : -180;
			for(var i = 1; i < this.pageList.length; i+= 2){
				if(i <= page && this.pageList[i].rotateY != 0){
					(function(obj, p, o){setTimeout(function(){obj.autoFlip(p, 0)}, o * 50);})(this, i, order++);
				}else if(i > page && this.pageList[i].rotateY != degree){
					(function(obj, p, d, o){setTimeout(function(){obj.autoFlip(p, d)}, o * 50);})(this, i, degree, order++);
				}
			}
		}else if(page < progress){
			var degree = this.flipRevert ? -180 : 180;
			for(var i = (this.pageList.length % 2 == 0 ? this.pageList.length - 2 : this.pageList.length - 1); i >= 0; i-= 2){
				if(i >= page && this.pageList[i].rotateY != 0){
					(function(obj, p, o){setTimeout(function(){obj.autoFlip(p, 0)}, o * 50);})(this, i, order++);
				}else if(i < page && this.pageList[i].rotateY != degree){
					(function(obj, p, d, o){setTimeout(function(){obj.autoFlip(p, d)}, o * 50);})(this, i, degree, order++);
				}
			}
		}
	},
	//arrange z-index of pages with given top page
	arrangeZIndex:function(page){
		for(var i = 0; i < this.pageList.length; i++){
			this.pageList[i].style.zIndex = this.topZIndex - Math.abs(page - i);
		}
	},
	//arrange translate of pages with given top page
	arrangeTranslate:function(page){
		var offset = 0;
		var direction = this.flipRevert ? -1 : 1;
		for(var i = 0; i < this.pageList.length; i++){
			if(i < page - 3){
				offset = Math.floor((page - 4 - i) / 2);
			}else if(i > page + 4){
				offset = Math.floor((i - (page + 3)) / 2);
				direction = this.flipRevert ? 1 : -1;
			}
			offset = offset > 5 ? 5 : offset;
			this.setTransform(i, this.translateXOffset * offset * direction, this.topTranslateZ - this.translateZOffset * offset);
		}
	},
	//set progress bar to given page
	setProgress:function(page){
		page = page % 2 == 0 ? page : page + 1;
		var value = getAvailValue(page / 2 + 1, this.progressBar.min, this.progressBar.max);
		this.progressBar.value = value;
		this.progressBar.controller.style.left = this.flipRevert ? (value - 1) * this.progressBar.step - 7 + "px" : (this.progressBar.max - value) * this.progressBar.step - 7 + "px";
		this.progressBar.pageInfo.innerText = getAvailValue(page + 1, 1, this.pageList.length) + " / " + this.pageList.length;
	},
	//for event mousedown & touchdown
	eventFlipStart:function(e){
		e.preventDefault();
		
		eventStartX = e.clientX || e.changedTouches[0].pageX;
		if(eventStartX > innerWidth / 2){
			if(this.currentPage % 2 == 0 && !this.flipRevert){
				this.flipPage = this.currentPage - 1;
			}else if(this.currentPage % 2 != 0 && this.flipRevert){
				this.flipPage = this.currentPage + 1;
			}else{
				this.flipPage = this.currentPage;
			}
		}else{
			if(this.currentPage % 2 == 0 && this.flipRevert){
				this.flipPage = this.currentPage - 1;
			}else if(this.currentPage % 2 != 0 && !this.flipRevert){
				this.flipPage = this.currentPage + 1;
			}else{
				this.flipPage = this.currentPage;
			}
		}
		document.addEventListener("mousemove", this.eventFlip);
		document.addEventListener("touchmove", this.eventFlip);
		document.addEventListener("mouseup", this.eventFlipEnd);
		document.addEventListener("touchend", this.eventFlipEnd);
		document.addEventListener("touchcancel", this.eventFlipEnd);
		
		e.stopPropagation();
	},
	//for event mousemove & touchmove
	eventFlip:function(e){
		e.preventDefault();
		
		var x = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		if(x == eventStartX || this.flipPage < 0 || this.flipPage >= this.pageList.length){return;}
		
		var rotateY = (x - eventStartX) * 0.3;
		if(this.flipRevert){
			if(this.flipPage % 2 == 0){
				rotateY = getAvailValue(rotateY, -180, 0);
			}else{
				rotateY = getAvailValue(rotateY, 0, 180);
			}
		}else{
			if(this.flipPage % 2 == 0){
				rotateY = getAvailValue(rotateY, 0, 180);
			}else{
				rotateY = getAvailValue(rotateY, -180, 0);
			}
		}
		this.flip(this.flipPage, rotateY);
	},
	//for event mouseup & touchend & touchcancel
	eventFlipEnd:function(e){
		e.preventDefault();	
		var endX = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		
		document.removeEventListener("mousemove", this.eventFlip);
		document.removeEventListener("touchmove", this.eventFlip);
		document.removeEventListener("mouseup", this.eventFlipEnd);
		document.removeEventListener("touchend", this.eventFlipEnd);
		document.removeEventListener("touchcancel", this.eventFlipEnd);
		if(eventStartX == endX){return;}
		this.autoFlip(this.currentPage, 0);
		this.setProgress(this.currentPage);
	},
	//for event progress bar mousedown
	eventProgressBarChangeStart:function(e){
		e.preventDefault();
		
		document.addEventListener("mousemove", this.eventProgressBarChange);
		document.addEventListener("touchmove", this.eventProgressBarChange);
		document.addEventListener("mouseup", this.eventProgressBarChangeEnd);
		document.addEventListener("touchend", this.eventProgressBarChangeEnd);
		document.addEventListener("touchcancel", this.eventProgressBarChangeEnd);
		
		e.stopPropagation();
	},
	//for event progress bar mousemove & touchmove
	eventProgressBarChange:function(e){
		e.preventDefault();
		
		var x = e.clientX == undefined ? e.changedTouches[0].pageX : e.clientX;
		var value = Math.round((x - this.progressBar.offsetLeft) / this.progressBar.step);
		value = this.flipRevert ? value + 1 : this.progressBar.max - value;
		var page = (value - 1) * 2;
		if(value != this.progressBar.value && value >= this.progressBar.min && value <= this.progressBar.max){
			this.autoFlipTo(page);
			this.setProgress(page);
		}
	},
	//for event progress bar mouseup
	eventProgressBarChangeEnd:function(e){
		e.preventDefault();
		
		document.removeEventListener("mousemove", this.eventProgressBarChange);
		document.removeEventListener("touchmove", this.eventProgressBarChange);
		document.removeEventListener("mouseup", this.eventProgressBarChangeEnd);
		document.removeEventListener("touchend", this.eventProgressBarChangeEnd);
		document.removeEventListener("touchcancel", this.eventProgressBarChangeEnd);
	},
	//for close book event start
	eventCloseBookStart:function(e){
		e.preventDefault();
		
		eventStartX = e.changedTouches[0].pageX;
		document.addEventListener("touchend", closeEBook);
	},
	//for close book event end
	eventCloseBookEnd:function(e){
		e.preventDefault();
		
		document.removeEventListener("touchend", closeEBook);
	},
	//add all relavant events
	addEvents:function(){		
		document.addEventListener("touchstart", this.eventCloseBookStart);
		document.addEventListener("dblclick", closeEBook);
		
		document.removeEventListener("mousedown", eventPreventDefault);
		document.removeEventListener("touchstart", eventPreventDefault);
	},
	//remove all relavant events
	removeEvents:function(){		
		document.addEventListener("mousedown", eventPreventDefault);
		document.addEventListener("touchstart", eventPreventDefault);
		
		document.removeEventListener("touchstart", this.eventCloseBookStart);
		document.removeEventListener("touchend", closeEBook);
		document.removeEventListener("dblclick", closeEBook);		
	},
	translateXOffset:3,
	translateZOffset:5,
	flipRevert:false
};