class Wall {
  constructor(x1, y1, x2, y2) {
    this.a = createVector(x1, y1);
    this.b = createVector(x2, y2);
  }

  show() {
    stroke(255);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
}


class Ray {
  constructor(x, y, heading) {
    this.pos = createVector(x, y);
    this.direction = createVector(0, -1);
    this.castDistance = 999999;
    this.heading = heading;
  }

  show() {
    stroke(180, 255, 200);
    line(this.pos.x, this.pos.y, (this.pos.x + this.direction.x * 10), (this.pos.y + this.direction.y * 10));
  }

  lookAt(x, y) {
    this.direction.x = x - this.pos.x;
    this.direction.y = y - this.pos.y;
    this.direction.normalize();
    this.rotate(this.heading/1.1);
  }

  cast(wall) {
    const x1 = wall.a.x;
    const x2 = wall.b.x;
    const y1 = wall.a.y;
    const y2 = wall.b.y;

    const x3 = this.pos.x;
    const x4 = this.pos.x + this.direction.x;
    const y3 = this.pos.y;
    const y4 = this.pos.y + this.direction.y;

    var den = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (den == 0) {
      return null;
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;

    if (t == 0) {
      return null;
    }

    den = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (den == 0) {
      return null;
    }

    const u = -1 * (((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den);

    if (u == 0) {
      return null;
    }

    if (t > 0 && t < 1 && u > 0) {
      var vector = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
      return vector;
    }

    return null;
  }

  rotate(degree) {
    const tmpX = this.direction.x;
    // convert degrees to radians needed
    this.direction.x = this.direction.x * cos(degree * 3.14 / 180) - this.direction.y * sin(degree * 3.14 / 180);
    this.direction.y = tmpX * sin(degree * 3.14 / 180) + this.direction.y * cos(degree * 3.14 / 180);
  }
}

class Cam {

  constructor(x, y, raysCount) {
    this.pos = createVector(x, y);
    this.direction = createVector(0, -1);
    this.raysCount = raysCount;
    this.raysDensity = 1;

    this.rays = [];

    for (var i = this.raysCount / 2 * -1; i <= 0; i++) {
      var newRay = new Ray(this.pos.x, this.pos.y, i);
      this.rays.push(newRay);
    }
    for (var i = 1; i < this.raysCount / 2; i++) {
      var newRay = new Ray(this.pos.x, this.pos.y, i);
      this.rays.push(newRay);
    }

  }

  lookAt(x, y) {
    this.direction.x = x - this.pos.x;
    this.direction.y = y - this.pos.y;
    this.direction.normalize();

    this.updateRays(x, y);
  }

  move() {
    if (keyIsPressed === false) {
      return;
    }

    if (keyCode === UP_ARROW) {
      if (this.pos.y - 3 > 0) {
        this.pos.y -= 3;
      }
    } else if (keyCode === DOWN_ARROW) {
      if (this.pos.y + 3 < height) {
        this.pos.y += 3;
      }
    } else if (keyCode === LEFT_ARROW) {
      if (this.pos.x - 3 > 0) {
        this.pos.x -= 3;
      }
    } else if (keyCode === RIGHT_ARROW) {
      if (this.pos.x + 3 < width) {
        this.pos.x += 3;
      }
    }
  }

  show() {
    for (var rayNumber = 0; rayNumber < this.raysCount; rayNumber++) {
      var ray = this.rays[rayNumber];
      ray.show();
      this.castWalls(rayNumber);
    }

    stroke(255, 100, 100);
    line(this.pos.x, this.pos.y, (this.pos.x + this.direction.x * 24), (this.pos.y + this.direction.y * 24));
  }
  
  castWalls(rayNumber) {
      var closestPoint = null;
      var closestDistance = 999999;
      var ray = this.rays[rayNumber];
    
      for (var w = 0; w < walls.length; w++) {
        const intersectPoint = ray.cast(walls[w]);

        if (intersectPoint == null) {
          continue;
        }

        var distance = this.pos.dist(intersectPoint);

        if (closestPoint != null) {
          if (distance <= closestDistance) {
            closestDistance = distance;
            closestPoint = intersectPoint;
          }
        } else {
          closestDistance = distance;
          closestPoint = intersectPoint;
        }
      }

      if (closestPoint != null) {
        fill(255, 100, 100);
        ellipse(closestPoint.x, closestPoint.y, 3, 3);
        line(this.pos.x, this.pos.y, closestPoint.x, closestPoint.y);
        this.rays[rayNumber].castDistance = closestDistance;
      }
  }

  updateRays(x, y) {
    for (var i = 0; i < this.raysCount; i++) {
      this.rays[i].pos = this.pos;
      this.rays[i].lookAt(x, y);
    }
  }

  render() {
    for (var i = 0; i < this.raysCount; i++) {
      var dist = this.rays[i].castDistance;

      fill(255 - dist * 0.3 * height / 200);
      noStroke();

      var pos_x = height + i * height / this.raysCount;
      var _height = height * 100 * 1 / dist;
      var pos_y = (height - _height) / 2;
      var _width = height / this.raysCount;

      rect(pos_x, pos_y, _width, _height);
    }
  }
}

var walls = [];
var cam;

function setup() {
  createCanvas(800, 400);

  walls.push(new Wall(0, 0, 0, 400));
  walls.push(new Wall(0, 0, 400, 0));
  walls.push(new Wall(0, 400, 400, 400));
  walls.push(new Wall(400, 0, 400, 400));

  walls.push(new Wall(280, 110, 280, 330));
  walls.push(new Wall(280, 110, 350, 110));
  walls.push(new Wall(220, 110, 280, 110));
  
  walls.push(new Wall(140, 110, 140, 330));
  walls.push(new Wall(140, 330, 210, 330));
  walls.push(new Wall(140, 330, 80, 330));

  cam = new Cam(340, 360, 40);
}

function draw() {

  background(0);
  
  let s = 'Use the keyboard arrows to move the camera. Use the mouse to rotate the camera.';
  fill(230);
  text(s, 10, 10, 270, 80);

  for (var i = 0; i < walls.length; i++) {
    walls[i].show();
  }

  cam.move();
  cam.lookAt(mouseX, mouseY);
  cam.show();
  cam.render();
}
