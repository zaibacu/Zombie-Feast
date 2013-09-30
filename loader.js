function Loader(){
	var self = this;
	this.images = {}
	this.loadImages = function(images){
		var re = /\w+[.]\w+$/g;
		$.each(images, function(index, value){
			var img = new Image();
			img.onload = function(){
				var name = this.src.match(re);
				self.images[name] = (this);
				console.log(this);
			};
			
			img.src = value;
		});
	};
	
};