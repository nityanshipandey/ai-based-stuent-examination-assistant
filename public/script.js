const $ = id => document.getElementById(id);

document.querySelectorAll("#tabs button").forEach(b => b.onclick = () => {
  document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
  ["doubt", "quiz", "plan", "eval"].forEach(t => $(t).classList.toggle("hide", t !== b.dataset.t));
});

async function ask(prompt) {
  const r = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Request failed");
  return d.text;
}

async function run(btn, out, prompt) {
  const old = btn.textContent;
  btn.disabled = true; btn.textContent = "Thinking..."; out.textContent = "";
  try { out.textContent = await ask(prompt); }
  catch (e) { out.innerHTML = '<div class="err"></div>'; out.firstChild.textContent = e.message; }
  btn.disabled = false; btn.textContent = old;
}

$("d-go").onclick = () => {
  const q = $("d-q").value.trim(); if (!q) return;
  run($("d-go"), $("d-out"),
    `You are a friendly exam tutor. Subject: ${$("d-sub").value || "General"}. Explain simply with a short example, then give a 2-line exam tip.\nStudent question: ${q}`);
};

$("p-go").onclick = () => {
  const s = $("p-sub").value.trim(); if (!s) return;
  run($("p-go"), $("p-out"),
    `Create a realistic day-by-day study plan (group days into weeks if long). Subjects: ${s}. Days left: ${$("p-days").value}. Hours/day: ${$("p-hrs").value}. Weak areas to prioritise: ${$("p-weak").value || "none"}. Include revision days, short breaks and a final-day checklist. Plain text, no tables.`);
};

$("e-go").onclick = () => {
  const q = $("e-q").value.trim(), a = $("e-a").value.trim(); if (!q || !a) return;
  run($("e-go"), $("e-out"),
    `You are a strict but kind examiner. Question: ${q}\nStudent answer: ${a}\nGive: Score out of 10, what was good, what was missing or wrong, and an improved model answer. Be concise.`);
};

let quizData = [];
$("q-go").onclick = async () => {
  const t = $("q-topic").value.trim(), out = $("q-out"), b = $("q-go");
  if (!t) return;
  b.disabled = true; b.textContent = "Generating..."; out.innerHTML = "";
  try {
    const txt = await ask(`Create ${$("q-n").value} ${$("q-lvl").value} multiple-choice questions on "${t}". Return ONLY a JSON array, no markdown fences: [{"q":string,"options":[4 strings],"answer":index 0-3,"why":short explanation}].`);
    const m = txt.match(/\[[\s\S]*\]/);
    quizData = JSON.parse(m ? m[0] : txt);
    renderQuiz();
  } catch (e) {
    out.innerHTML = '<div class="err">Could not create the quiz. Please try again.</div>';
  }
  b.disabled = false; b.textContent = "Generate Quiz";
};

function renderQuiz() {
  const out = $("q-out"); out.innerHTML = "";
  let score = 0, done = 0;
  const sc = document.createElement("p"); sc.style.fontWeight = "600"; out.appendChild(sc);
  quizData.forEach((x, i) => {
    const d = document.createElement("div"); d.className = "q";
    const h = document.createElement("div"); h.textContent = (i + 1) + ". " + x.q; h.style.fontWeight = "600"; d.appendChild(h);
    const ex = document.createElement("div"); ex.className = "exp hide"; ex.textContent = x.why || "";
    const bs = x.options.map((o, j) => {
      const b = document.createElement("button"); b.className = "opt"; b.textContent = o;
      b.onclick = () => {
        if (d.dataset.done) return; d.dataset.done = 1; done++;
        bs.forEach((y, k) => { if (k === x.answer) y.classList.add("ok"); });
        if (j === x.answer) score++; else b.classList.add("bad");
        ex.classList.remove("hide");
        sc.textContent = done === quizData.length ? `Final score: ${score} / ${quizData.length}` : "";
      };
      d.appendChild(b); return b;
    });
    d.appendChild(ex); out.appendChild(d);
  });
}
