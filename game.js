const world = {
  country: "Kenya",
  cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret"],
  careers: ["Scientist", "Teacher", "Engineer", "Doctor", "Farmer", "Driver"]
};

const character = {
  name: "",
  age: 0,
  city: "Nairobi",
  health: 82,
  education: "None",
  career: "Unemployed",
  income: 0,
  wealth: 0,
  happiness: 70,
  events: []
};

const milestones = {
  7: "Your family adjusts after your father loses his job.",
  10: "You discover a love for science and your grades improve.",
  13: "A teacher notices your talent and encourages you to aim high.",
  18: "You finish secondary school and receive a college opportunity.",
  22: "You begin your first career and earn your own income.",
  25: "A tough economic year forces you to rethink your budget.",
  30: "Your experience opens the door to a more senior role.",
  40: "You mentor a younger person from your community.",
  60: "You begin thinking about the legacy you want to leave."
};

const careerIncome = {
  Scientist: 30000,
  Teacher: 24000,
  Engineer: 55000,
  Doctor: 80000,
  Farmer: 22000,
  Driver: 18000
};

const game = document.getElementById("screen");

function money(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0
  }).format(value);
}

function renderSetup() {
  game.innerHTML = `
    <section class="card hero">
      <p class="eyebrow">KENYA · LIFE SIMULATOR</p>
      <h1>Every year changes the story.</h1>
      <p class="muted">Start with a place, a name, and a little luck. Then see where life takes you.</p>
      <form id="setup-form">
        <label for="name">Your name</label>
        <input id="name" name="name" type="text" maxlength="24" placeholder="e.g. Amina" required>
        <label for="city">Born in</label>
        <select id="city" name="city">
          ${world.cities.map((city) => `<option>${city}</option>`).join("")}
        </select>
        <button type="submit">Begin your story</button>
      </form>
    </section>
  `;
  document.getElementById("setup-form").addEventListener("submit", startGame);
}

function startGame(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  character.name = form.get("name").trim();
  character.city = form.get("city");
  character.events = [`Born in ${character.city}, ${world.country}.`];
  renderGame();
}

function renderGame() {
  game.innerHTML = `
    <section class="card profile">
      <div>
        <p class="eyebrow">YOUR STORY · YEAR ${character.age}</p>
        <h1>${character.name}</h1>
        <p class="muted">${character.city}, Kenya</p>
      </div>
      <div class="age">${character.age}<small>years</small></div>
    </section>
    <section class="grid stats" aria-label="Character stats">
      <div class="stat"><span>Health</span><b>${character.health}%</b></div>
      <div class="stat"><span>Happiness</span><b>${character.happiness}%</b></div>
      <div class="stat"><span>Education</span><b>${character.education}</b></div>
      <div class="stat"><span>Career</span><b>${character.career}</b></div>
      <div class="stat"><span>Monthly income</span><b>${money(character.income)}</b></div>
      <div class="stat"><span>Savings</span><b>${money(character.wealth)}</b></div>
    </section>
    <section class="card timeline">
      <div class="section-heading"><h2>Life events</h2><span>${character.events.length} recorded</span></div>
      <div class="events">${character.events.slice().reverse().map((event) => `<p class="event">${event}</p>`).join("")}</div>
    </section>
    <button id="next-year">Live the next year <span aria-hidden="true">→</span></button>
    <button id="restart" class="secondary">Start a new life</button>
  `;
  document.getElementById("next-year").addEventListener("click", nextYear);
  document.getElementById("restart").addEventListener("click", renderSetup);
}

function nextYear() {
  if (character.age >= 85) return;
  character.age += 1;
  character.wealth += character.income * 12;
  character.health = Math.max(20, character.health - (character.age > 60 ? 2 : 1));
  character.happiness = Math.min(100, Math.max(20, character.happiness + (Math.random() > 0.45 ? 2 : -2)));

  if (character.age === 18) {
    character.education = "College";
    character.happiness += 5;
  }
  if (character.age === 22) {
    character.career = "Scientist";
    character.income = careerIncome.Scientist;
  }
  if (character.age === 25) {
    character.income = Math.max(0, character.income - 3000);
  }
  if (character.age === 30) {
    character.income += 10000;
  }

  const milestone = milestones[character.age];
  if (milestone) character.events.push(`Age ${character.age}: ${milestone}`);
  if (character.age === 25) character.events.push("Age 25: Rising costs trim your monthly income.");
  if (character.age === 30) character.events.push(`Age 30: Your income grows to ${money(character.income)} per month.`);
  renderGame();
}

renderSetup();
