// Chaos Icons Animation
(function() {
  const chaosBox = document.getElementById('chaos-box');
  if (!chaosBox) return;

  const icons = chaosBox.querySelectorAll('.chaos-icon');
  const boxRect = chaosBox.getBoundingClientRect();
  const boxWidth = 360;
  const boxHeight = 320;
  const iconSize = 56;

  const velocities = [];
  const rotations = [];
  const rotationSpeeds = [];
  const scales = [];
  const scaleDirections = [];

  icons.forEach((icon, index) => {
    const x = Math.random() * (boxWidth - iconSize);
    const y = Math.random() * (boxHeight - iconSize);
    
    icon.style.left = x + 'px';
    icon.style.top = y + 'px';
    
    velocities.push({
      x: (Math.random() - 0.5) * 1,
      y: (Math.random() - 0.5) * 1
    });
    
    const rotation = Math.random() * 360;
    icon.style.transform = `rotate(${rotation}deg)`;
    rotations.push(rotation);
    rotationSpeeds.push((Math.random() - 0.5) * 1);
    
    scales.push(1);
    scaleDirections.push(Math.random() > 0.5 ? 1 : -1);
  });

  let mouseX = -1000;
  let mouseY = -1000;
  const repulsionRadius = 100;
  const repulsionStrength = 5;

  chaosBox.addEventListener('mousemove', (e) => {
    const rect = chaosBox.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  chaosBox.addEventListener('mouseleave', () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  let lastTime = performance.now();

  function animate(currentTime) {
    const deltaTime = (currentTime - lastTime) / 16.67;
    lastTime = currentTime;

    icons.forEach((icon, index) => {
      let x = parseFloat(icon.style.left);
      let y = parseFloat(icon.style.top);
      
      x += velocities[index].x * deltaTime;
      y += velocities[index].y * deltaTime;

      if (x <= 0 || x >= boxWidth - iconSize) {
        velocities[index].x *= -1;
        x = Math.max(0, Math.min(x, boxWidth - iconSize));
      }
      if (y <= 0 || y >= boxHeight - iconSize) {
        velocities[index].y *= -1;
        y = Math.max(0, Math.min(y, boxHeight - iconSize));
      }

      const centerX = x + iconSize / 2;
      const centerY = y + iconSize / 2;
      const distX = centerX - mouseX;
      const distY = centerY - mouseY;
      const dist = Math.sqrt(distX * distX + distY * distY);

      if (dist < repulsionRadius) {
        const force = (repulsionRadius - dist) / repulsionRadius;
        const angle = Math.atan2(distY, distX);
        velocities[index].x += Math.cos(angle) * force * repulsionStrength * 0.1;
        velocities[index].y += Math.sin(angle) * force * repulsionStrength * 0.1;
      }

      velocities[index].x *= 0.99;
      velocities[index].y *= 0.99;

      const minSpeed = 0.3;
      if (Math.abs(velocities[index].x) < minSpeed) {
        velocities[index].x = (Math.random() - 0.5) * 2;
      }
      if (Math.abs(velocities[index].y) < minSpeed) {
        velocities[index].y = (Math.random() - 0.5) * 2;
      }

      rotations[index] += rotationSpeeds[index] * deltaTime;
      
      scales[index] += scaleDirections[index] * 0.0005 * deltaTime;
      if (scales[index] > 1.1) {
        scales[index] = 1.1;
        scaleDirections[index] = -1;
      } else if (scales[index] < 0.9) {
        scales[index] = 0.9;
        scaleDirections[index] = 1;
      }

      icon.style.left = x + 'px';
      icon.style.top = y + 'px';
      icon.style.transform = `rotate(${rotations[index]}deg) scale(${scales[index]})`;
    });

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();

// Navbar scroll effect
(function() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
})();

// Scroll fade-in animations
(function() {
  const fadeElements = document.querySelectorAll('.feature-card, .pricing-card, .ai-editor, .cta > div');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
})();

// Pricing toggle
(function() {
  const toggle = document.getElementById('pricing-toggle');
  const proPrice = document.getElementById('pro-price');
  
  if (!toggle || !proPrice) return;

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      proPrice.textContent = '72';
    } else {
      proPrice.textContent = '8';
    }
  });
})();

// Set current year in footer
(function() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();

// Smooth scroll for anchor links
(function() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
})();
