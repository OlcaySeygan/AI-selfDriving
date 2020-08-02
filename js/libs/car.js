class Car {
  constructor(config) {
    this.speed = 0
    this.maxSpeed = config.maxSpeed ? config.maxSpeed : 5
    this.pos = createVector(config.x, config.y)
    this.vel = createVector()
    this.acc = config.acc ? config.acc : .05
    this.brk = config.brk ? config.brk : .5

    this.maxSteerAngle = config.maxSteerAngle ? config.maxSteerAngle : 45
    this.steerAngle = 0

    this.heading = PI * 100
    this.wheelBase = 20

    this.frontWheel = createVector()
    this.backWheel = createVector()
  }

  show() {
    let angle
    // Start: Body of the Vehicle
    push()
    translate(this.pos.x, this.pos.y)
    rotate(-this.heading)
    rectMode(CENTER);
    noFill()
    stroke(255)
    strokeWeight(.5)
    rect(0, 0, this.wheelBase, this.wheelBase * 1.5)
    pop()
    // End: Body of the Vehicle

    // Start: the Front Axle of the Body
    push()
    translate(this.frontWheel.x, this.frontWheel.y)
    rotate(-this.heading)
    stroke(255)
    strokeWeight(1)
    line(-this.wheelBase / 2, 0, this.wheelBase / 2, 0)
    pop()
    // End: the Front Axle of the Body

    // Start: the Front Left Wheel
    push()
    angle = this.heading + 90
    translate(this.frontWheel.x + sin(angle) * this.wheelBase / 2, this.frontWheel.y + cos(angle) * this.wheelBase / 2)
    rotate(-this.steerAngle - this.heading)
    rectMode(CENTER)
    fill(255)
    rect(0, 0, this.wheelBase / 5, this.wheelBase / 2.5)
    pop()
    // End: the Front Left Wheel

    // Start: the Front Right Wheel
    push()
    angle = this.heading + 90
    translate(this.frontWheel.x - sin(angle) * this.wheelBase / 2, this.frontWheel.y - cos(angle) * this.wheelBase / 2)
    rotate(-this.steerAngle - this.heading)
    rectMode(CENTER)
    fill(255)
    rect(0, 0, this.wheelBase / 5, this.wheelBase / 2.5)
    pop()
    // End: the Front Right Wheel

    // Start: the Back Wheels
    push()
    translate(this.backWheel.x, this.backWheel.y)
    rotate(-this.heading)
    stroke(200)
    strokeWeight(1)
    line(-this.wheelBase / 2, 0, this.wheelBase / 2, 0)
    rectMode(CENTER)
    stroke(0)
    fill(200)
    rect(-this.wheelBase / 2, 0, this.wheelBase / 5, this.wheelBase / 2.5)
    rect(this.wheelBase / 2, 0, this.wheelBase / 5, this.wheelBase / 2.5)
    pop()
    // End: the Back Wheels
  }

  update() {
    this.frontWheel = createVector(this.pos.x + (this.wheelBase / 2) * sin(this.heading), this.pos.y + (this.wheelBase / 2) * cos(this.heading))
    this.backWheel = createVector(this.pos.x - (this.wheelBase / 2) * sin(this.heading), this.pos.y - (this.wheelBase / 2) * cos(this.heading))

    this.frontWheel.add(this.speed * sin(this.heading + this.steerAngle), this.speed * cos(this.heading + this.steerAngle), 0)
    this.backWheel.add(this.speed * sin(this.heading), this.speed * cos(this.heading), 0)

    this.heading = atan2(this.frontWheel.x - this.backWheel.x, this.frontWheel.y - this.backWheel.y)

    this.steerAngle = constrain(this.steerAngle, -this.maxSteerAngle, this.maxSteerAngle)
    this.speed = constrain(this.speed, -this.maxSpeed, this.maxSpeed)

    let dif = createVector(this.frontWheel.x - this.backWheel.x, this.frontWheel.y - this.backWheel.y)
    let norm = dif.normalize()
    this.vel = norm.mult(this.speed)
    this.pos.add(this.vel)
  }

  speedUp(backward = false) {
    this.speed += backward ? -this.acc : this.acc
  }
  speedDown() {
    this.speed -= this.brk
  }
}