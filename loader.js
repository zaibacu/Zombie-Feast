function Loader(){
	var self = this;
	this.images = {}
	this.loadImages = function(images){
		this.counter = 0;
		this.to_load = images.length;
		var re = /\w+[.]\w+$/g;
		$.each(images, function(index, value){
			var img = new Image();
			img.onload = function(){
				var name = this.src.match(re);
				self.images[name] = (this);
				console.log(this);
				self.loaded(name);
			};
			
			img.src = value;
		});
	};
	this.loaded = function(name){
	  this.counter++;
	  if(self.counter >= self.to_load){
	      self.done();
	  }
	};
	
	this.done = function(){};
	
};