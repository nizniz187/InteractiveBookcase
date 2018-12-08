var Setting = {
	//general
	animationSpeed:{			//animation speed
		general:0,				//general speed; default:5
		relative:{
			autoRotate:0,		//relative speed of spiral auto rotate; default:1
			autoSlide:0,		//relative speed of line auto slide; default:5
			transformToLine:0,	//relative speed of transforming from spiral to line; default:1
			transformToSpiral:0,//relative speed of transforming from line to spiral; default:1
			demo:1				//relative speed of demonstration; default:3
		}
	},
	eventSensitivity:0,			//user event sensitivity, affecting the sesitivity of mouse and touch; default:0.3
	demoIdle:1,					//idle time by second to start demo; default:60s
	
	//spiral
	spiralBookWidth:0,			//spiral book width; default:150 px
	spiralBookHeight:0,			//spiral book height; default:180 px
	frontAmount:0,				//amount of books on front side; default:auto, related by window width
	threadPitch:0,				//spiral thread pitch; default:300 px
	radius:0,					//spiral radius; default:auto, relaged to window width
	
	//line
	lineBookWidth:0,			//line book width; default: 300 px
	lineBookHeight:0,			//line book height; default: 380 px
	bookMarginX:0,				//book margin along axis x; default:auto, the x-distance between center point of books
	bookMarginZ:0,				//book margin along axis z; default:200, the z-distance between center point of books
	
	//ebook
	ebookWidth:0,			//ebook width; default:auto
	ebookHeight:0			//ebook height; default:auto
};