var gamejs = require("gamejs");
var draw = require("gamejs/draw");
var sprite = require("gamejs/sprite")
var $v = require("gamejs/utils/vectors");

var ANIMATION_SPEED = 300;

var SpriteSheet = function(imagePath, options){
	this.get = function(id) {
		return surfaceCache[id];
	};
       
	var width = options.width;
	var height = options.height;
	var image = gamejs.image.load(imagePath);
	var surfaceCache = [];
	var imgSize = new gamejs.Rect([0,0],[width,height]);
	for (var i=0; i<image.rect.width; i+=width) {
		for (var j=0;j<image.rect.height;j+=height) {
			var surface = new gamejs.Surface([width, height]);
			var rect = new gamejs.Rect(i, j, width, height);
			surface.blit(image, imgSize, rect);
			surfaceCache.push(surface);
		}
	}
	return this;
};

var Timer = function(delay, callback){
	var self = this;
	self.time_sum = 0;
	self.update = function(delta){
		self.time_sum += delta;
		if(self.time_sum > delay){
			callback();
			self.time_sum = 0;
		}
	}
};

var TimerContainer = function(){
	var self = this;
	self.timers = [];
	self.add = function(timer){
		self.timers.push(timer);
	},
	
	self.update = function(delta){
		var count = self.timers.length;
		for(var i = 0; i<count; i++){
			self.timers[i].update(delta);
		}
	}
};

var Animation = function(sheet, key, frames, offset, speed){
	var self = this;
	self.sheet = sheet;
	self.current_frame = 0;
	self.frames = frames;
	self.offset = offset;
	self.key = key;
	self.timer = new Timer(speed, function(){
		self.change_frame();
	});
	
	self.change_frame = function(){
		if(++self.current_frame >= self.frames)
			self.current_frame = 0;
	};
	
	self.update = function(ms){
		self.timer.update(ms);
	};
	
	self.get = function(){
		return self.sheet.get(self.key + (self.current_frame * self.offset));
	};
};

function GameObject(animation_map, position){
	GameObject.superConstructor.apply(this, arguments);
	
	var self = this;
	self.debug = false;
	
	self.radius = 8;
	self.position = position;
	self.speed = 4;
	self.moving = false;
	self.timers = new TimerContainer();
	
	self.rect = new gamejs.Rect(self.position);
	self.animation_map = animation_map;
	self.animation = self.animation_map["up"];
	self.image = self.animation.get();
	
	self.health = 100;
	self.attack_ready = false;
	
	self.attack_map = {"up": "up_attack", "down":"down_attack", "left": "left_attack", "right": "right_attack"};
	self.attack_map_inverse = {"up_attack": "up", "down_attack":"down", "left_attack": "left", "right_attack": "right"};
	self.key_to_anim = {0: "down", 1: "left",2: "right", 3: "up", 4: "down_attack", 5: "left_attack", 6: "right_attack", 7: "up_attack"};
	this.init = function(){
		
	};
	
	this.update = function(delta){
		if(self.moving || !self.attack_ready)
			self.animation.update(delta);
		self.image = self.animation.get();
		
		self.timers.update(delta);
	};
	
	this.handle = function(event){};
	
	this.damage = function(dmg, attacker){
		self.health -= dmg;
		if(self.debug)
			console.log("Got " + dmg + " damage, health left: " + self.health);
		if(self.health < 0){
			self.health = 0;
			self.die(attacker);
		}
	};
	
	this.die = function(killer){
		self.kill();
	};
	
	
	this.move = function(delta){
		var newPosition = $v.add(self.position, delta);
		if(newPosition[0] < 0 || newPosition[0] + 32 > 640 || newPosition[1] < 0 || newPosition[1] + 32 > 480)
			return; 
		
		if(delta){
			
			var angle = $v.angle(delta) * 180 / Math.PI;
			if(self.debug)
				console.log(angle);
			self.position = $v.add(self.position, delta);
			self.rect = new gamejs.Rect(self.position);
			if(angle < 0)
				self.animation = self.animation_map["up"];
			else if(angle <= 45)
				self.animation = self.animation_map["right"];
			else if(angle <= 135)
				self.animation = self.animation_map["down"];
			else if(angle <= 225)
				self.animation = self.animation_map["left"];
			else
				self.animation = self.animation_map["up"];
		}
	};
};
gamejs.utils.objects.extend(GameObject, gamejs.sprite.Sprite);

function EnemyObject(animation_map, position, game){
	EnemyObject.superConstructor.apply(this, arguments);
	this.game = game;
	this.AI = function(){};
};
gamejs.utils.objects.extend(EnemyObject, GameObject);


