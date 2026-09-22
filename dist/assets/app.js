(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("kaizen-site-theme");
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem("kaizen-site-theme", theme);
    document.querySelectorAll(".theme-toggle").forEach((button) => {
      button.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#18160F" : "#F6F1E6";
  }

  setTheme(savedTheme || (preferredDark ? "dark" : "light"));
  document.querySelectorAll(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));
  });

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  const observer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.12 })
    : null;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (observer) observer.observe(element);
    else element.classList.add("is-visible");
  });

  const range = document.querySelector("#days-range");
  const chart = document.querySelector("[data-growth-chart]");
  const daysOutput = document.querySelector("[data-days-output]");
  const growthOutput = document.querySelector("[data-growth-output]");
  const growthSentence = document.querySelector("[data-growth-sentence]");

  function formatGrowth(value) {
    if (value < 10) return `${value.toFixed(2)}×`;
    return `${value.toFixed(1)}×`;
  }

  function renderGrowth(days) {
    const growth = Math.pow(1.01, days);
    const formatted = formatGrowth(growth);
    if (daysOutput) daysOutput.textContent = days;
    if (growthOutput) growthOutput.textContent = formatted;
    if (growthSentence) growthSentence.textContent = `about ${formatted}`;
    if (!chart) return;
    const barCount = 14;
    chart.innerHTML = "";
    for (let i = 1; i <= barCount; i += 1) {
      const sampleDay = Math.max(1, Math.round((days / barCount) * i));
      const sampleValue = Math.pow(1.01, sampleDay);
      const ratio = growth === 1 ? 1 : (sampleValue - 1) / (growth - 1);
      const bar = document.createElement("span");
      bar.className = "growth-bar";
      bar.style.setProperty("--height", `${Math.max(12, 12 + ratio * 88)}%`);
      bar.style.setProperty("--opacity", String(0.25 + (i / barCount) * 0.75));
      bar.title = `Day ${sampleDay}: ${formatGrowth(sampleValue)}`;
      chart.appendChild(bar);
    }
  }

  if (range) {
    renderGrowth(Number(range.value));
    range.addEventListener("input", () => renderGrowth(Number(range.value)));
  }

  const stages = {
    fact: {
      number: "01",
      label: "FACT · UNDERSTAND",
      title: "Start with one clear idea.",
      body: "Short teaching cards explain the point in plain language, with the detail you need and none of the noise.",
      list: ["Small, focused explanations", "Visuals and examples in context", "A quick check before moving on"],
      demo: `<span class="demo-tag">FACT 1/4</span><div class="speech-card"><b>Speed tells us how fast distance changes.</b><p>Find it by dividing distance by time.</p><div class="formula">speed = distance ÷ time</div></div><button type="button" tabindex="-1">Got it</button>`
    },
    drill: {
      number: "02",
      label: "DRILL · REMEMBER",
      title: "Turn recognition into recall.",
      body: "Focused questions arrive in useful formats. Instant feedback corrects mistakes before they settle in.",
      list: ["Short, varied question sets", "Helpful feedback after every answer", "Missed ideas return for another try"],
      demo: `<span class="demo-tag">DRILL · 3/8</span><div class="speech-card"><b>A car travels 120 km in 2 hours. What is its speed?</b><button class="question-choice" tabindex="-1">40 km/h</button><button class="question-choice selected" tabindex="-1">60 km/h</button><button class="question-choice" tabindex="-1">240 km/h</button></div><button type="button" tabindex="-1">Check</button>`
    },
    challenge: {
      number: "03",
      label: "CHALLENGE · APPLY",
      title: "Use the idea with confidence.",
      body: "The final step mixes skills and asks you to apply what you know. It is where separate pieces become real understanding.",
      list: ["More demanding applications", "Ideas mixed across the level", "Stars and progress that reward mastery"],
      demo: `<span class="demo-tag">CHALLENGE COMPLETE</span><div class="challenge-badge">★</div><div class="speech-card"><b>Level mastered</b><p>You connected the facts, solved the questions, and finished the challenge.</p><div class="formula">3 steps · 1 stronger skill</div></div><button type="button" tabindex="-1">Continue</button>`
    }
  };

  document.querySelectorAll(".stage-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const stage = stages[tab.dataset.stage];
      if (!stage) return;
      document.querySelectorAll(".stage-tab").forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      const panel = document.querySelector("#panel-stage");
      panel.setAttribute("aria-labelledby", tab.id);
      panel.querySelector("[data-stage-number]").textContent = stage.number;
      panel.querySelector("[data-stage-label]").textContent = stage.label;
      panel.querySelector("[data-stage-title]").textContent = stage.title;
      panel.querySelector("[data-stage-body]").textContent = stage.body;
      panel.querySelector("[data-stage-list]").innerHTML = stage.list.map((item) => `<li>${item}</li>`).join("");
      panel.querySelector("[data-stage-demo]").innerHTML = stage.demo;
    });
  });

  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const subject = encodeURIComponent(`[Kaizen] ${data.get("subject")}`);
      const body = encodeURIComponent(`Hello Kaizen,\n\n${data.get("message")}\n\nFrom: ${data.get("name")}\nEmail: ${data.get("email")}`);
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = "Your email app is opening with the message ready.";
      window.location.href = `mailto:yehia.abdellatif01@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });
})();
