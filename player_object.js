function PlayerObject(x, y, img, camera){
	GameObject.extend(this, GameObject);
	var self = this;
	this.size = 32;
	this.x = x;
	this.y = y;
	this.Img = img;
	this.state = 0;
	this.frame = 0;
	this.last_anim = new Date().getTime();
	camera.x = x;
	camera.y = y;
	
	this.draw = function(context){
		context.drawImage(self.Img, this.size * self.frame, this.size * self.state, this.size, this.size, camera.absoluteX, camera.absoluteY, this.size, this.size);
	};
	
	this.move = function(x, y){
		self.x += x;
		self.y += y;
		camera.x = self.x;
		camera.y = self.y;
	};
}