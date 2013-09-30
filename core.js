function Game(){
    var self = this;
    this.context = undefined;
    var loader = new Loader();
    var objects = [];
    var player = undefined;
    
    this.init = function(){
      self.canvas = document.getElementById("myCanvas");
      self.context = self.canvas.getContext("2d");
      loader.loadImages(["img/zombie.png"]);
      loader.done = function(){
	player = new GameObject(0, 0, loader.images["zombie.png"]);
	objects.push(player);
      };
    }
    
    this.gameLoop = function() {
      self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
      $.each(objects, function(index, obj){
	obj.draw(self.context);
      });
    }
    
    this.keyPress = function(e){
      //alert(e.keyCode);
      var speed = 8;
      switch(e.keyCode){
	case 38: //Up
	  player.state = 3;
	  player.y -= speed;
	  break;
	case 40: //Down
	  player.state = 0;
	  player.y += speed;
	  break;
	case 37: //Left
	  player.state = 1;
	  player.x -= speed;
	  break;
	case 39: //Right
	  player.state = 2;
	  player.x += speed;
	  break;
      }
      player.update();
    };
};