function GameObject(x, y, img, camera){
  var self = this;
  this.size = 32;
  this.x = x;
  this.y = y;
  this.absoluteX = function(){ return camera.absoluteX - (camera.x - self.x); };
  this.abosluteY = function(){ return camera.absoluteY - (camera.y - self.y); };
  this.Img = img;
  this.state = 0;
  this.frame = 0;
  this.last_anim = new Date().getTime();
  
  this.draw = function(context){  
		//console.log(self);
		context.drawImage(self.Img, this.size * self.frame, this.size * self.state, this.size, this.size, self.absoluteX(), self.abosluteY(), this.size, this.size);
  };
  
  this.update = function(){
    var now = new Date().getTime();
    var delta = now - self.last_anim;
    if(delta >= 200){
      this.frame = (this.frame + 1) % 3;
      this.last_anim = now;
    }
  };
  
  this.move = function(x, y){
    self.x += x;
    self.y += y;
  };

  this.AI = function(self, game_state){};
}

GameObject.extend = function(child, parent){
    parent.apply(child);
    child.base = new parent;
    child.base.child = child;
}