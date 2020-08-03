let car
let start
let target

let nn

let w = 0,
  h = 0,
  fr = 60,
  dt

function setup() {
  w = windowWidth
  h = windowHeight
  createCanvas(w, h)
  frameRate(fr)
  start = createVector(w / 2, 50)
  target = createVector(w / 2, 350)
  car = new Car({ x: w / 2, y: 100, maxSpeed: 2, maxSteerAngle: 30 })

  nn = new NeuralNetwork({
    units: [1, 10, 1],
    learningRate: .3,
    momentumRate: .8,
    tags: [
      'speed'
    ],
    softmax: false,
    sort: true
  })
  let trainConfig = {
    epochs: 2000,
    inputs: [
      [0],
      [.05],
      [.50],
      [.75],
      [1]
    ],
    outputs: [
      [1],
      [1],
      [1],
      [1],
      [1]
    ]
  }
  nn.train(trainConfig)

  angleMode(DEGREES)
}

function update() {
  dt = deltaTime / fr

  let relative = p5.Vector.sub(target, car.frontWheel)
  let carAngle = car.heading
  let targetAngle = atan2(target.x - car.frontWheel.x, target.y - car.frontWheel.y)
  let angle = targetAngle - carAngle
  // if (angle < 0)
  //   car.turnRight()
  // else
  //   car.turnLeft()
  car.applySteer(angle)

  strokeWeight(2)
  stroke(0, 0, 255)
  line(car.frontWheel.x, car.frontWheel.y, car.frontWheel.x + relative.x, car.frontWheel.y + relative.y)
  stroke(255, 0, 0)
  line(car.frontWheel.x, car.frontWheel.y + relative.y, car.frontWheel.x + relative.x, car.frontWheel.y + relative.y)
  stroke(0, 255, 0)
  line(car.frontWheel.x, car.frontWheel.y, car.frontWheel.x, car.frontWheel.y + relative.y)

  stroke(0)
  strokeWeight(1)

  if (keyIsDown(32)) { // SPACE
    car.speed += -car.speed * .1
  } else {
    if (keyIsDown(87)) { // W
      car.forward()
    } else if (keyIsDown(83)) { // S
      car.backward()
    } else {
      car.speed += -car.speed * .01
    }
  }

  if (car.frontWheel.dist(target) < 10) {
    start = createVector(target.x, target.y)
    target = createVector(random() * w, random() * h)
  }


  // let dis = (car.frontWheel.dist(target) / start.dist(target))
  // let results = nn.predict([dis])
  // let tag = results[0].tag
  // let value = results[0].value
  // car.speed = value * car.maxSpeed
  car.update()
}

function draw() {
  background(0)
  update()

  car.show()
  rectMode(CENTER)
  rect(target.x, target.y, 10, 10)
}