function ChickenObject(animation_map, position, game){
	var self = this;
	this.speed = 8;
	ChickenObject.superConstructor.apply(this, arguments);
	
	this.init = function(){
		//AI timer
		self.timers.add(new Timer(200, function(){
			self.AI();
		}));
	};
	
	this.die = function(killer){
		killer.hunger(-30);
		killer.scores += 50;
		self.kill();
	};
	
	this.AI = function(){
		var direction = {};
		direction[0] = [0, -1];
		direction[1] = [0, 1];
		direction[2] = [-1, 0];
		direction[3] = [1, 0];
				
		var dist = $v.distance(self.game.player.position, self.position);
		//Player is far enough, do random things
		if(dist > 100){
			var delta = $v.multiply(direction[Math.floor(Math.random() * 4)], self.speed);
			self.move(delta);
		}
		else{
			var delta = $v.divide($v.subtract(self.position, self.game.player.position), dist/self.speed);
			self.move(delta);
		}
	};
};
gamejs.utils.objects.extend(ChickenObject, EnemyObject);


function FarmerObject(animation_map, position, game){
	var self = this;
	FarmerObject.superConstructor.apply(this, arguments);
	
	this.init = function(){
		//Attack timer
		self.timers.add(new Timer(500, function(){
			self.attack_ready = true;
			
			if(self.attack_ready == false && self.key_to_anim[self.animation.key] in self.attack_map_inverse)
				self.animation = self.animation_map[self.attack_map_inverse[self.key_to_anim[self.animation.key]]];
		}));
		
		//AI timer
		self.timers.add(new Timer(200, function(){
			self.AI();
		}));
	};
	
	this.die = function(killer){
		killer.hunger(-50);
		killer.scores += 200;
		self.kill();
		self.game.farmers_count--;
	};
	
	this.attack = function(target){
		if(target && self.attack_ready){
			target.damage(5, self);
			self.attack_ready = false;
			
			if(self.key_to_anim[self.animation.key] in self.attack_map)
				self.animation = self.animation_map[self.attack_map[self.key_to_anim[self.animation.key]]];
		}
	};
	
	this.AI = function(){
		var dist = $v.distance(self.game.player.position, self.position);
		//Player is far - try to catch him
		if(dist > 32){
			var delta = $v.divide($v.subtract(self.game.player.position, self.position), dist/self.speed);
			self.move(delta);
		}
		else{
			self.attack(self.game.player);
		}
		
	};
};
gamejs.utils.objects.extend(FarmerObject, EnemyObject);

function PlayerObject(animation_map, position){
	PlayerObject.superConstructor.apply(this, arguments);
	
	var self = this;
	self.debug = false;
	self.food = 100;
	self.scores = 0;
	self.moving = false;
	self.attack_ready = true;
	
	this.init = function(){
		//Scores
		self.timers.add(new Timer(1000, function(){
			self.scores += 1;
		}));
		//Hunger
		self.timers.add(new Timer(500, function(){
			self.hunger(1);
		}));
		//Attack timer
		self.timers.add(new Timer(500, function(){
			if(self.attack_ready == false && self.key_to_anim[self.animation.key] in self.attack_map_inverse)
				self.animation = self.animation_map[self.attack_map_inverse[self.key_to_anim[self.animation.key]]];
			self.attack_ready = true;
		}));
		
		
	};
	
	this.handle = function(event, game){
		var direction = {};
		direction[gamejs.event.K_UP] = [0, -1];
		direction[gamejs.event.K_DOWN] = [0, 1];
		direction[gamejs.event.K_LEFT] = [-1, 0];
		direction[gamejs.event.K_RIGHT] = [1, 0];
		
		if(event.type === gamejs.event.KEY_DOWN){
			if(event.key in direction){
				var delta = $v.multiply(direction[event.key], self.speed);
				if(delta){
					self.move(delta);
					self.moving = true;
				}
			}
			
			if(event.key == gamejs.event.K_SPACE){
				
				self.attack(function(){
					var result = undefined;
					game.enemies.forEach(function(enemy){
						if(gamejs.sprite.collideCircle(player, enemy)){
							result = enemy;
							return;
						}
					});
					
					return result;
				});
			}
		}
		else if(event.type === gamejs.event.KEY_UP){
			self.moving = false;
		}
	};
	
	this.hunger = function(count){
		self.food -= count;
		
		if(self.food < 0){
			self.food = 0;
			self.damage(count * 5, self);
		}
		if(self.food > 100){
			self.food = 100;
		}
	};
	
	
	this.attack = function(target_getter){
		var target = target_getter();
		if(target && self.attack_ready){
			target.damage(20, self);
			
		}
		
		self.attack_ready = false;
			
		if(self.key_to_anim[self.animation.key] in self.attack_map)
			self.animation = self.animation_map[self.attack_map[self.key_to_anim[self.animation.key]]];
	};
	
	this.die = function(killer){
		var name = null;
		while(!name){
			name = prompt("Enter your name","");
		}
		gamejs.http.post("save", { "name": name, "scores": self.scores });
		window.location = "/over";
	};
}
gamejs.utils.objects.extend(PlayerObject, GameObject);


