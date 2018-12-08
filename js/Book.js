var Book = {
	init:function(source){
		//parse XML source file
		var parser = new DOMParser();
		var xmlobj, list, bgColor;
		this.list = new Array();
		for(var i = 0; i < source.length; i++){
			xmlobj = parser.parseFromString(source[i], "text/xml");
			list = xmlobj.getElementsByTagName("thumbnail");
			bgColor = "rgb(" + parseInt(Math.random() * 300 % 256) + ", " + parseInt(Math.random() * 300 % 256) + ", " + parseInt(Math.random() * 300 % 256) + ")";
			
			//initialize book list
			for(var j = 0; j < list.length; j++){
				var div = document.createElement("div");
				div.className = "book";
				div.section = i;
				div.index = this.list.length;
				div.url = list[j].getAttribute("url");
				div.title = list[j].getAttribute("title");
				div.author = list[j].getAttribute("aurth");
				div.publisher = list[j].getAttribute("publiser");
				div.description = list[j].getAttribute("description");
				div.data = list[j].getAttribute("data");
				div.page = list[j].getAttribute("page");
				div.page = div.page ? parseInt(div.page) : div.page;
				div.flip = list[j].getAttribute("flip");
				div.style.backgroundColor = bgColor;
					
				var image = document.createElement("img");
				image.src = "image/thumbnails/" + list[j].getAttribute("filename");
				
				div.appendChild(image);
				document.body.appendChild(div);
				this.list.push(div);
			}
		}
		
		this.bookinfo = document.getElementById("bookinfo");
		//initialize book info
		//this.bookinfo = document.createElement("div");
		//this.bookinfo.className = "info";
		//this.bookinfo.style.top = innerHeight / 2 + 20;
		//document.body.appendChild(this.bookinfo);
	},
	//initialize books attributes
	initBooks:function(obj){
		for(var i = 0; i < this.list.length; i++){
			this.setBookBounds(this.list[i], obj.bookWidth, obj.bookHeight, obj.bookOriginX, obj.bookOriginY);
		}
		
		//for spiral
		if(obj.radius){
			for(var i = 0; i < this.list.length; i++){
				this.list[i].style.webkitTransformOrigin = "50% 50% -" + obj.radius + "px";
			}
		}
	},
	//set book bounds
	setBookBounds:function(book, width, height, left, top){	
		var padding = width * 0.05;
		book.style.width = width + "px";
		book.style.height = height + "px";
		book.style.left = left + "px";
		book.style.top = top + "px";
		book.style.padding = padding + "px";
		book.width = width;
		book.height = height;
		book.left = left;
		book.top = top;
		
		var image = book.childNodes[0];
		image.style.width = width - padding * 2 + "px";
		image.style.height = height - padding * 2 + "px";
	},
	//set book DOM attributes
	setBook:function(book, transform, zIndex, opacity){
		if(!book){return;}
		
		if(zIndex != undefined){
			book.style.zIndex = zIndex;
		}
		if(opacity != undefined){
			book.style.opacity = opacity;
		}
		if(transform){
			var rotateY = transform.rotateY == undefined ? formatNumber(book.rotateY) : formatNumber(transform.rotateY);
			var translateX = transform.translateX == undefined ? formatNumber(book.translateX) : formatNumber(transform.translateX);
			var translateY = transform.translateY == undefined ? formatNumber(book.translateY) : formatNumber(transform.translateY);
			var translateZ = transform.translateZ == undefined ? formatNumber(book.translateZ) : formatNumber(transform.translateZ);
			book.style.webkitTransform = "translateX(" + translateX + "px) translateY(" + translateY + "px) translateZ(" + translateZ + "px) rotateY(" + rotateY + "deg)";
			
			if(transform.update){
				book.rotateY = rotateY;
				book.translateX = translateX;
				book.translateY = translateY;
				book.translateZ = translateZ;
			}
		}
	},
	//set info text
	setInfo:function(book){
		var title = document.getElementById("title");
		title.innerHTML = book.title;
		
		var author = document.getElementById("author");
		author.innerHTML = book.author;

		var publisher = document.getElementById("publisher");
		publisher.innerHTML = book.publisher;

		var description = document.getElementById("description");
		description.innerHTML = book.description;

		var url = document.getElementById("url");
		url.innerHTML = '<a href="' + book.url + '"' + ' target="_blank">' + book.url + '</a>';
	},
	//display info block
	showInfo:function(){
		this.bookinfo.style.display = "block";
	},
	//hide info block
	hideInfo:function(){
		this.bookinfo.style.display = "none";
	},
	//update transform attributes of all books
	updateBooksTransform:function(ry, tx, ty, tz){
		var book;
		var translateX, translateZ;
		for(var i = 0; i < this.list.length; i++){
			book = this.list[i];
			book.rotateY = formatNumber(book.rotateY + ry);
			
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
			
			book.translateX = formatNumber(book.translateX + tx);
			book.translateY = formatNumber(book.translateY + ty);
			book.translateZ = translateZ > 0 ? formatNumber(-translateZ) : formatNumber(translateZ);
		}
	},
	//add book objects event listener
	addBooksEvent:function(eventName, listener){
		if(!eventName || !listener){return;}
		
		for(var i = 0; i < this.list.length; i++){
			this.list[i].addEventListener(eventName, listener);
		}
	},
	//remove book objects event listener
	removeBooksEvent:function(eventName, listener){
		if(!eventName || !listener){return;}
		
		for(var i = 0; i < this.list.length; i++){
			this.list[i].removeEventListener(eventName, listener);
		}
	}
};