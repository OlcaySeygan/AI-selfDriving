class NeuralNetwork {
	constructor(config) {
		this.learningRate = config.learningRate
		this.momentumRate = config.momentumRate
		this.layers = [];
		for (let i = 0; i < config.units.length; i++) {
			this.layers[i] = new Layer();
			for (let j = 0; j < config.units[i]; j++) {
				let perceptron = new Perceptron()
				if (i > 0) perceptron.activation = 'sigmoid'
				this.layers[i].perceptrons[j] = perceptron
			}
			if (i != config.units.length - 1) {
				let bias = new Perceptron()
				this.layers[i].bias = bias
			}
		}

		for (let i = 0; i < this.layers.length - 1; i++) {
			const layer = this.layers[i];
			layer.connectTo(this.layers[i + 1])
		}


		this.fitness = 0;
	}

	feedForward() {
		this.layers.forEach(layer => {
			layer.feedForward()
		})
	}

	blackError() {
		this.layers.slice().reverse().forEach(layer => {
			layer.blackError()
		})
	}

	backPropagation() {
		this.layers.forEach(layer => {
			layer.backPropagation(this.learningRate, this.momentumRate)
		})
	}

	predict(inputs) {
		this.setInputs(inputs)
		this.feedForward()
		let outputs = []
		let layer = this.layers[this.layers.length - 1]
		let len = layer.perceptrons.length
		for (let i = 0; i < len; i++) {
			const perceptron = layer.perceptrons[i];
			outputs.push(perceptron.activatedValue())
		}
		return outputs
	}

	setInputs(inputs) {
		for (let i = 0; i < this.layers[0].perceptrons.length; i++) {
			const perceptron = this.layers[0].perceptrons[i]
			perceptron.value = inputs[i]
		}
	}
	setDesiredOutptus(desiredOutptus) {
		const index = this.layers.length - 1
		for (let i = 0; i < this.layers[index].perceptrons.length; i++) {
			const perceptron = this.layers[index].perceptrons[i]
			perceptron.desiredValue = desiredOutptus[i]
		}
	}

	train(config) {
		let inputs = config.inputs
		let outputs = config.outputs
		const epochs = config.epochs
		const inputLen = inputs.length
		const outputLen = outputs.length

		for (let i = 0; i < epochs; i++) {
			for (let j = 0; j < inputLen; j++) {
				this.setInputs(inputs[j])
				this.setDesiredOutptus(outputs[j])
				this.feedForward()
				this.blackError()
				this.backPropagation()
			}
		}
	}

	mutate(rate) {
		for (let i = 0; i < this.weights.length; i++) {
			for (let j = 0; j < this.weights[i].length; j++) {
				for (let z = 0; z < this.weights[i][j].length; z++) {
					if (random.next(0, 1) < rate) {
						this.weights[i][j][z] += random.gaussian();
					}
				}
			}
		}

		for (let i = 0; i < this.biases.length; i++) {
			for (let j = 0; j < this.biases[i].length; j++) {
				if (random.next(0, 1) < rate) {
					this.biases[i][j] += random.gaussian();
				}
			}
		}
	}

	crossover(other, rate) {
		let child = this.clone();

		for (let i = 0; i < child.weights.length; i++) {
			for (let j = 0; j < child.weights[i].length; j++) {
				for (let z = 0; z < child.weights[i][j].length; z++) {
					if (random.next(0, 1) < rate) {
						child.weights[i][j][z] = other.weights[i][j][z];
					}
				}
			}
		}

		for (let i = 0; i < child.biases.length; i++) {
			for (let j = 0; j < child.biases[i].length; j++) {
				if (random.next(0, 1) < rate) {
					child.biases[i][j] = other.biases[i][j];
				}
			}
		}
		child.fitness = 0;
		return child;
	}

	clone() {
		return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
	}
}

class Layer {
	constructor() {
		this.perceptrons = []
		this.bias = null
	}

	feedForward() {
		this.perceptrons.forEach(perceptron => {
			perceptron.feedForward()
		})
	}

	blackError() {
		this.perceptrons.forEach(perceptron => {
			perceptron.blackError()
		})

		if (this.bias != null) this.bias.blackError()
	}

	backPropagation(learningRate, momentumRate) {
		this.perceptrons.forEach(perceptron => {
			perceptron.backPropagation(learningRate, momentumRate)
		})

		if (this.bias != null) this.bias.backPropagation(learningRate, momentumRate)
	}

	connectTo(layer) {
		this.perceptrons.forEach(perceptron => {
			layer.perceptrons.forEach(other => {
				perceptron.connectTo(other)
			})
		})

		if (this.bias != null) {
			layer.perceptrons.forEach(other => {
				this.bias.connectTo(other)
			})
		}
	}
}

class Perceptron {
	constructor() {
		this.perceptronsTo = []
		this.perceptronsFrom = []
		this.synapsesTo = []
		this.synapsesFrom = []
		this.indexes = []
		this.value = 0
		this.error = 0
		this.desiredValue = null
		this.activation = 'identity'
		this.id = Math.random().toString(36).substr(2, 9)
	}

