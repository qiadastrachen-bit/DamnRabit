class ParticleField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.bursts = [];
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  burst(x, y, color = '#F8EEB8', count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.5 + Math.random() * 2.5;
      this.bursts.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        size: Math.random() < 0.4 ? 3 : 2,
        color,
      });
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    const count = Math.floor((this.canvas.width * this.canvas.height) / 12000);
    this.particles = Array.from({ length: Math.min(count, 80) }, () => this.createParticle());
  }

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      size: Math.random() < 0.3 ? 2 : 1,
      speedY: -(0.15 + Math.random() * 0.4),
      speedX: (Math.random() - 0.5) * 0.2,
      alpha: 0.2 + Math.random() * 0.5,
      twinkle: Math.random() * Math.PI * 2,
      color: Math.random() < 0.15 ? '#F8EEB8' : '#C8D8E8',
    };
  }

  update(intensity = 1, cursor = null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.bursts = this.bursts.filter(b => {
      b.x += b.vx;
      b.y += b.vy;
      b.vy += 0.06;
      b.life -= 0.025;
      if (b.life <= 0) return false;
      this.ctx.globalAlpha = b.life;
      this.ctx.fillStyle = b.color;
      this.ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.size, b.size);
      return true;
    });
    this.ctx.globalAlpha = 1;

    if (cursor && cursor.x > 0) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: cursor.x + (Math.random() - 0.5) * 20,
          y: cursor.y + (Math.random() - 0.5) * 20,
          size: 1,
          speedY: -(0.1 + Math.random() * 0.2),
          speedX: (Math.random() - 0.5) * 0.3,
          alpha: 0.5,
          twinkle: Math.random() * Math.PI * 2,
          color: '#F8EEB8',
        });
      }
      if (this.particles.length > 120) this.particles.splice(0, 10);
    }

    this.particles.forEach(p => {
      p.y += p.speedY * intensity;
      p.x += p.speedX * intensity;
      p.twinkle += 0.02;

      if (p.y < -10) {
        p.y = this.canvas.height + 10;
        p.x = Math.random() * this.canvas.width;
      }
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;

      const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = a;
      this.ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    });
    this.ctx.globalAlpha = 1;
  }
}

window.ParticleField = ParticleField;
