let car
let start
let target

let nn

function setup() {
  createCanvas(400, 400)
  start = createVector(300, 50)
  target = createVector(100, 350)
  car = new Car(20, 200, 50)
  nn = new NeuralNetwork({ units: [1, 10, 1], learningRate: .3, momentumRate: .8 })
  let trainConfig = {
    epochs: 2000,
    inputs: [
      [0],
      [.25],
      [.50],
      [.75],
      [1]
    ],
    outputs: [
      [0],
      [.25],
      [.50],
      [.75],
      [1]
    ]
  }
  nn.train(trainConfig)
}

function update() {
  let relativeVector = p5.Vector.sub(target, car.frontWheel)
  push()
  stroke(255)
  strokeWeight(1)
  line(car.frontWheel.x, car.frontWheel.y, car.frontWheel.x + relativeVector.x, car.frontWheel.y + relativeVector.y)
  pop()
  let newSteer = relativeVector.x / relativeVector.mag()
  car.steerAngle = newSteer

  if (car.frontWheel.dist(target) < 10) {
    start = createVector(target.x, target.y)
    target = createVector(200, 200)
  }

  // if (keyIsDown(65)) { // A
  //   car.steerAngle += .08
  // } else if (keyIsDown(68)) { // D
  //   car.steerAngle -= .08
  // } else {
  //   car.steerAngle += -car.steerAngle * .1
  // }

  // if (keyIsDown(32)) { // SPACE
  //   car.speed += -car.speed * .1
  // } else {
  //   if (keyIsDown(87)) { // W
  //     car.speed += .05
  //   } else if (keyIsDown(83)) { // S
  //     car.speed -= .05
  //   } else {
  //     car.speed += -car.speed * .01
  //   }
  // }

  let dis = (car.frontWheel.dist(target) / start.dist(target))
  let results = nn.predict([dis])
  car.speed = results[0] * car.maxSpeed

  car.update()
}

function draw() {
  background(0)
  update()

  car.show()
  rectMode(CENTER)
  rect(target.x, target.y, 10, 10)
} 