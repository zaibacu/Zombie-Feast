function GameState(player){
  var self = this;
  this.player = player;

};

function ChickenAI(self, game_state){
  var dX = game_state.player.x - self.x;
  var dY = game_state.player.y - self.y;
  var speed = 4;
  if(Math.abs(dX) > 0)
    dY = 0;

  var moveX = 0, moveY = 0;
  if(dX > 0)
  {
    self.state = 2;
    moveX = speed;
  }
  else if(dX < 0)
  {
    self.state = 1;
    moveX = -speed;
  }
  else if(dY > 0)
  {
    self.state = 0;
    moveY = speed;
  }
  else if(dY < 0)
  {
    self.state = 3;
    moveY = -speed;
  }

  self.move(moveX, moveY);
  self.update();
};

function Game(){
    var self = this;
    this.context = undefined;
    var loader = new Loader();
    var objects = [];
    var player = undefined;
    var camera = new Camera(0, 0, 320, 240);
    self.last_AI_update = new Date().getTime();
    
    this.init = function(){
      self.canvas = document.getElementById("myCanvas");
      self.context = self.canvas.getContext("2d");
      loader.loadImages(["img/zombie.png"]);
      loader.done = function(){
        player = new PlayerObject(64, 64, loader.images["zombie.png"], camera);
        objects.push(player);

        //Enemies
        var chicken = new GameObject(0, 0, loader.images["zombie.png"], camera);
        chicken.AI = ChickenAI;
        objects.push(chicken);
      };
    }
    
    this.gameLoop = function() {
      var now = new Date().getTime();
      var update_AI = false;
      if(now - self.last_AI_update > 100){
        update_AI = true;
        self.last_AI_update = now;
      }
      
      self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
      var gameState = new GameState(player);
      $.each(objects, function(index, obj){
	       obj.draw(self.context);
         if(update_AI)
          obj.AI(obj, gameState);
      });
    }
    
    this.keyPress = function(e){
      //alert(e.keyCode);
      var speed = 8;
      switch(e.keyCode){
        case 38: //Up
          player.state = 3;
          player.move(0, -speed);
          break;
        case 40: //Down
          player.state = 0;
          player.move(0, speed);
          break;
        case 37: //Left
          player.state = 1;
          player.move(-speed, 0);
          break;
        case 39: //Right
          player.state = 2;
          player.move(speed, 0);
          break;
      }
      player.update();
    };
	
};