	activatedValue(derivate = false) {
		let value = 0
		switch (this.activation) {
			case 'relu':
				value = Activation.relu(this.value, derivate)
				break;

			case 'leakyRelu':
				value = Activation.leakyRelu(this.value, derivate)
				break;

			case 'sigmoid':
				value = Activation.sigmoid(this.value, derivate)
				break;

			default:
				value = Activation.identity(this.value, derivate)
				break;
		}
		return value
	}
	derivedValue() {
		return this.activatedValue(true)
	}

	feedForward() {
		if (this.perceptronsFrom.length == 0) return

		this.value = 0
		for (let i = 0; i < this.perceptronsFrom.length; i++) {
			const index = this.indexes[i];
			const perceptron = this.perceptronsFrom[index];
			const synapse = this.synapsesFrom[index];
			this.value += perceptron.activatedValue() * synapse.value
		}
	}

	blackError() {
		let derived = this.derivedValue()
		if (this.desiredValue != null) {
			this.error = (this.desiredValue - this.activatedValue()) * derived
			return
		}

		this.error = 0
		let len = this.perceptronsTo.length
		for (let i = 0; i < len; i++) {
			const perceptron = this.perceptronsTo[i]
			const synapse = this.synapsesTo[i];
			this.error += perceptron.error * synapse.value
		}
		this.error *= derived
	}

	backPropagation(learningRate, momentumRate) {
		let len = this.perceptronsTo.length
		for (let i = 0; i < len; i++) {
			const perceptron = this.perceptronsTo[i]
			const synapse = this.synapsesTo[i]
			synapse.error = (learningRate * this.activatedValue() * perceptron.error) + (momentumRate * synapse.error)
			synapse.value += synapse.error
		}
	}

	connectTo(perceptron, synapse = null) {
		if (synapse == null) synapse = new Synapse()
		this.perceptronsTo.push(perceptron)
		this.synapsesTo.push(synapse)
		perceptron.perceptronsFrom.push(this)
		perceptron.synapsesFrom.push(synapse)
		perceptron.indexes.push(perceptron.perceptronsFrom.length - 1)
	}
}

class Synapse {
	constructor(value = null) {
		this.value = value == null || typeof (value) !== float ? Random.next(-1, 1) : value
		this.error = 0
		this.id = Math.random().toString(36).substr(2, 9)
	}
}

class Generation {
	constructor(config) {
		if (config.generation && config.generation instanceof Generation) {
			let generation = config.generation;

			this.population = generation.population;

			generation.networks.map((x) => (x.fitness = x.fitness * x.fitness));
			let sum = generation.networks.reduce((a, b) => a + b.fitness, 0);
			if (sum == 0) {
				generation.networks.map((x) => (x.fitness = 0));
			} else {
				generation.networks.map((x) => (x.fitness = x.fitness / sum));
			}

			this.networks = [];
			for (let i = 0; i < generation.population; i++) {
				let other = generation.chooseOne();
				let network = generation.networks[i].crossover(other, generation.crossoverRate);
				network.mutate(generation.mutationRate);
				this.networks[i] = network;
			}

			this.mutationRate = generation.mutationRate;
			this.crossoverRate = generation.crossoverRate;
			return;
		}
		this.population = config.population;
		this.networks = [];
		for (let i = 0; i < config.population; i++) {
			this.networks[i] = new NeuralNetwork(config.units);
		}

		this.mutationRate = config.mutationRate;
		this.crossoverRate = config.crossoverRate;
	}

	chooseOne() {
		let r = random.next(0, 1);
		let index = parseInt(random.next(0, this.population));
		for (let i = 0; i < this.population; i++) {
			r -= this.networks[i].fitness;
			if (r < 0) {
				index = i;
				break;
			}
		}

		return this.networks[index];
	}

	bestOne() {
		let index = 0;
		let high = -1;
		for (let i = 0; i < this.population; i++) {
			if (high < this.networks[i].fitness) {
				high = this.networks[i].fitness;
				index = i;
			}
		}

		return this.networks[index];
	}
}

class Random {
	static next(min, max) {
		return Math.random() * (max - min) + min;
	}
	static gaussian(mu = 0, sigma = 1) {
		let v1, v2, rSquared;
		do {
			v1 = 2 * this.next(0, 1) - 1;
			v2 = 2 * this.next(0, 1) - 1;
			rSquared = v1 * v1 + v2 * v2;
		} while (rSquared >= 1 || rSquared == 0);

		let polar = Math.sqrt(-2 * Math.log(rSquared) / rSquared);
		return v1 * polar * sigma + mu;
	}
}

class Activation {
	static relu(value, derivate = false) {
		if (derivate) return value > 0 ? 1 : 0
		return Math.max(value, 0);
	}

	static leakyRelu(value, derivate = false, alpha = .01) {
		if (derivate) return value > 0 ? 1 : alpha
		return Math.max(value, value * alpha);
	}

	static sigmoid(value, derivate = false) {
		value = value < -45 ? 0 : (value > 45 ? 1 : (1 / (1 + Math.exp(-value))))
		if (derivate) return value * (1 - value)
		return value;
	}

	static identity(value, derivate = false) {
		if (derivate) return 1
		return value;
	}

	static softmax(array) {
		let sum = array.reduce((a, b) => a + b);
		return sum == 0 ? array.map((x) => 0) : array.map((x) => x / sum);
	}
}
