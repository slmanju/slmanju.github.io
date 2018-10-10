(function () {
    "use strict";

    var canvas = document.getElementById("gameCanvas"),
        context = canvas.getContext("2d"),
        width = canvas.width,
        height = canvas.height,
        Key,
        now = Date.now(),
        then = Date.now(),
        fpsInterval = 1000 / 6,
        elapsed,
        request,
        game;

    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    }());

    Key = {
        Space: 32,
        Left: 37,
        Up: 38,
        Right: 39,
        Down: 40
    };

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    function Rectangle(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    Rectangle.prototype.intersects = function (rectangle) {
        return (this.x < rectangle.x + rectangle.width && this.x + this.width > rectangle.x && this.y < rectangle.y + rectangle.height && this.y + this.height > rectangle.y);
    };

    function Apple(x, y) {
        this.x = x;
        this.y = y;
    }

    Apple.prototype.constructor = Apple;

    Apple.prototype.init = function () {
        this.x = (Math.floor(Math.random() * 45)) * 10;
        this.y = (Math.floor(Math.random() * 25)) * 10;
    };

    Apple.prototype.relocate = function () {
        this.x = (Math.floor(Math.random() * 45)) * 10;
        this.y = (Math.floor(Math.random() * 25)) * 10;
    };

    Apple.prototype.draw = function () {
        context.fillStyle = "green";
        context.fillRect(this.x, this.y, 10, 10);
    };

    function Snake(x, y) {
        this.x = x;
        this.y = y;
        this.body = [];
        this.direction = 'right';
    }

    Snake.prototype.constructor = Snake;

    Snake.prototype.clear = function () {
        this.x = 50;
        this.y = 50;
        this.body = [];
        this.direction = 'right';
    };

    Snake.prototype.init = function () {
        var i;
        for (i = 3; i > 0; i = i - 1) {
            this.body.push(new Point(i * 10, 0));
        }
    };

    Snake.prototype.getHead = function () {
        return this.body[0];
    };

    Snake.prototype.draw = function () {
        var point, i, length = this.body.length;
        context.beginPath();
        for (i = 0; i < length; i = i + 1) {
            point = this.body[i];
            this.drawSquare(point.x, point.y, 10, (i === 0) ? "red" : "blue");
        }
        context.closePath();
    };

    Snake.prototype.drawSquare = function (x, y, size, color) {
        context.fillStyle = color;
        context.fillRect(x, y, size, size);
        context.strokeStyle = "#989898";
        context.strokeRect(x, y, size, size);
    };

    Snake.prototype.move = function () {
        var point, pointNext, head, i, length = this.body.length - 1;
        for (i = length; i > 0; i = i - 1) {
            point = this.body[i];
            pointNext = this.body[i - 1];
            point.x = pointNext.x;
            point.y = pointNext.y;
        }
        head = this.getHead();
        if (this.direction === 'left') {
            head.x = head.x - 10;
        } else if (this.direction === 'up') {
            head.y = head.y - 10;
        } else if (this.direction === 'right') {
            head.x = head.x + 10;
        } else if (this.direction === 'down') {
            head.y = head.y + 10;
        }
    };

    Snake.prototype.grow = function () {
        this.body.push(new Point());
    };

    Snake.prototype.isHitWall = function () {
        var head = this.getHead();
        return (head.x < 0 || head.x >= width || head.y < 0 || head.y >= height);
    };

    Snake.prototype.isHitBody = function () {
        var head = this.getHead(), hit = false, headRect, bodyPart, bodyRect, i, length = this.body.length;
        for (i = 1; i < length; i = i + 1) {
            headRect = new Rectangle(head.x, head.y, 10, 10);
            bodyPart = this.body[i];
            bodyRect = new Rectangle(bodyPart.x, bodyPart.y, 10, 10);
            if (headRect.intersects(bodyRect)) {
                hit = true;
            }
        }
        return hit;
    };

    Snake.prototype.isEat = function (apple) {
        var head = this.getHead();
        return (head.x === apple.x && head.y === apple.y);
    };

    function ScoreBoard() {
        var board = document.getElementById("score");
        this.update = function (score) {
            board.innerHTML = score;
        };
    }

    function Game() {
        this.score = 0;
        this.snake = new Snake(50, 50);
        this.apple = new Apple(100, 100);
        this.scoreboard = new ScoreBoard();
    }

    Game.prototype.constructor = Game;

    Game.prototype.start = function () {
        canvas.focus();
        context.clearRect(0, 0, width, height);
        this.score = 0;
        this.scoreboard.update(this.score);
        this.snake.clear();
        this.snake.init();
        this.apple.init();
        this.loop();
    };

    Game.prototype.loop = function () {
        if (this.snake.isHitWall() || this.snake.isHitBody()) {
            window.cancelAnimationFrame(request);
            this.scoreboard.update(this.score + " Game Over!!!");
        } else {
            this.draw();
        }
    };

    Game.prototype.draw = function () {
        context.clearRect(0, 0, width, height);
        if (this.snake.isEat(this.apple)) {
            this.score = this.score + 1;
            this.scoreboard.update(this.score);
            this.apple.relocate();
            this.snake.grow();
        }
        this.apple.draw();
        this.snake.move();
        this.snake.draw();
    };

    Game.prototype.onkeyup = function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === Key.Left) {
            this.snake.direction = 'left';
        } else if (keyCode === Key.Up) {
            this.snake.direction = 'up';
        } else if (keyCode === Key.Right) {
            this.snake.direction = 'right';
        } else if (keyCode === Key.Down) {
            this.snake.direction = 'down';
        }
    };

    game = new Game();
    document.addEventListener("keyup", function (event) {
        event.preventDefault();
        game.onkeyup(event);
    }, false);

    document.addEventListener("keydown", function (event) {
        event.preventDefault();
    }, false);

    function animate() {
        request = window.requestAnimationFrame(animate);
        now = Date.now();
        elapsed = now - then;
        if (elapsed > fpsInterval) {
            then = now - (elapsed % fpsInterval);
            game.loop();
        }
    }

    document.getElementById("start").addEventListener("click", function () {
        game.start();
        animate();
    }, false);
}());
