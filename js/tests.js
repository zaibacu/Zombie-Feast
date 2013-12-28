test("GameObjectMove", function() {
	game_object = new GameObject(0, 0);
	game_object.move(5, 5);
	game_object.move(0, 5);
	ok( game_object.x == 5 && game_object.y == 10, "Game object move" );
});

test("PlayerMove", function() {
	var camera = new Camera(0, 0, 320, 240);
	var player = new PlayerObject(0, 0, "", camera);
	player.move(5, 5);
	ok(player.x == camera.x && player.y == camera.y, "Player move" );
});

test("Attack", function(){
	var camera = new Camera(0, 0, 320, 240);
	var player = new PlayerObject(0, 0, "", camera);
	var enemy = new EnemyObject(0, 0, "", camera);
	
	ok(player.health == 100, "Player at full health");
	enemy.attack(player);
	ok(player.health == 95, "Player took a hit");
});

test("Collision", function(){
	var game = new Game();
	var camera = new Camera(0, 0, 320, 240);
	var player = new PlayerObject(0, 0, "", camera);
	var enemy = new EnemyObject(16, 16, "", camera);
	ok(game.collides(player, enemy) == true, "Collision test");
});

/*test("PlayerAttack", function(){
	var camera = new Camera(0, 0, 320, 240);
	var player = new PlayerObject(0, 0, "", camera);
	var enemy = new EnemyObject(0, 0, "", camera);
	
	player.food = 10;
	ok(player.scores == 0, "Player has no scores");
	ok(enemy.health == 100, "Enemy at full health");
	player.attack(enemy);
	ok(enemy.health == 80, "Enemy took a hit");
	player.attack(enemy);
	player.attack(enemy);
	player.attack(enemy);
	player.attack(enemy);
	player.attack(enemy);
	ok(enemy.is_dead(), "Enemy is dead");
	ok(player.scores == 100, "Player earned scores");
	ok(player.food == 60, "Player earned food");
});*/