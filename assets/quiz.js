/* Quiz engine — expects window.QUIZ = { questions: [{page, q, opts, a, why}] } */
(function () {
  "use strict";

  var QUESTIONS = (window.QUIZ && window.QUIZ.questions) || [];
  var LETTERS = ["A", "B", "C", "D"];

  var deck = [];
  var idx = 0;
  var answered = [];

  var stage = document.getElementById("stage");
  var rail = document.getElementById("rail");
  var counter = document.getElementById("counter");
  var tally = document.getElementById("tally");

  function scrollTop() {
    try { window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (e) { try { window.scrollTo(0, 0); } catch (e2) {} }
  }

  function reveal(el) {
    if (el && typeof el.scrollIntoView === "function") {
      try { el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
      catch (e) { try { el.scrollIntoView(); } catch (e2) {} }
    }
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function buildDeck(source) {
    deck = shuffle(source).map(function (item) {
      var pairs = shuffle(item.opts.map(function (t, i) {
        return { t: t, correct: i === item.a };
      }));
      return {
        q: item.q,
        page: item.page,
        why: item.why,
        opts: pairs.map(function (p) { return p.t; }),
        a: pairs.findIndex(function (p) { return p.correct; }),
        src: item
      };
    });
    idx = 0;
    answered = deck.map(function () { return null; });
  }

  function drawRail() {
    rail.innerHTML = "";
    deck.forEach(function (_, i) {
      var el = document.createElement("div");
      el.className = "lamp";
      var res = answered[i];
      if (res) el.classList.add(res.ok ? "right" : "wrong");
      else if (i === idx) el.classList.add("now");
      rail.appendChild(el);
    });
    var right = answered.filter(function (r) { return r && r.ok; }).length;
    tally.textContent = String(right);
    counter.textContent = idx < deck.length
      ? "Fråga " + (idx + 1) + " av " + deck.length
      : "Klart · " + deck.length + " frågor";
  }

  function drawQuestion() {
    var item = deck[idx];
    var res = answered[idx];

    var card = document.createElement("section");
    card.className = "card";

    var head = document.createElement("div");
    head.className = "qhead";
    var num = document.createElement("span");
    num.className = "num";
    num.textContent = "Fråga " + (idx + 1);
    var pg = document.createElement("span");
    pg.textContent = item.page;
    head.append(num, pg);
    card.appendChild(head);

    var h = document.createElement("h2");
    h.className = "q";
    h.textContent = item.q;
    card.appendChild(h);

    var list = document.createElement("div");
    list.className = "opts";
    item.opts.forEach(function (text, i) {
      var b = document.createElement("button");
      b.className = "opt";
      b.type = "button";

      var key = document.createElement("span");
      key.className = "key";
      key.textContent = LETTERS[i];
      var txt = document.createElement("span");
      txt.className = "txt";
      txt.textContent = text;
      b.append(key, txt);

      if (res) {
        b.disabled = true;
        if (i === item.a) {
          b.classList.add("right");
          var m1 = document.createElement("span");
          m1.className = "mark";
          m1.textContent = "Rätt";
          b.appendChild(m1);
        } else if (i === res.chosen) {
          b.classList.add("wrong");
          var m2 = document.createElement("span");
          m2.className = "mark";
          m2.textContent = "Ditt svar";
          b.appendChild(m2);
        } else {
          b.classList.add("dim");
        }
      } else {
        b.addEventListener("click", function () { choose(i); });
      }
      list.appendChild(b);
    });
    card.appendChild(list);

    if (res) {
      var why = document.createElement("div");
      why.className = "why";
      why.setAttribute("role", "status");
      var lbl = document.createElement("strong");
      lbl.textContent = res.ok ? "Rätt svar" : "Förklaring";
      why.appendChild(lbl);
      why.appendChild(document.createTextNode(item.why));
      card.appendChild(why);

      var act = document.createElement("div");
      act.className = "actions";
      var next = document.createElement("button");
      next.className = "btn";
      next.type = "button";
      next.textContent = idx === deck.length - 1 ? "Visa resultat" : "Nästa fråga →";
      next.addEventListener("click", advance);
      act.appendChild(next);
      var hint = document.createElement("span");
      hint.className = "hint";
      hint.textContent = "eller tryck Enter";
      act.appendChild(hint);
      card.appendChild(act);

      stage.replaceChildren(card);
      reveal(why);
    } else {
      stage.replaceChildren(card);
    }
    drawRail();
  }

  function choose(i) {
    if (answered[idx]) return;
    answered[idx] = { chosen: i, ok: i === deck[idx].a };
    drawQuestion();
  }

  function advance() {
    if (idx < deck.length - 1) {
      idx++;
      drawQuestion();
      scrollTop();
    } else {
      idx = deck.length;
      drawResult();
    }
  }

  function drawResult() {
    var right = answered.filter(function (r) { return r && r.ok; }).length;
    var wrong = deck.length - right;
    var pct = Math.round((right / deck.length) * 100);

    var frag = document.createDocumentFragment();

    var board = document.createElement("div");
    board.className = "board";
    board.innerHTML =
      '<h2>Resultat</h2>' +
      '<div class="row ja"><span>Rätt</span><span class="v">' + right + '</span></div>' +
      '<div class="row nej"><span>Fel</span><span class="v">' + wrong + '</span></div>' +
      '<div class="row"><span>Andel rätt</span><span class="v">' + pct + '&nbsp;%</span></div>';
    frag.appendChild(board);

    var card = document.createElement("div");
    card.className = "card";

    var verdict = document.createElement("p");
    verdict.className = "verdict";
    verdict.textContent =
      pct === 100 ? "Alla rätt — du kan det här kapitlet." :
      pct >= 80 ? "Starkt. Repetera de få som blev fel så sitter det." :
      pct >= 60 ? "På god väg. Gå igenom de felaktiga en gång till." :
      "Läs igenom kapitlet en gång till och kör om quizet.";
    card.appendChild(verdict);

    var missed = deck.filter(function (_, i) { return answered[i] && !answered[i].ok; });
    if (missed.length) {
      var lead = document.createElement("p");
      lead.className = "lead";
      lead.textContent = "Att repetera:";
      card.appendChild(lead);

      var ul = document.createElement("ul");
      ul.className = "misslist";
      missed.forEach(function (item) {
        var li = document.createElement("li");
        var q = document.createElement("span");
        q.className = "qq";
        q.textContent = item.q;
        var a = document.createElement("span");
        a.className = "aa";
        a.textContent = "Rätt svar: " + item.opts[item.a] + " (" + item.page + ")";
        li.append(q, a);
        ul.appendChild(li);
      });
      card.appendChild(ul);
    }

    var act = document.createElement("div");
    act.className = "actions";
    if (missed.length) {
      var again = document.createElement("button");
      again.className = "btn";
      again.type = "button";
      again.textContent = "Öva på de " + missed.length + " felaktiga";
      again.addEventListener("click", function () {
        start(missed.map(function (m) { return m.src; }));
      });
      act.appendChild(again);
    }
    var restart = document.createElement("button");
    restart.className = missed.length ? "btn ghost" : "btn";
    restart.type = "button";
    restart.textContent = "Börja om";
    restart.addEventListener("click", function () { start(QUESTIONS); });
    act.appendChild(restart);
    card.appendChild(act);

    frag.appendChild(card);
    stage.replaceChildren(frag);
    drawRail();
    scrollTop();
  }

  document.addEventListener("keydown", function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (idx >= deck.length) return;
    if (answered[idx]) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
      return;
    }
    var pick = -1;
    if (/^[1-4]$/.test(e.key)) pick = Number(e.key) - 1;
    var letter = (e.key || "").toUpperCase();
    if (LETTERS.indexOf(letter) !== -1) pick = LETTERS.indexOf(letter);
    if (pick >= 0 && pick < deck[idx].opts.length) {
      e.preventDefault();
      choose(pick);
    }
  });

  function start(source) {
    buildDeck(source);
    drawQuestion();
    scrollTop();
  }

  start(QUESTIONS);
})();
