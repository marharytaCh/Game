;(function() {
    "use strict";
    window.Game = Game;

    function Game() {
        // extends class Observable
        Observable.call(this);
        this.cfg = {
            RADIUS: 60,
            shapesPerSec: 15,
            shapeSpawnDelay: 1000,
            gravityForce: 9
        };
    }

    Game.prototype = Object.create(Observable.prototype);
    Game.prototype.constructor = Game;


    // Game logic
    Game.prototype.init = function () {
        this.startShapeSpawning();

        // notify observers with init values
        this.emit('gravityForceChange', {gravityForce: this.cfg.gravityForce});
        this.emit('shapesPerSecChange', {shapesPerSec: this.cfg.shapesPerSec});
        this.calcShapesArea();
        this.calcShapesNumber();
    };
    
    Game.prototype.registerWorld = function (world) {
        this.world = world;
        this.init();
    };

    Game.prototype.startShapeSpawning = function () {
        var self = this;
        self.spawnManyShapes();
        self._shapesSpawnTimerId = setInterval(function() {
            self.spawnManyShapes();
        }, self.cfg.shapeSpawnDelay);
    };

    // stop spawning shapes (for future)
    Game.prototype.stopShapeSpawning = function () {
        var self = this;
        clearInterval(self._shapesSpawnTimerId);
        self._shapesSpawnTimerId = null;
    }

    Game.prototype.spawnManyShapes = function () {
        for (var i=0; i < this.cfg.shapesPerSec; i++) {
            this.instantiateShape();
        }
    }

    Game.prototype.calcShapesNumber = function () {
        this.emit('shapesNumberChange', {shapesNumber: this.world.stage.children.length});
    };
    
    Game.prototype.calcShapesArea = function () {
        var area = this.world.stage.children.reduce(function(prev, current) {
            return prev + current.area;
        },  0);
        this.emit('shapesAreaChange', {shapesArea: area});
    };

    Game.prototype.incShapesSpawningSpeed = function () {
        this.cfg.shapesPerSec += 1;
        this.emit('shapesPerSecChange', {shapesPerSec: this.cfg.shapesPerSec});
    };
    
    Game.prototype.decShapesSpawningSpeed = function () {
        var shapesPerSec = this.cfg.shapesPerSec - 1;
        // prevent negative values
        this.cfg.shapesPerSec = shapesPerSec >= 0 ? shapesPerSec : 0;
        this.emit('shapesPerSecChange', {shapesPerSec: this.cfg.shapesPerSec});
    };
    
    Game.prototype.incGravity = function () {
        this.cfg.gravityForce += 1;
        this.emit('gravityForceChange', {gravityForce: this.cfg.gravityForce});
    };
    
    Game.prototype.decGravity = function () {
        this.cfg.gravityForce -= 1;
        this.emit('gravityForceChange', {gravityForce: this.cfg.gravityForce});
    };
    
    Game.prototype.instantiateShape = function (position) {
        // TODO Refactor it
        var self = this;
    
        if (!position) {
            // add start position
            position = {
                x: getRandomInRange(self.cfg.RADIUS, self.world.renderer.width - self.cfg.RADIUS),
                y: -(this.cfg.RADIUS)
            };
        }

        var shape;
        // random shape generator
        var shapeType = getRandomIntInRange(1, 6);
        switch(shapeType) {
            case 1:
            case 2:
            case 3:
            case 4:
                shape = createPolygon(position);
                break;
            case 5:
                shape = createCircle(position);
                break;
            case 6:
                shape = createEllipse(position);
                break;
            default:
                shape = createPolygon(position);
                break;
        }

        // add init velocityY
        shape.velocityY = 0;
        // notify observers with new data
        self.emit('instantiateShape', shape);
        self.calcShapesArea();
        self.calcShapesNumber();

        // shape creators
        function createCircle(pos) {
            var graphics = new PIXI.Graphics();
            // surface area of shape
            graphics.area = Math.PI * self.cfg.RADIUS * self.cfg.RADIUS;
            return graphics
                .beginFill(getRandomColor())
                .drawCircle(pos.x, pos.y, self.cfg.RADIUS)
                .endFill();
        }

        function createEllipse(pos) {
            var graphics = new PIXI.Graphics();
            // surface area of shape
            graphics.area = Math.PI * self.cfg.RADIUS * self.cfg.RADIUS/2;
            return graphics
                .beginFill(getRandomColor())
                .drawEllipse(pos.x, pos.y, self.cfg.RADIUS, self.cfg.RADIUS/2)
                .endFill();
        }

        function createPolygon(pos) {
            var VERTS = getRandomIntInRange(3, 6);

            // generate paths
            var paths = [];
            for (var i=0; i < VERTS; i++) {
                var xi = pos.x + self.cfg.RADIUS * Math.cos(360/2 * VERTS + (2 * Math.PI * i / VERTS ));
                var yi = pos.y + self.cfg.RADIUS * Math.sin(360/2 * VERTS + (2 * Math.PI * i / VERTS ));
                paths.push(xi, yi);
            }

            var graphics = new PIXI.Graphics();
            // length of edge
            var a = Math.sqrt((paths[0] - paths[2])*(paths[0] - paths[2]) + (paths[1] - paths[3])*(paths[1] - paths[3]));
            // surface area of shape
            graphics.area = 1/2 * self.cfg.RADIUS * VERTS * a;
            return graphics
                .beginFill(getRandomColor())
                .drawPolygon(paths)
                .endFill();
        }
    };

    Game.prototype.removeShape = function (shape) {
        var self = this;
        shape.destroy();
        self.calcShapesArea();
        self.calcShapesNumber();
    }

})();