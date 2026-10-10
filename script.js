(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sequential typewriter love messages.
  const messageElement = document.getElementById("love-message");
  const cursor = document.getElementById("typing-cursor");
  const messages = [
    "You make my world feel like a dream.",
    "In a universe of stars, my heart finds you.",
    "Every beautiful thought somehow leads to you.",
    "You are my favorite kind of forever.",
    "If magic had a name, it would be REEM.",
    "Somehow, everything feels more beautiful with you.",
    "You are the sweetest chapter of my favorite story.",
    "If I could make one wish, it would be a thousand more moments with you."
  ];

  let messageIndex = 0;
  let typingTimer = null;
  let messageRunId = 0;
  let isPageVisible = !document.hidden;

  function clearTypingTimer() {
    if (typingTimer !== null) {
      window.clearTimeout(typingTimer);
      typingTimer = null;
    }
  }

  function scheduleTyping(callback, delay) {
    clearTypingTimer();
    typingTimer = window.setTimeout(callback, delay);
  }

  function typeMessage(index) {
    if (!messageElement || !cursor || !isPageVisible) return;
    const runId = ++messageRunId;
    const message = messages[index];
    let position = 0;
    messageElement.textContent = "";
    cursor.classList.remove("hidden");

    function typeNext() {
      if (runId !== messageRunId || !isPageVisible) return;
      position += 1;
      messageElement.textContent = message.slice(0, position);
      if (position < message.length) {
        const char = message.charAt(position - 1);
        const delay = char === "," || char === "—" ? 100 : char === "." ? 145 : 42 + Math.random() * 22;
        scheduleTyping(typeNext, delay);
      } else {
        cursor.classList.add("hidden");
        scheduleTyping(() => eraseMessage(index, runId), 2800);
      }
    }
    typeNext();
  }

  function eraseMessage(index, runId) {
    if (runId !== messageRunId || !isPageVisible) return;
    let current = messageElement.textContent;
    function eraseNext() {
      if (runId !== messageRunId || !isPageVisible) return;
      current = current.slice(0, -1);
      messageElement.textContent = current;
      if (current.length) {
        scheduleTyping(eraseNext, 17);
      } else {
        messageIndex = (index + 1) % messages.length;
        scheduleTyping(() => typeMessage(messageIndex), 320);
      }
    }
    cursor.classList.remove("hidden");
    eraseNext();
  }

  function startMessages() {
    if (!messageElement || !cursor) return;
    clearTypingTimer();
    if (prefersReducedMotion) {
      messageElement.textContent = messages[0];
      cursor.classList.add("hidden");
      return;
    }
    typeMessage(messageIndex);
  }

  document.addEventListener("visibilitychange", () => {
    isPageVisible = !document.hidden;
    if (document.hidden) {
      clearTypingTimer();
      messageRunId += 1;
    } else if (!prefersReducedMotion) {
      startMessages();
    }
  });
  startMessages();

  // Scroll reveal animations.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("in-view"));
  }

  // Mobile navigation.
  const menuToggle = document.getElementById("menu-toggle");
  const siteNav = document.getElementById("site-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  function closeMenu() {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    siteNav.classList.remove("open");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
      siteNav.classList.toggle("open", !expanded);
    });
    navLinks.forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });
    document.addEventListener("click", event => {
      if (siteNav.classList.contains("open") && !siteNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });
  }

  // Active navigation state and back-to-top visibility.
  const toTop = document.getElementById("to-top");
  const backTop = document.getElementById("back-top");
  const sectionIds = ["home", "little-world", "love-notes", "gallery"];
  const pageSections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  function handleScroll() {
    if (toTop) toTop.classList.toggle("visible", window.scrollY > 500);
    let activeId = "home";
    pageSections.forEach(section => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) activeId = section.id;
    });
    navLinks.forEach(link => {
      const isActive = link.getAttribute("href") === `#${activeId}`;
      link.classList.toggle("active", isActive);
    });
  }
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }
  if (toTop) toTop.addEventListener("click", scrollToTop);
  if (backTop) backTop.addEventListener("click", scrollToTop);

  // Hidden love note.
  const secretButton = document.getElementById("secret-button");
  const secretMessage = document.getElementById("secret-message");
  const closeSecret = document.getElementById("close-secret");
  if (secretButton && secretMessage) {
    secretButton.addEventListener("click", () => {
      secretMessage.hidden = false;
      secretButton.setAttribute("aria-expanded", "true");
      secretButton.textContent = "Your secret is open ♡";
      secretButton.classList.add("is-open");
      secretMessage.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "nearest" });
    });
    if (closeSecret) {
      closeSecret.addEventListener("click", () => {
        secretMessage.hidden = true;
        secretButton.setAttribute("aria-expanded", "false");
        secretButton.innerHTML = 'Open your little secret <span class="button-arrow">↗</span>';
        secretButton.focus();
      });
    }
  }

  // Art cards reveal a small message.
  const toast = document.getElementById("art-toast");
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }
  document.querySelectorAll("[data-art]").forEach(card => {
    const activate = () => showToast(card.dataset.art || "A little moment of wonder.");
    card.addEventListener("click", activate);
    card.addEventListener("keydown", event => {
      if ((event.key === "Enter" || event.key === " ") && card.tagName !== "BUTTON") {
        event.preventDefault();
        activate();
      }
    });
  });

  // Heart interaction: change the message and emit a small burst of hearts.
  const heartButton = document.getElementById("heart-button");
  const heartHint = document.getElementById("heart-hint");
  let heartClicks = 0;
  const heartMessages = [
    "A little heartbeat, just for you",
    "Sending a little extra warmth your way ♡",
    "Somewhere, a thought is smiling because of you ✧",
    "You make this little universe brighter"
  ];
  if (heartButton && heartHint) {
    heartButton.addEventListener("click", () => {
      heartClicks += 1;
      heartButton.classList.remove("popped");
      void heartButton.offsetWidth;
      heartButton.classList.add("popped");
      heartHint.textContent = heartMessages[heartClicks % heartMessages.length];
      if (!prefersReducedMotion) createHeartBurst(heartButton);
    });
  }

  function createHeartBurst(origin) {
    const rect = origin.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const symbols = ["♡", "✦", "✧"];
    for (let i = 0; i < 8; i += 1) {
      const particle = document.createElement("span");
      particle.textContent = symbols[i % symbols.length];
      particle.setAttribute("aria-hidden", "true");
      Object.assign(particle.style, {
        position: "fixed",
        left: `${centerX}px`,
        top: `${centerY}px`,
        zIndex: "60",
        pointerEvents: "none",
        color: i % 2 ? "#e9a6bd" : "#d9b68a",
        fontSize: `${12 + Math.random() * 12}px`,
        transition: "transform 750ms cubic-bezier(.2,.75,.25,1), opacity 750ms ease",
        opacity: "1"
      });
      document.body.appendChild(particle);
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 35 + Math.random() * 40;
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 80 - 40}deg)`;
        particle.style.opacity = "0";
      });
      window.setTimeout(() => particle.remove(), 800);
    }
  }

  // Lightweight, low-density star particles on a canvas.
  const canvas = document.getElementById("particle-canvas");
  const context = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  let particles = [];
  let animationFrame = null;
  let canvasWidth = 0;
  let canvasHeight = 0;
  const isSmallScreen = window.matchMedia("(max-width: 650px)").matches;
  const particleCount = prefersReducedMotion ? 0 : (isSmallScreen ? 24 : 48);

  function resizeCanvas() {
    if (!canvas || !context) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      radius: Math.random() * 1.25 + 0.25,
      alpha: Math.random() * 0.5 + 0.15,
      drift: Math.random() * 0.16 + 0.025,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function drawParticles() {
    if (!context || document.hidden || prefersReducedMotion) {
      animationFrame = null;
      return;
    }
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const time = performance.now() * 0.0005;
    particles.forEach(particle => {
      const shimmer = 0.55 + Math.sin(time + particle.phase) * 0.35;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 218, 231, ${particle.alpha * shimmer})`;
      context.fill();
      particle.y -= particle.drift;
      if (particle.y < -4) {
        particle.y = canvasHeight + 4;
        particle.x = Math.random() * canvasWidth;
      }
    });
    animationFrame = window.requestAnimationFrame(drawParticles);
  }

  function startParticles() {
    if (!context || prefersReducedMotion || document.hidden || animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(drawParticles);
  }
  function stopParticles() {
    if (animationFrame !== null) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  if (canvas && context && particleCount > 0) {
    resizeCanvas();
    startParticles();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopParticles();
      else startParticles();
    });
  }

  // Gentle pointer parallax on desktop only.
  if (!prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let pointerX = 0;
    let pointerY = 0;
    let pointerScheduled = false;
    const hero = document.querySelector(".hero");
    window.addEventListener("pointermove", event => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      if (pointerScheduled || !hero) return;
      pointerScheduled = true;
      requestAnimationFrame(() => {
        hero.style.setProperty("--pointer-x", `${pointerX * 5}px`);
        hero.style.setProperty("--pointer-y", `${pointerY * 5}px`);
        const orbit = hero.querySelector(".orbit-one");
        if (orbit) orbit.style.translate = `${pointerX * 4}px ${pointerY * 4}px`;
        pointerScheduled = false;
      });
    }, { passive: true });
  }
})();
