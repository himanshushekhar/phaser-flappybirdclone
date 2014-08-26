// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the game's assets 
        
        // Change the background color of the game
        game.stage.backgroundColor = '#71c5cf';

        // Load the bird sprite
        game.load.image('bird', 'assets/bird.png');
        // Load the pipes sprite
        game.load.image('pipe', 'assets/pipe.png'); 
        // Load the sound file
        game.load.audio('jump', 'assets/jump.wav');        
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  
        
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        // Display the bird on the screen
        this.bird = this.game.add.sprite(100, 245, 'bird');

        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
        // Change the center of rotation of the bird, called "anchor" to somewhere in the middle of the sprite
        this.bird.anchor.setTo(-0.2, 0.5);
        
        this.pipes = game.add.group(); // Create a group  
        this.pipes.enableBody = true;  // Add physics to the group  
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes 
        
        // Keep adding pipes every 1.5 seconds
        this.noOfRowsOfPipesAdded = 0;
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);  
        
        // Display a score label in the top left
        this.score = 0;  
        this.labelScore = game.add.text(20, 20, "0", { font: "30px Arial", fill: "#ffffff" });  
        
        // Add sound to the game
        this.jumpSound = game.add.audio('jump');
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic   
        
        // If the bird is out of the world (too high or too low), call the 'restartGame' function
        if (this.bird.inWorld == false)
            this.restartGame();
        
        // Finish and restart the game when bird collides with the pipe
        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this); 
        
        // Add some animations
        // Slowly rotate the bird downward, up to a certain point.
        if (this.bird.angle < 20)  
            this.bird.angle += 1;
    },
    
    // Make the bird jump 
    jump: function() {  
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)  
            return;
        
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        
        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
        animation.to({angle: -20}, 100);

        // And start the animation
        animation.start();  
        
        // Play the sound
        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function() {  
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },
    
    // Add a pipe to the world
    addOnePipe: function(x, y) {  
        // Get the first dead pipe of our group
        var pipe = this.pipes.getFirstDead();

        // Set the new position of the pipe
        pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    
    // Add a row of 6 pipes
    addRowOfPipes: function() {         
        // Pick where the hole will be
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        for (var i = 0; i < 8; i++)
            if (i != hole && i != hole + 1) 
                this.addOnePipe(400, i * 60 + 10);   
        
        // Increase the score by 1 each time new pipes are created
        if (this.noOfRowsOfPipesAdded != 0) 
            this.incrementScore();
        
        // Increment the no of rows of pipes
        this.noOfRowsOfPipesAdded += 1;
    },
    
    incrementScore: function() {
        this.score += 1;  
        this.labelScore.text = this.score; 
    },
    
    // Stop all the pipes when a collision occurs
    hitPipe: function() {  
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function(p){
            p.body.velocity.x = 0;
        }, this);
    },
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  