function GameUI(player){
	var self = this;
	self.player = player;
	var font = new gamejs.font.Font("18px Arial");
	
	self.update = function(display){
		//health
		draw.rect(display, "#64FE2E", new gamejs.Rect([10, 10], [self.player.health * 2, 15]), 0);
		//food
		draw.rect(display, "#FFFF00", new gamejs.Rect([10, 30], [self.player.food * 2, 15]), 0);
		//scores
		display.blit(font.render(player.scores, "#FFFFFF"), [250, 15])
	};
};


function core(){
	var self = this;
	var display = gamejs.display.setMode([640, 480]);
	var zombie_sheet = new SpriteSheet("img/zombis.png", {width: 32, height: 32});
	this.player = new PlayerObject({	
				"down": new Animation(zombie_sheet, 0, 3, 4, ANIMATION_SPEED), 
				"up": new Animation(zombie_sheet, 3, 3, 4, ANIMATION_SPEED), 
				"left": new Animation(zombie_sheet, 1, 3, 4, ANIMATION_SPEED), 
				"right": new Animation(zombie_sheet, 2, 3, 4, ANIMATION_SPEED),
				"down_attack": new Animation(zombie_sheet, 4, 3, 4, ANIMATION_SPEED), 
				"up_attack": new Animation(zombie_sheet, 7, 3, 4, ANIMATION_SPEED), 
				"left_attack": new Animation(zombie_sheet, 5, 3, 4, ANIMATION_SPEED), 
				"right_attack": new Animation(zombie_sheet, 6, 3, 4, ANIMATION_SPEED)
			}, [320, 450]);
	player.init();
	var ui = new GameUI(player);
	this.farmers_count = 0;
	
	var map = gamejs.image.load("img/map.png");
	var mainSurface = gamejs.display.getSurface();
	this.enemies = new gamejs.sprite.Group();
	var chicken_sheet = new SpriteSheet("img/vista.png", {width: 32, height: 32});
	var chicken_am = {	
				"down": new Animation(chicken_sheet, 0, 3, 4, ANIMATION_SPEED), 
				"up": new Animation(chicken_sheet, 3, 3, 4, ANIMATION_SPEED), 
				"left": new Animation(chicken_sheet, 1, 3, 4, ANIMATION_SPEED), 
				"right": new Animation(chicken_sheet, 2, 3, 4, ANIMATION_SPEED)
			}
	
	var factory = new TimerContainer();
	factory.add(new Timer(5000, function(){
		if(enemies.sprites().length < 5){
			var chicken = new ChickenObject(chicken_am, [ (Math.random() * 300) + 1, (Math.random() * 300) + 1 ], self);
			chicken.init();
			enemies.add(chicken);
		}
	}));
	
	var farmer_sheet = new SpriteSheet("img/fermeris.png", {width: 32, height: 32});
	var farmer_am = {	
				"down": new Animation(farmer_sheet, 0, 3, 4, ANIMATION_SPEED), 
				"up": new Animation(farmer_sheet, 3, 3, 4, ANIMATION_SPEED), 
				"left": new Animation(farmer_sheet, 1, 3, 4, ANIMATION_SPEED), 
				"right": new Animation(farmer_sheet, 2, 3, 4, ANIMATION_SPEED),
				"down_attack": new Animation(farmer_sheet, 4, 3, 4, ANIMATION_SPEED), 
				"up_attack": new Animation(farmer_sheet, 7, 3, 4, ANIMATION_SPEED), 
				"left_attack": new Animation(farmer_sheet, 5, 3, 4, ANIMATION_SPEED), 
				"right_attack": new Animation(farmer_sheet, 6, 3, 4, ANIMATION_SPEED)
			}
	
	factory.add(new Timer((Math.random() * 50000) + 1, function(){
		if(self.farmers_count == 0){
			var farmer = new FarmerObject(farmer_am, [ 320, 240 ], self);
			farmer.init();
			enemies.add(farmer);
			self.farmers_count++;
		}
	}));
	
	for(var i = 0; i<5; i++){
		var chicken = new ChickenObject(chicken_am, [ (Math.random() * 300) + 1, (Math.random() * 300) + 1 ], self);
		chicken.init();
		enemies.add(chicken);
	}
		
	gamejs.onTick(function(delta){
		mainSurface.fill("#FFFFFF");
		display.blit(map);
		enemies.draw(mainSurface);
		enemies.update(delta);
		player.update(delta);
		player.draw(mainSurface);
		ui.update(display);
		factory.update(delta);
	});
	
	gamejs.onEvent(function(event) {
		player.handle(event, self);
	});
}

gamejs.preload([
   "img/zombis.png",
   "img/vista.png",
   "img/fermeris.png",
   "img/map.png"
]);
gamejs.ready(core);
