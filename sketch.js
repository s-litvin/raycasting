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
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.direction = createVector(0, -1);
    this.castDistance = 999999;
  }

  show() {
    stroke(180, 255, 200);
    line(this.pos.x, this.pos.y, (this.pos.x + this.direction.x * 10), (this.pos.y + this.direction.y * 10));
  }

  lookAt(x, y) {
    this.direction.x = x - this.pos.x;
    this.direction.y = y - this.pos.y;

    this.direction.normalize();
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

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));

    if (t == 0) {
      return null;
    }

    const u = -1 * (((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)));

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

    for (var i = 0; i < this.raysCount; i++) {
      var newRay = new Ray(this.pos.x, this.pos.y);
      newRay.rotate(i * this.raysDensity);
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
    for (var i = 0; i < this.raysCount; i++) {

      var ray = this.rays[i];
      ray.show();

      var closestPoint = null;
      var closestDistance = 999999;

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
        var middleI = this.raysCount / 2;
        if (i < middleI) {
          
        }
        
        this.rays[i].castDistance = closestDistance * cos(i*2/180);
        
      }
    }

    stroke(255, 100, 100);
    line(this.pos.x, this.pos.y, (this.pos.x + this.direction.x * 24), (this.pos.y + this.direction.y * 24));

  }

  updateRays(x, y) {

    for (var i = 0; i < this.raysCount; i++) {
      this.rays[i].pos = this.pos;
      this.rays[i].lookAt(x, y);
      this.rays[i].rotate(i);

    }
  }

  render() {
    for (var i = 0; i < this.raysCount; i++) {
      var dist = this.rays[i].castDistance;

      fill(255 - dist * 0.3 * height / 200);
      noStroke();
      
      var pos_x = 400 + i * height / this.raysCount;
      var _height = (400 - dist) * 1.7;
      var pos_y = (400 - _height) / 2;
      var _width = height / this.raysCount;
      
      rect(pos_x, pos_y, _width, _height);

    }
  }

}

var walls = [];
var ray;
var cam;

function setup() {
  createCanvas(800, 400);

  walls.push(new Wall(0, 0, 0, 400));
  walls.push(new Wall(0, 0, 400, 0));
  walls.push(new Wall(0, 400, 400, 400));
  walls.push(new Wall(400, 0, 400, 400));

  for (var i = 0; i < 5; i++) {
    walls.push(new Wall(random(0, 300), random(0, 300), random(0, 300), random(0, 300)));
  }

  ray = new Ray(160, 250);
  cam = new Cam(165, 249, 40);

}

function draw() {

  background(0);

  for (var i = 0; i < walls.length; i++) {
    walls[i].show();
  }

  cam.move();
  cam.lookAt(mouseX, mouseY);
  cam.show();
  cam.render();

}
