let car
let start
let target

let nn

let w = 0, h = 0

function setup() {
  w = windowWidth
  h = windowHeight
  createCanvas(w, h)
  start = createVector(300, 50)
  target = createVector(200, 350)
  car = new Car({ x: 100, y: 100, maxSpeed: 3, maxSteerAngle: 60 })

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
      [0],
      [.25],
      [1],
      [1],
      [1]
    ]
  }
  nn.train(trainConfig)

  angleMode(DEGREES)
}

function update() {
  let angle = (abs(atan2(target.x - car.backWheel.x, target.y - car.backWheel.y)) - abs(atan2(car.frontWheel.x - car.backWheel.x, car.frontWheel.y - car.backWheel.y)))
  // let angle = (atan2(target.x - car.backWheel.x, target.y - car.backWheel.y) - atan2(car.frontWheel.x - car.backWheel.x, car.frontWheel.y - car.backWheel.y))

  if (angle > 0)
    car.steerAngle = angle
  else
    car.steerAngle = -angle

  if (keyIsDown(65)) { // A
    car.steerAngle += .08
  } else if (keyIsDown(68)) { // D
    car.steerAngle -= .08
  } else {
    // car.steerAngle = car.steerAngle * .1
  }

  if (keyIsDown(32)) { // SPACE
    car.speed += -car.speed * .1
  } else {
    if (keyIsDown(87)) { // W
      car.speedUp()
    } else if (keyIsDown(83)) { // S
      car.speedUp(true)
    } else {
      car.speed += -car.speed * .01
    }
  }

  if (car.frontWheel.dist(target) < 10) {
    start = createVector(target.x, target.y)
    target = createVector(random() * w, random() * h)
  }


  let dis = (car.frontWheel.dist(target) / start.dist(target))
  let results = nn.predict([dis])
  let tag = results[0].tag
  let value = results[0].value
  car.speed = value * car.maxSpeed
  car.update()
}

function draw() {
  background(0)
  update()

  car.show()
  rectMode(CENTER)
  rect(target.x, target.y, 10, 10)
}
