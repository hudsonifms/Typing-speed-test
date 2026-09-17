/* ==========================================================================
   Typing Speed Test — vanilla JavaScript
   ========================================================================== */

(() => {
  "use strict";

  /* ------------------------------ Config -------------------------------- */

  const STORAGE_KEY = "typing-speed-test:personal-best";
  const TIMED_DURATION = 60; // seconds
  const TICK_MS = 100;

  const RESULT_COPY = {
    baseline: {
      title: "Baseline Established!",
      subtitle: "You've set the bar. Now the real challenge begins—time to beat it.",
      button: "Beat This Score",
      icon: "./assets/images/icon-completed.svg",
      isPb: false,
      confetti: false,
    },
    record: {
      title: "High Score Smashed!",
      subtitle: "You're getting faster. That was incredible typing.",
      button: "Beat This Score",
      icon: "./assets/images/icon-new-pb.svg",
      isPb: true,
      confetti: true,
    },
    complete: {
      title: "Test Complete!",
      subtitle: "Solid run. Keep pushing to beat your high score.",
      button: "Go Again",
      icon: "./assets/images/icon-completed.svg",
      isPb: false,
      confetti: false,
    },
  };

  /* ------------------------------- DOM ---------------------------------- */

  const el = {
    testView: document.getElementById("test-view"),
    resultsView: document.getElementById("results-view"),

    personalBest: document.getElementById("personal-best"),
    personalBestValue: document.getElementById("personal-best-value"),

    statWpm: document.getElementById("stat-wpm"),
    statAccuracy: document.getElementById("stat-accuracy"),
    statTime: document.getElementById("stat-time"),

    passage: document.getElementById("passage"),
    passageViewport: document.getElementById("passage-viewport"),
    input: document.getElementById("typing-input"),

    startOverlay: document.getElementById("start-overlay"),
    startBtn: document.getElementById("start-btn"),
    testFooter: document.getElementById("test-footer"),
    restartBtn: document.getElementById("restart-btn"),

    resultsIconWrap: document.getElementById("results-icon-wrap"),
    resultsIcon: document.getElementById("results-icon"),
    resultsTitle: document.getElementById("results-title"),
    resultsSubtitle: document.getElementById("results-subtitle"),
    resultWpm: document.getElementById("result-wpm"),
    resultAccuracy: document.getElementById("result-accuracy"),
    resultCorrect: document.getElementById("result-correct"),
    resultIncorrect: document.getElementById("result-incorrect"),
    againBtn: document.getElementById("again-btn"),
    againBtnText: document.getElementById("again-btn-text"),
    confetti: document.getElementById("results-confetti"),

    controls: Array.from(document.querySelectorAll(".control")),
  };

  /* ------------------------------ State --------------------------------- */

  const state = {
    passages: null,       // { easy: [...], medium: [...], hard: [...] }
    difficulty: "medium",
    mode: "timed",        // "timed" | "passage"

    text: "",             // passage currently on screen
    spans: [],            // one <span> per character
    charStates: [],       // painted state per character, to avoid useless DOM writes

    status: "idle",       // "idle" | "running" | "finished"
    typed: "",            // what the user has typed so far

    keystrokes: 0,        // every character ever typed (backspace excluded)
    errors: 0,            // every wrong keystroke ever — never decreases

    startedAt: 0,
    elapsed: 0,           // seconds
    timerId: null,

    personalBest: null,
  };

  /* --------------------------- Persistence ------------------------------ */

  function readPersonalBest() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const value = Number.parseInt(raw, 10);
      return Number.isFinite(value) && value > 0 ? value : null;
    } catch {
      return null; // private mode / storage disabled
    }
  }

  function writePersonalBest(wpm) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(wpm));
    } catch {
      /* nothing we can do — the session still works, it just won't persist */
    }
  }

  function renderPersonalBest() {
    if (state.personalBest === null) {
      el.personalBest.hidden = true;
      return;
    }
    el.personalBest.hidden = false;
    el.personalBestValue.textContent = state.personalBest;
  }

  /* ------------------------------ Helpers ------------------------------- */

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

  function pickPassage(difficulty) {
    const list = state.passages[difficulty] || [];
    if (list.length === 0) return "";

    // Avoid handing out the very same passage twice in a row.
    let candidate;
    do {
      candidate = list[Math.floor(Math.random() * list.length)];
    } while (list.length > 1 && candidate.text === state.text);

    return candidate.text;
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.round(seconds));
    if (state.mode === "timed") {
      // Matches the design, which shows a full minute as "0:60".
      return `0:${String(total).padStart(2, "0")}`;
    }
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  }

  function countCorrectChars() {
    let correct = 0;
    for (let i = 0; i < state.typed.length; i++) {
      if (state.typed[i] === state.text[i]) correct++;
    }
    return correct;
  }

  function currentWpm() {
    const minutes = state.elapsed / 60;
    if (minutes <= 0) return 0;
    // Net WPM: a "word" is 5 correctly typed characters.
    return Math.max(0, Math.round(countCorrectChars() / 5 / minutes));
  }

  function currentAccuracy() {
    if (state.keystrokes === 0) return 100;
    const correct = state.keystrokes - state.errors;
    return clamp(Math.round((correct / state.keystrokes) * 100), 0, 100);
  }

  function setStatTone(node, tone) {
    node.classList.toggle("is-good", tone === "good");
    node.classList.toggle("is-bad", tone === "bad");
    node.classList.toggle("is-running", tone === "running");
  }

  /* --------------------------- Passage render ---------------------------- */

  function renderPassage(text) {
    state.text = text;
    state.spans = [];
    state.charStates = [];

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < text.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = text[i];
      if (text[i] === " ") span.classList.add("char--space");
      fragment.appendChild(span);
      state.spans.push(span);
      state.charStates.push("pending");
    }

    el.passage.replaceChildren(fragment);
    el.passageViewport.scrollTop = 0;
    paintChars();
  }

  function paintChars() {
    const typedLength = state.typed.length;

    for (let i = 0; i < state.spans.length; i++) {
      let next;
      if (i < typedLength) {
        next = state.typed[i] === state.text[i] ? "correct" : "incorrect";
      } else if (i === typedLength && state.status === "running") {
        next = "current";
      } else {
        next = "pending";
      }

      if (state.charStates[i] === next) continue;

      const span = state.spans[i];
      span.classList.remove("char--correct", "char--incorrect", "char--current");
      if (next === "correct") span.classList.add("char--correct");
      else if (next === "incorrect") span.classList.add("char--incorrect");
      else if (next === "current") span.classList.add("char--current");

      state.charStates[i] = next;
    }
  }

  function keepCursorVisible() {
    const viewport = el.passageViewport;
    if (viewport.scrollHeight <= viewport.clientHeight) return;

    const span = state.spans[Math.min(state.typed.length, state.spans.length - 1)];
    if (!span) return;

    const spanRect = span.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();
    const line = spanRect.height || 40;

    if (spanRect.bottom > viewRect.bottom) {
      viewport.scrollTop += spanRect.bottom - viewRect.bottom + line;
    } else if (spanRect.top < viewRect.top) {
      viewport.scrollTop -= viewRect.top - spanRect.top + line;
    }
  }

  /* ------------------------------ Stats UI ------------------------------- */

  function renderStats() {
    const wpm = currentWpm();
    const accuracy = currentAccuracy();

    el.statWpm.textContent = String(wpm);
    el.statAccuracy.textContent = `${accuracy}%`;

    if (state.keystrokes === 0) {
      setStatTone(el.statAccuracy, "neutral");
    } else {
      setStatTone(el.statAccuracy, accuracy === 100 ? "good" : "bad");
    }

    const seconds =
      state.mode === "timed"
        ? Math.max(0, TIMED_DURATION - state.elapsed)
        : state.elapsed;

    el.statTime.textContent = formatTime(seconds);
    setStatTone(el.statTime, state.status === "running" ? "running" : "neutral");
  }

  /* ------------------------------- Timer --------------------------------- */

  function startTimer() {
    state.startedAt = Date.now();
    state.timerId = window.setInterval(tick, TICK_MS);
  }

  function stopTimer() {
    if (state.timerId !== null) {
      window.clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function tick() {
    state.elapsed = (Date.now() - state.startedAt) / 1000;

    if (state.mode === "timed" && state.elapsed >= TIMED_DURATION) {
      state.elapsed = TIMED_DURATION;
      renderStats();
      finishTest();
      return;
    }

    renderStats();
  }

  /* ---------------------------- Test lifecycle --------------------------- */

  function resetTest({ newPassage = true } = {}) {
    stopTimer();

    state.status = "idle";
    state.typed = "";
    state.keystrokes = 0;
    state.errors = 0;
    state.elapsed = 0;
    state.startedAt = 0;

    el.input.value = "";

    el.resultsView.hidden = true;
    el.testView.hidden = false;
    el.confetti.hidden = true;

    el.testView.classList.add("is-idle");
    el.startOverlay.hidden = false;
    el.testFooter.hidden = true;

    if (newPassage) {
      renderPassage(pickPassage(state.difficulty));
    } else {
      state.charStates = state.charStates.map(() => "");
      paintChars();
      el.passageViewport.scrollTop = 0;
    }

    renderStats();
  }

  function startTest() {
    if (state.status === "running") return;

    state.status = "running";
    el.testView.classList.remove("is-idle");
    el.startOverlay.hidden = true;
    el.testFooter.hidden = false;

    paintChars();
    renderStats();
    startTimer();

    el.input.focus({ preventScroll: true });
  }

  function finishTest() {
    if (state.status === "finished") return;

    stopTimer();
    state.status = "finished";

    const wpm = currentWpm();
    const accuracy = currentAccuracy();
    const correct = countCorrectChars();

    const hadPersonalBest = state.personalBest !== null;
    let variant;

    if (wpm > 0 && !hadPersonalBest) {
      variant = RESULT_COPY.baseline;
      state.personalBest = wpm;
      writePersonalBest(wpm);
    } else if (wpm > 0 && wpm > state.personalBest) {
      variant = RESULT_COPY.record;
      state.personalBest = wpm;
      writePersonalBest(wpm);
    } else {
      variant = RESULT_COPY.complete;
    }

    renderPersonalBest();
    renderResults(variant, { wpm, accuracy, correct, incorrect: state.errors });
  }

  function renderResults(variant, { wpm, accuracy, correct, incorrect }) {
    el.resultsIcon.src = variant.icon;
    el.resultsIconWrap.classList.toggle("results__icon--pb", variant.isPb);

    el.resultsTitle.textContent = variant.title;
    el.resultsSubtitle.textContent = variant.subtitle;
    el.againBtnText.textContent = variant.button;

    el.resultWpm.textContent = String(wpm);
    el.resultAccuracy.textContent = `${accuracy}%`;
    el.resultAccuracy.classList.toggle("is-good", accuracy === 100);
    el.resultAccuracy.classList.toggle("is-bad", accuracy < 100);

    el.resultCorrect.textContent = String(correct);
    el.resultIncorrect.textContent = `/${incorrect}`;

    el.confetti.hidden = !variant.confetti;

    el.testView.hidden = true;
    el.resultsView.hidden = false;
    el.againBtn.focus({ preventScroll: true });
  }

  /* ------------------------------ Typing --------------------------------- */

  function handleInput() {
    if (state.status !== "running") {
      // Typing on an idle test starts it, then the keystroke is processed.
      if (state.status === "idle" && el.input.value.length > 0) {
        startTest();
      } else {
        el.input.value = "";
        return;
      }
    }

    let value = el.input.value.replace(/[\r\n\t]/g, "");
    if (value.length > state.text.length) value = value.slice(0, state.text.length);
    el.input.value = value;

    // Only brand-new characters count as keystrokes; backspacing never
    // "refunds" an error, which is what the challenge asks for.
    for (let i = state.typed.length; i < value.length; i++) {
      state.keystrokes++;
      if (value[i] !== state.text[i]) state.errors++;
    }

    state.typed = value;

    // Keep the elapsed time fresh so WPM reacts to the very first keystroke.
    state.elapsed = (Date.now() - state.startedAt) / 1000;

    paintChars();
    keepCursorVisible();
    renderStats();

    if (state.typed.length === state.text.length && state.text.length > 0) {
      finishTest();
    }
  }

  function focusInput() {
    if (state.status === "finished") return;
    el.input.focus({ preventScroll: true });
  }

  /* ----------------------------- Controls -------------------------------- */

  function closeAllDropdowns(except) {
    for (const control of el.controls) {
      if (control === except) continue;
      control.classList.remove("is-open");
      const trigger = control.querySelector(".control__trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
  }

  function setControlValue(control, value) {
    const name = control.dataset.control;
    const options = Array.from(control.querySelectorAll(".option"));

    for (const option of options) {
      const selected = option.dataset.value === value;
      option.setAttribute("aria-checked", selected ? "true" : "false");
      option.tabIndex = selected ? 0 : -1;
      if (selected) {
        const text = control.querySelector("[data-trigger-text]");
        if (text) text.textContent = option.textContent.trim();
      }
    }

    if (name === "difficulty") {
      if (state.difficulty === value) return;
      state.difficulty = value;
      resetTest({ newPassage: true });
    } else if (name === "mode") {
      if (state.mode === value) return;
      state.mode = value;
      // Same passage, fresh run — only the timing rules changed.
      resetTest({ newPassage: false });
    }
  }

  function wireControl(control) {
    const trigger = control.querySelector(".control__trigger");
    const options = Array.from(control.querySelectorAll(".option"));

    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = control.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
      closeAllDropdowns(control);
    });

    for (const option of options) {
      option.addEventListener("click", () => {
        setControlValue(control, option.dataset.value);
        closeAllDropdowns();
        focusInput();
      });
    }

    // Arrow-key navigation inside the radio group.
    control.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
      if (!keys.includes(event.key)) return;
      if (!options.includes(document.activeElement)) return;

      event.preventDefault();
      const index = options.indexOf(document.activeElement);
      const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      const next = options[(index + step + options.length) % options.length];

      next.focus();
      setControlValue(control, next.dataset.value);
    });
  }

  /* ------------------------------- Errors -------------------------------- */

  function showLoadError(error) {
    el.startOverlay.hidden = true;
    el.testView.classList.remove("is-idle");
    el.passage.textContent =
      "Could not load data.json. Open the project through a local web server " +
      "(for example: npx serve) instead of double-clicking index.html — " +
      "browsers block fetch() on file:// URLs.";
    console.error("[typing-speed-test]", error);
  }

  /* -------------------------------- Boot --------------------------------- */

  function wireEvents() {
    el.startBtn.addEventListener("click", startTest);
    el.restartBtn.addEventListener("click", () => {
      resetTest({ newPassage: true });
      focusInput();
    });
    el.againBtn.addEventListener("click", () => {
      resetTest({ newPassage: true });
      focusInput();
    });

    // Clicking the passage starts the test, exactly like the start button.
    el.passageViewport.addEventListener("mousedown", (event) => {
      if (state.status === "finished") return;
      event.preventDefault();
      if (state.status === "idle") startTest();
      else focusInput();
    });

    el.input.addEventListener("input", handleInput);

    el.controls.forEach(wireControl);

    document.addEventListener("click", () => closeAllDropdowns());

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAllDropdowns();
        return;
      }

      const printable =
        event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!printable) return; // Tab, arrows, Enter… stay available for navigation

      const active = document.activeElement;
      // Space has to keep activating whatever button currently has focus.
      if (event.key === " " && active && active.tagName === "BUTTON") return;

      // Typing anywhere kicks off an idle test, or brings the caret back to the
      // capture field if focus drifted mid-test. Focusing during `keydown` means
      // this very character still lands in the field.
      if (state.status === "idle") {
        startTest();
      } else if (state.status === "running" && active !== el.input) {
        el.input.focus({ preventScroll: true });
      }
    });

    window.addEventListener("resize", () => {
      if (state.status === "running") keepCursorVisible();
    });
  }

  async function init() {
    state.personalBest = readPersonalBest();
    renderPersonalBest();
    wireEvents();

    try {
      const response = await fetch("./data.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.passages = await response.json();
    } catch (error) {
      showLoadError(error);
      return;
    }

    for (const control of el.controls) {
      const checked = control.querySelector('.option[aria-checked="true"]');
      setControlValue(control, checked ? checked.dataset.value : "");
    }

    resetTest({ newPassage: true });
  }

  init();
})();
