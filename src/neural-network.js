export class NeuralNetwork {
  constructor(count = 180) {
    this.nodes = Array.from({ length: count }, (_, i) => ({
      id: i,
      phase: Math.random() * Math.PI * 2,
      energy: Math.random(),
      links: []
    }));
    for (let i = 0; i < this.nodes.length; i++) {
      const targetCount = 2 + Math.floor(Math.random() * 4);
      for (let j = 0; j < targetCount; j++) {
        const target = Math.floor(Math.random() * this.nodes.length);
        if (target !== i && !this.nodes[i].links.includes(target)) this.nodes[i].links.push(target);
      }
    }
  }

  tick(dt, externalPulse = 0) {
    for (const node of this.nodes) {
      node.phase += dt * (1 + node.energy * 3);
      const wave = (Math.sin(node.phase) + 1) * .5;
      node.energy = Math.min(1, node.energy * .94 + wave * .06 + externalPulse * .03);
    }
    return this.nodes;
  }

  getActivity() {
    return this.nodes.reduce((sum, node) => sum + node.energy, 0) / this.nodes.length;
  }
}
