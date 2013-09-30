function GameObject(x, y, img){
  var self = this;
  this.x = x;
  this.y = y;
  this.Img = img;
  this.state = 0;
  this.frame = 0;
  this.last_anim = new Date().getTime();
  
  this.draw = function(context){      
      context.drawImage(self.Img, 32 * self.frame, 32 * self.state, 32, 32, self.x, self.y, 64, 64);
  };
  
  this.update = function(){
    var now = new Date().getTime();
    var delta = now - self.last_anim;
    if(delta >= 200){
      this.frame = (this.frame + 1) % 3;
      this.last_anim = now;
    }
  };
}
