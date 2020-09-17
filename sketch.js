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
    this.rotate(this.heading / 1.1);
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

    let den = ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
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
      let vector = createVector(x1 + t * (x2 - x1), y1 + t * (y2 - y1));
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

    for (let i = this.raysCount / 2 * -1; i <= 0; i++) {
      let newRay = new Ray(this.pos.x, this.pos.y, i);
      this.rays.push(newRay);
    }
    for (let i = 1; i < this.raysCount / 2; i++) {
      let newRay = new Ray(this.pos.x, this.pos.y, i);
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
    for (let rayNumber = 0; rayNumber < this.raysCount; rayNumber++) {
      let ray = this.rays[rayNumber];
      ray.show();
      this.castWalls(rayNumber);
    }

    stroke(255, 100, 100);
    line(this.pos.x, this.pos.y, (this.pos.x + this.direction.x * 24), (this.pos.y + this.direction.y * 24));
  }

  castWalls(rayNumber) {
    let closestPoint = null;
    let closestDistance = 999999;
    let ray = this.rays[rayNumber];

    for (let w = 0; w < walls.length; w++) {
      const intersectPoint = ray.cast(walls[w]);

      if (intersectPoint == null) {
        continue;
      }

      let distance = this.pos.dist(intersectPoint);

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
    for (let i = 0; i < this.raysCount; i++) {
      this.rays[i].pos = this.pos;
      this.rays[i].lookAt(x, y);
    }
  }

  render() {
    // floor
    if (!use_dithering) {
      for (let i = 0; i <= 40; i++) {
        fill(80 - i);
        noStroke();
        rect(height, height - i * 4, height * 2, 4);
      }

      // walls
      for (let i = 0; i < this.raysCount; i++) {
        let dist = this.rays[i].castDistance;

        let pos_x = 400 + i * height / this.raysCount;
        let _height = height * 100 * 1 / dist;
        let pos_y = (height - _height) / 2;
        let _width = height / this.raysCount;

        let c = 255 - dist * 0.3 * height / 200;

        fill(c);
        rect(pos_x, pos_y, _width, _height);
      }
    } else {

      // walls
      for (let i = 0; i < this.raysCount; i++) {
        let dist = this.rays[i].castDistance;

        let pos_x = 400 + i * height / this.raysCount;
        let _height = height * 100 * 1 / dist;
        let pos_y = (height - _height) / 2;
        let _width = height / this.raysCount;

        let c = 255 - dist * 0.3 * height / 200;

        stroke(255);
        spriteFill(c, pos_x, _height);
      }
    }

  }
}

function spriteFill(color, pos_x, _height) {
    
  color = (Math.floor(color*16/255) + 1) * 16;
  _height = Math.floor((400 - _height) / 2);

  image(pg, pos_x, 0, 10, 400 - _height, color, 0, 10, 400 - _height);
  noStroke();
  fill(0);
  rect(pos_x, 0, pos_x + 10, _height);
}

function drawSprites() {
  pg.background(255);
  pg.fill(22);
  for (let i = 0; i < 16; i++) {
    fillWithDithering(255 - i * 16 , i * 16, 0, 16, 400);
  }
}

function fillWithDithering(color, pos_x, pos_y, _width, _height) {

  let color_16_bit = color / 16;
  let M = [
    [0,  8,  2,  10],
    [12, 4,  14, 6],
    [3,  11, 1,  9],
    [16, 7,  13, 5]
  ];

  let max_height = Math.floor(pos_y + _height);
  let max_width = Math.floor(pos_x + _width);

  pos_x = Math.floor(pos_x);
  pos_y = Math.floor(pos_y);

  if (pos_x < 0) {
    pos_x = 0;
  }

  if (pos_y < 0) {
    pos_y = 0;
  }

  if (max_height > 399) {
    max_height = 399;
  }

  if (max_width > 400 + 399) {
    max_width = 400 + 399;
  }

  for (let h = pos_y; h < max_height; h += 4) {
    for (let w = pos_x; w < max_width; w += 4) {

      for (let m_y = 0; m_y < 4; m_y++) {
        for (let m_x = 0; m_x < 4; m_x++) {

          let dw = w + m_x;
          let dh = h + m_y;

          if (color_16_bit >= M[m_x][m_y] && dw < pos_x + _width && dh < pos_y + _height) {
            pg.point(dw, dh);
          }

        }
      }
    }
  }

}


let walls = [];
let cam;
let checkbox;
let pg;
let use_dithering = false;

function setup() {
  createCanvas(800, 400);
  pg = createGraphics(260, 400);
  
  drawSprites();

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

  checkbox = createCheckbox('Dithering', false);
  checkbox.changed(myCheckedEvent);
  
}

function myCheckedEvent() {
  if (this.checked()) {
    use_dithering = true;
  } else {
    use_dithering = false;
  }
}


function draw() {

  background(0);

  for (let i = 0; i < walls.length; i++) {
    walls[i].show();
  }

  cam.move();
  cam.lookAt(mouseX, mouseY);
  cam.show();
  cam.render();
  
  let s = 'Use the keyboard arrows to move the camera. Use the mouse to rotate the camera.';
  fill(230);
  noStroke();
  text(s, 10, 10, 270, 80);
  text("FPS: " + Math.floor(frameRate()), 10, 60);
}