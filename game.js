/* =========================================================
   KENYAN LIFE SIMULATOR - MAIN GAME ENGINE
   ========================================================= */

const Game = {

    state: {
        started: false,
        year: 2026,
        player: null,
        family: [],
        household: null,
        location: null,
        finances: null,
        assets: [],
        currentEvent: null,
        lastSaved: null
    },

    init() {
        console.log("Kenyan Life Simulator starting...");

        this.bindEvents();
        this.populateCounties();
        this.loadSavedGame();

        this.showScreen("start-screen");

        console.log("Game engine loaded successfully.");
    },

    /* =========================
       DOM
       ========================= */

    $(id) {
        return document.getElementById(id);
    },

    showScreen(id) {
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });

        const screen = this.$(id);

        if (screen) {
            screen.classList.add("active");
        }
    },

    notify(message) {
        const notification = this.$("notification");

        if (!notification) {
            alert(message);
            return;
        }

        notification.textContent = message;
        notification.classList.add("show");

        setTimeout(() => {
            notification.classList.remove("show");
        }, 3000);
    },

    /* =========================
       EVENTS
       ========================= */

    bindEvents() {

        const createBtn = this.$("create-life-btn");
        const randomBtn = this.$("random-life-btn");
        const continueBtn = this.$("continue-btn");
        const backBtn = this.$("back-to-start");
        const form = this.$("character-form");

        if (createBtn) {
            createBtn.addEventListener("click", () => {
                this.showScreen("creation-screen");
                this.setCreationMode("custom");
            });
        }

        if (randomBtn) {
            randomBtn.addEventListener("click", () => {
                this.startRandomLife();
            });
        }

        if (continueBtn) {
            continueBtn.addEventListener("click", () => {
                this.continueLife();
            });
        }

        if (backBtn) {
            backBtn.addEventListener("click", () => {
                this.showScreen("start-screen");
            });
        }

        if (form) {
            form.addEventListener("submit", event => {
                event.preventDefault();
                this.startCustomLife();
            });
        }

        const advanceBtn = this.$("advance-life-btn");

        if (advanceBtn) {
            advanceBtn.addEventListener("click", () => {
                this.advanceLife();
            });
        }

        const familyBtn = this.$("family-btn");

        if (familyBtn) {
            familyBtn.addEventListener("click", () => {
                this.showFamily();
            });
        }

        const assetsBtn = this.$("assets-btn");

        if (assetsBtn) {
            assetsBtn.addEventListener("click", () => {
                this.showAssets();
            });
        }

        const financesBtn = this.$("finances-btn");

        if (financesBtn) {
            financesBtn.addEventListener("click", () => {
                this.showFinances();
            });
        }

        const saveBtn = this.$("save-btn");

        if (saveBtn) {
            saveBtn.addEventListener("click", () => {
                this.saveGame();
            });
        }

        const county = this.$("county");

        if (county) {
            county.addEventListener("change", event => {
                this.populateSubCounties(event.target.value);
            });
        }
    },

    /* =========================
       LOCATION
       ========================= */

    populateCounties() {

        const countySelect = this.$("county");

        if (!countySelect || typeof KenyaLocations === "undefined") {
            return;
        }

        countySelect.innerHTML =
            `<option value="">Select county</option>`;

        Object.keys(KenyaLocations).forEach(county => {

            const option = document.createElement("option");

            option.value = county;
            option.textContent = county;

            countySelect.appendChild(option);
        });
    },

    populateSubCounties(county) {

        const subCountySelect = this.$("subcounty");

        if (!subCountySelect) {
            return;
        }

        subCountySelect.innerHTML =
            `<option value="">Select sub-county</option>`;

        subCountySelect.disabled = true;

        if (
            !county ||
            typeof KenyaLocations === "undefined" ||
            !KenyaLocations[county]
        ) {
            return;
        }

        KenyaLocations[county].subcounties.forEach(subCounty => {

            const option = document.createElement("option");

            option.value = subCounty;
            option.textContent = subCounty;

            subCountySelect.appendChild(option);
        });

        subCountySelect.disabled = false;
    },

    getRandomLocation() {

        const counties = Object.keys(KenyaLocations);

        const county =
            counties[Math.floor(Math.random() * counties.length)];

        const data = KenyaLocations[county];

        const subCounty =
            data.subcounties[
                Math.floor(Math.random() * data.subcounties.length)
            ];

        return {
            county,
            subCounty,
            town: data.town || county
        };
    },

    /* =========================
       CHARACTER CREATION
       ========================= */

    startCustomLife() {

        const firstName =
            this.$("first-name")?.value.trim();

        const middleName =
            this.$("middle-name")?.value.trim();

        const surname =
            this.$("surname")?.value.trim();

        const nickname =
            this.$("nickname")?.value.trim();

        const sex =
            this.$("sex")?.value;

        const birthYear =
            Number(this.$("birth-year")?.value) || this.state.year;

        const birthMonth =
            this.$("birth-month")?.value || "January";

        const county =
            this.$("county")?.value;

        const subCounty =
            this.$("subcounty")?.value;

        const householdType =
            this.$("household-type")?.value || "family";

        if (!firstName || !surname || !sex || !county || !subCounty) {

            this.notify(
                "Please complete your name, sex, county and sub-county."
            );

            return;
        }

        const location = {
            county,
            subCounty,
            town: KenyaLocations[county]?.town || county
        };

        this.createLife({
            firstName,
            middleName,
            surname,
            nickname,
            sex,
            birthYear,
            birthMonth,
            location,
            householdType
        });
    },

    startRandomLife() {

        const location = this.getRandomLocation();

        const maleNames = [
            "Julius",
            "Brian",
            "Kevin",
            "David",
            "Daniel",
            "Samuel",
            "Ian",
            "Victor",
            "Dennis",
            "Martin"
        ];

        const femaleNames = [
            "Mercy",
            "Faith",
            "Sharon",
            "Brenda",
            "Ann",
            "Mary",
            "Lydia",
            "Grace",
            "Esther",
            "Sheila"
        ];

        const surnames = [
            "Mburu",
            "Mwangi",
            "Kamau",
            "Ochieng",
            "Otieno",
            "Kiptoo",
            "Mutua",
            "Wanjiku",
            "Njoroge",
            "Kimani"
        ];

        const sex =
            Math.random() < 0.5 ? "Male" : "Female";

        const names =
            sex === "Male" ? maleNames : femaleNames;

        const firstName =
            names[Math.floor(Math.random() * names.length)];

        const surname =
            surnames[Math.floor(Math.random() * surnames.length)];

        const birthYear =
            this.state.year;

        this.createLife({
            firstName,
            middleName: "",
            surname,
            nickname: "",
            sex,
            birthYear,
            birthMonth: "January",
            location,
            householdType: "family"
        });
    },

    createLife(data) {

        this.state.started = true;
        this.state.year = data.birthYear;

        this.state.player = {
            id: this.generateId(),

            firstName: data.firstName,
            middleName: data.middleName,
            surname: data.surname,
            nickname: data.nickname,

            sex: data.sex,

            birthYear: data.birthYear,
            birthMonth: data.birthMonth,

            age: 0,

            health: 100,

            education: "Not yet started",
            career: "Child",

            skills: {
                communication: 5,
                mathematics: 5,
                science: 5,
                technology: 5,
                leadership: 5,
                physical: 5,
                creativity: 5,
                business: 5
            },

            reputation: 50,

            experience: 0,

            documents: {
                birthCertificate: true,
                nationalId: false,
                passport: false,
                kraPin: false,
                drivingLicence: false
            }
        };

        this.state.location = data.location;

        this.state.finances = {
            cash: 0,
            bank: 0,
            mobileMoney: 0,
            savings: 0,
            debt: 0,
            income: 0,
            expenses: 0
        };

        this.state.assets = [];

        this.createFamily();
        this.createHousehold();

        this.state.currentEvent = {
            title: "Welcome to Kenya",
            description:
                `${this.getFullName()} has been born in ${data.location.county}.`,
            type: "birth"
        };

        this.saveGame();
        this.updateDashboard();

        this.showScreen("dashboard-screen");

        this.notify(
            `Welcome to life, ${this.getFullName()}!`
        );
    },

    /* =========================
       FAMILY
       ========================= */

    createFamily() {

        const ageMother =
            22 + Math.floor(Math.random() * 16);

        const ageFather =
            24 + Math.floor(Math.random() * 18);

        this.state.family = [

            {
                id: this.generateId(),
                name: this.randomName("Female"),
                relation: "Mother",
                age: ageMother,
                occupation: "Informal worker",
                health: 90
            },

            {
                id: this.generateId(),
                name: this.randomName("Male"),
                relation: "Father",
                age: ageFather,
                occupation: "Worker",
                health: 90
            }
        ];

        const siblings =
            Math.floor(Math.random() * 3);

        for (let i = 0; i < siblings; i++) {

            this.state.family.push({

                id: this.generateId(),

                name:
                    this.randomName(
                        Math.random() < 0.5
                            ? "Male"
                            : "Female"
                    ),

                relation: "Sibling",

                age:
                    1 + Math.floor(Math.random() * 8),

                occupation: "Child",

                health: 95
            });
        }
    },

    randomName(sex) {

        const names =
            sex === "Male"
                ? ["John", "Peter", "David", "Samuel", "Brian"]
                : ["Mary", "Grace", "Faith", "Mercy", "Ann"];

        return names[
            Math.floor(Math.random() * names.length)
        ];
    },

    createHousehold() {

        this.state.household = {

            type: "Family household",

            members:
                this.state.family.length + 1,

            housing:
                this.randomHousing(),

            rooms:
                2 + Math.floor(Math.random() * 3),

            electricity:
                Math.random() > 0.2,

            water:
                Math.random() > 0.3,

            internet:
                Math.random() > 0.5,

            sanitation:
                "Basic",

            security:
                "Normal"
        };
    },

    randomHousing() {

        const housing = [
            "Permanent family house",
            "Rural homestead",
            "Iron-sheet house",
            "Rental house",
            "Basic permanent house"
        ];

        return housing[
            Math.floor(Math.random() * housing.length)
        ];
    },

    /* =========================
       TIME
       ========================= */

    advanceLife() {

        if (!this.state.started) {
            return;
        }

        const player = this.state.player;

        player.age++;

        this.state.year++;

        this.updateHealth();

        this.updateSkills();

        this.updateFinances();

        this.generateAgeEvent();

        this.updateFamilyAges();

        this.updateDashboard();

        this.saveGame();

        this.notify(
            `${player.age} years old — ${this.state.year}`
        );
    },

    updateFamilyAges() {

        this.state.family.forEach(member => {

            member.age++;

            if (member.health > 0 && Math.random() < 0.02) {
                member.health--;
            }
        });
    },

    updateHealth() {

        const player = this.state.player;

        let change = 0;

        if (player.age < 5) {
            change = Math.random() < 0.1 ? -2 : 0;
        } else if (player.age > 60) {
            change = Math.random() < 0.3 ? -1 : 0;
        } else {
            change = Math.random() < 0.05 ? -1 : 0;
        }

        player.health =
            Math.max(
                0,
                Math.min(
                    100,
                    player.health + change
                )
            );
    },

    updateSkills() {

        const skills =
            this.state.player.skills;

        Object.keys(skills).forEach(skill => {

            if (Math.random() < 0.4) {
                skills[skill] =
                    Math.min(100, skills[skill] + 1);
            }
        });

        this.state.player.experience += 1;
    },

    updateFinances() {

        const finance = this.state.finances;

        if (this.state.player.age >= 18) {

            const income =
                10000 +
                Math.floor(Math.random() * 25000);

            const expenses =
                5000 +
                Math.floor(Math.random() * 15000);

            finance.income = income;
            finance.expenses = expenses;

            finance.cash +=
                Math.max(0, income - expenses);
        }
    },

    /* =========================
       EVENTS
       ========================= */

    generateAgeEvent() {

        const age =
            this.state.player.age;

        let event;

        if (age === 1) {

            event = {
                title: "First Steps",
                description:
                    "Your family begins noticing your first major developmental milestones.",
                type: "childhood"
            };

        } else if (age === 4) {

            event = {
                title: "Early Childhood",
                description:
                    "You are approaching the age when formal early childhood education may begin.",
                type: "education"
            };

        } else if (age === 6) {

            event = {
                title: "Primary School",
                description:
                    "Your educational journey begins.",
                type: "education"
            };

        } else if (age === 14) {

            event = {
                title: "Teenage Years",
                description:
                    "Your interests, friendships and skills begin changing rapidly.",
                type: "life"
            };

        } else if (age === 18) {

            event = {
                title: "Adulthood",
                description:
                    "You can now begin making major independent decisions about work, education and your future.",
                type: "adult"
            };

        } else if (age === 22) {

            event = {
                title: "Career Development",
                description:
                    "Education, skills and experience can begin shaping your career path.",
                type: "career"
            };

        } else if (age === 30) {

            event = {
                title: "Building Your Future",
                description:
                    "Housing, relationships, assets, business and career decisions may become increasingly important.",
                type: "adult"
            };

        } else if (age === 60) {

            event = {
                title: "Later Life",
                description:
                    "Retirement, health, savings, family and inheritance become increasingly important.",
                type: "retirement"
            };

        } else {

            const events = [

                "A normal year passes.",
                "You meet new people.",
                "Your family faces an unexpected expense.",
                "You learn something useful.",
                "Your local community changes.",
                "Transport problems affect someone's plans.",
                "A family member gets an opportunity.",
                "You discover a new interest."
            ];

            event = {
                title: "Life Continues",
                description:
                    events[
                        Math.floor(
                            Math.random() * events.length
                        )
                    ],
                type: "normal"
            };
        }

        this.state.currentEvent = event;
    },

    /* =========================
       DASHBOARD
       ========================= */

    updateDashboard() {

        const player =
            this.state.player;

        if (!player) {
            return;
        }

        this.setText(
            "player-name",
            this.getFullName()
        );

        this.setText(
            "player-location",
            `${this.state.location.town}, ${this.state.location.subCounty}, ${this.state.location.county}`
        );

        this.setText(
            "age-value",
            player.age
        );

        this.setText(
            "health-value",
            `${player.health}%`
        );

        this.setText(
            "education-value",
            player.education
        );

        this.setText(
            "career-value",
            player.career
        );

        this.setText(
            "money-value",
            `KSh ${this.state.finances.cash.toLocaleString()}`
        );

        this.renderEvent();
        this.renderFamily();
        this.renderAssets();
    },

    setText(id, value) {

        const element = this.$(id);

        if (element) {
            element.textContent = value;
        }
    },

    getFullName() {

        const p =
            this.state.player;

        if (!p) {
            return "";
        }

        return [
            p.firstName,
            p.middleName,
            p.surname
        ]
                 : "female";
       


        const firstName =
            sex === "male"
                ? this.randomItem(maleNames)
                : this.randomItem(femaleNames);


        const surname =
            this.randomItem(surnames);


        const county =
            this.randomItem(counties);


        this.state.player = {

            id: this.generateId(),

            firstName,

            middleName: "",

            surname,

            nickname: "",

            sex,

            age: 0,

            birthYear: 2026,

            birthMonth:
                Math.floor(Math.random() * 12) + 1,

            health:
                this.randomNumber(75, 100),

            education: "None",

            skills: {},

            career: null,

            experience: 0,

            reputation: 0,

            alive: true,

            name:
                `${firstName} ${surname}`
        };


        this.state.year = 2026;


        this.state.location = {

            country: "Kenya",

            county,

            subCounty:
                this.randomSubCounty(county),

            town:
                this.getDefaultTown(county),

            areaType:
                Math.random() > 0.5
                    ? "urban"
                    : "rural"
        };


        this.createHousehold("random");

        this.initializeFinances();

        this.state.started = true;

        this.state.currentEvent =
            this.createBirthEvent();

        this.updateDashboard();

        this.showScreen("dashboard-screen");

        this.saveGame();

        this.notify(
            "A random Kenyan life has been generated."
        );
    }


    /* =====================================
       FAMILY / HOUSEHOLD
    ====================================== */

    createHousehold(type) {

        let householdType = type;

        if (householdType === "random") {

            const types = [
                "two-parent",
                "single-parent",
                "extended-family"
            ];

            householdType =
                this.randomItem(types);
        }


        const father =
            this.generateParent(
                "Father",
                "male"
            );

        const mother =
            this.generateParent(
                "Mother",
                "female"
            );


        this.state.family = [];


        if (
            householdType === "two-parent" ||
            householdType === "extended-family"
        ) {

            this.state.family.push(
                father
            );

            this.state.family.push(
                mother
            );

        } else if (
            householdType === "single-parent"
        ) {

            const parent =
                Math.random() > 0.5
                    ? father
                    : mother;

            this.state.family.push(
                parent
            );
        }


        // Random siblings
        let siblingCount = 0;


        if (
            householdType === "extended-family"
        ) {

            siblingCount =
                this.randomNumber(1, 5);

        } else {

            siblingCount =
                this.randomNumber(0, 3);
        }


        for (
            let i = 0;
            i < siblingCount;
            i++
        ) {

            this.state.family.push(
                this.generateSibling()
            );
        }


        this.state.household = {

            id: this.generateId(),

            type: householdType,

            members:
                this.state.family.length + 1,

            housing:
                this.generateHousing(),

            monthlyIncome:
                this.randomNumber(
                    8000,
                    85000
                ),

            monthlyExpenses:
                this.randomNumber(
                    5000,
                    50000
                )
        };
    }


    generateParent(role, sex) {

        return {

            id: this.generateId(),

            name:
                this.generateParentName(
                    sex
                ),

            role,

            sex,

            age:
                this.randomNumber(20, 45),

            education:
                this.randomItem([
                    "Primary",
                    "Secondary",
                    "Certificate",
                    "Diploma",
                    "Degree"
                ]),

            occupation:
                this.randomItem([
                    "Farmer",
                    "Teacher",
                    "Shopkeeper",
                    "Driver",
                    "Sales Worker",
                    "Casual Worker",
                    "Business Owner",
                    "Office Worker",
                    "Technician"
                ]),

            income:
                this.randomNumber(
                    7000,
                    70000
                ),

            health:
                this.randomNumber(
                    70,
                    100
                )
        };
    }


    generateSibling() {

        const sex =
            Math.random() > 0.5
                ? "male"
                : "female";


        return {

            id: this.generateId(),

            name:
                this.generateParentName(
                    sex
                ),

            role: "Sibling",

            sex,

            age:
                this.randomNumber(1, 17),

            education: "Age appropriate",

            health:
                this.randomNumber(
                    75,
                    100
                )
        };
    }


    generateParentName(sex) {

        const male = [
            "Peter",
            "James",
            "David",
            "John",
            "Samuel",
            "Joseph"
        ];

        const female = [
            "Mary",
            "Jane",
            "Grace",
            "Esther",
            "Ann",
            "Lucy"
        ];

        return sex === "male"
            ? this.randomItem(male)
            : this.randomItem(female);
    }


    generateHousing() {

        const houses = [

            {
                type: "Iron-sheet house",
                rooms: 2
            },

            {
                type: "Basic permanent house",
                rooms: 3
            },

            {
                type: "Apartment",
                rooms: 2
            },

            {
                type: "Rural homestead",
                rooms: 4
            },

            {
                type: "Single room",
                rooms: 1
            }
        ];


        return this.randomItem(houses);
    }


    /* =====================================
       FINANCES
    ====================================== */

    initializeFinances() {

        const startingCash =
            this.randomNumber(
                0,
                1000
            );


        this.state.finances = {

            cash: startingCash,

            bank: 0,

            mobileMoney: 0,

            savings: 0,

            debt: 0,

            assets: 0,

            netWorth: startingCash
        };
    }


    updateNetWorth() {

        const f =
            this.state.finances;


        f.netWorth =
            f.cash +
            f.bank +
            f.mobileMoney +
            f.savings +
            f.assets -
            f.debt;
    }


    /* =====================================
       BIRTH EVENT
    ====================================== */

    createBirthEvent() {

        const player =
            this.state.player;

        const location =
            this.state.location;


        return {

            id: this.generateId(),

            type: "birth",

            title:
                "Welcome to Kenya",

            description:
                `${player.name} has been born in ` +
                `${location.county}. ` +
                `Your life begins at Age 0. ` +
                `Your family, location and circumstances ` +
                `will shape the opportunities and challenges ahead.`,

            choices: [

                {
                    text:
                        "Begin my life",

                    action:
                        () => {

                            this.clearEvent();

                            this.notify(
                                "Your journey has begun."
                            );

                        }
                }

            ]
        };
    }


    /* =====================================
       AGE SYSTEM
    ====================================== */

    advanceLife() {

        if (
            !this.state.player ||
            !this.state.player.alive
        ) {

            return;
        }


        this.state.player.age++;

        this.state.year++;


        // Basic health change
        this.applyAgeHealthChange();


        // Household finances
        this.updateHouseholdFinances();


        // Generate an age-appropriate event
        this.state.currentEvent =
            this.generateAgeEvent();


        this.updateDashboard();

        this.saveGame();


        this.notify(
            `You are now ${this.state.player.age} years old.`
        );


        if (
            this.state.player.age >= 100
        ) {

            this.state.currentEvent = {

                id: this.generateId(),

                type: "death",

                title: "The End of a Long Life",

                description:
                    "Your character has reached an advanced age. " +
                    "The full mortality and inheritance system " +
                    "will eventually determine what happens next.",

                choices: [

                    {
                        text: "Continue",

                        action: () => {
            
/* =========================================================
   KENYA LOCATION ENGINE
   ========================================================= */

const KenyaLocations = {

    "Baringo": {
        town: "Kabarnet",
        subcounties: [
            "Baringo Central",
            "Baringo North",
            "Baringo South",
            "Eldama Ravine",
            "Mogotio",
            "Marigat",
            "Tiaty"
        ]
    },

    "Bomet": {
        town: "Bomet",
        subcounties: [
            "Bomet Central",
            "Bomet East",
            "Chepalungu",
            "Konoin",
            "Sotik"
        ]
    },

    "Bungoma": {
        town: "Bungoma",
        subcounties: [
            "Bumula",
            "Kabuchai",
            "Kanduyi",
            "Kimilili",
            "Mt Elgon",
            "Sirisia",
            "Tongaren",
            "Webuye East",
            "Webuye West"
        ]
    },

    "Busia": {
        town: "Busia",
        subcounties: [
            "Bunyala",
            "Butula",
            "Matayos",
            "Nambale",
            "Samia",
            "Teso North",
            "Teso South"
        ]
    },

    "Elgeyo-Marakwet": {
        town: "Iten",
        subcounties: [
            "Keiyo North",
            "Keiyo South",
            "Marakwet East",
            "Marakwet West"
        ]
    },

    "Embu": {
        town: "Embu",
        subcounties: [
            "Manyatta",
            "Mbeere North",
            "Mbeere South",
            "Runyenjes"
        ]
    },

    "Garissa": {
        town: "Garissa",
        subcounties: [
            "Balambala",
            "Dadaab",
            "Fafi",
            "Garissa Township",
            "Ijara",
            "Lagdera"
        ]
    },

    "Homa Bay": {
        town: "Homa Bay",
        subcounties: [
            "Homa Bay Town",
            "Kabondo Kasipul",
            "Karachuonyo",
            "Kasipul",
            "Mbita",
            "Ndhiwa",
            "Rangwe",
            "Suba"
        ]
    },

    "Isiolo": {
        town: "Isiolo",
        subcounties: [
            "Isiolo Central",
            "Isiolo North",
            "Merti"
        ]
    },

    "Kajiado": {
        town: "Kajiado",
        subcounties: [
            "Kajiado Central",
            "Kajiado North",
            "Kajiado South",
            "Kajiado West",
            "Loitokitok"
        ]
    },

    "Kakamega": {
        town: "Kakamega",
        subcounties: [
            "Butere",
            "Ikolomani",
            "Kakamega Central",
            "Kakamega East",
            "Kakamega North",
            "Kakamega South",
            "Khwisero",
            "Likuyani",
            "Lugari",
            "Lurambi",
            "Malava",
            "Matungu",
            "Mumias East",
            "Mumias West",
            "Navakholo"
        ]
    },

    "Kericho": {
        town: "Kericho",
        subcounties: [
            "Ainamoi",
            "Belgut",
            "Bureti",
            "Kipkelion East",
            "Kipkelion West",
            "Soin Sigowet"
        ]
    },

    "Kiambu": {
        town: "Kiambu",
        subcounties: [
            "Gatundu North",
            "Gatundu South",
            "Githunguri",
            "Juja",
            "Kabete",
            "Kiambaa",
            "Kiambu",
            "Kikuyu",
            "Limuru",
            "Lari",
            "Ruiru",
            "Thika East",
            "Thika West"
        ]
    },

    "Kilifi": {
        town: "Kilifi",
        subcounties: [
            "Ganze",
            "Kaloleni",
            "Kilifi North",
            "Kilifi South",
            "Magarini",
            "Malindi",
            "Rabai"
        ]
    },

    "Kirinyaga": {
        town: "Kerugoya",
        subcounties: [
            "Kirinyaga Central",
            "Kirinyaga East",
            "Kirinyaga West",
            "Mwea East",
            "Mwea West"
        ]
    },

    "Kisii": {
        town: "Kisii",
        subcounties: [
            "Bobasi",
            "Bomachoge Borabu",
            "Bomachoge Chache",
            "Bonchari",
            "Kitutu Chache North",
            "Kitutu Chache South",
            "Nyaribari Chache",
            "Nyaribari Masaba"
        ]
    },

    "Kisumu": {
        town: "Kisumu",
        subcounties: [
            "Kisumu Central",
            "Kisumu East",
            "Kisumu West",
            "Muhoroni",
            "Nyakach",
            "Nyando",
            "Seme"
        ]
    },

    "Kitui": {
        town: "Kitui",
        subcounties: [
            "Kitui Central",
            "Kitui East",
            "Kitui Rural",
            "Kitui South",
            "Kitui West",
            "Kyuso",
            "Mwingi Central",
            "Mwingi East",
            "Mwingi West"
        ]
    },

    "Kwale": {
        town: "Kwale",
        subcounties: [
            "Kinango",
            "Lunga Lunga",
            "Matuga",
            "Msambweni"
        ]
    },

    "Laikipia": {
        town: "Nanyuki",
        subcounties: [
            "Laikipia Central",
            "Laikipia East",
            "Laikipia North",
            "Laikipia West"
        ]
    },

    "Lamu": {
        town: "Lamu",
        subcounties: [
            "Lamu East",
            "Lamu West"
        ]
    },

    "Machakos": {
        town: "Machakos",
        subcounties: [
            "Kangundo",
            "Kathiani",
            "Machakos Town",
            "Matungulu",
            "Masinga",
            "Mavoko",
            "Mwala",
            "Yatta"
        ]
    },

    "Makueni": {
        town: "Wote",
        subcounties: [
            "Kaiti",
            "Kibwezi East",
            "Kibwezi West",
            "Kilome",
            "Makueni",
            "Mbooni"
        ]
    },

    "Mandera": {
        town: "Mandera",
        subcounties: [
            "Banissa",
            "Lafey",
            "Mandera East",
            "Mandera North",
            "Mandera South",
            "Mandera West"
        ]
    },

    "Marsabit": {
        town: "Marsabit",
        subcounties: [
            "Laisamis",
            "Loiyangalani",
            "Marsabit Central",
            "Moyale",
            "North Horr"
        ]
    },

    "Meru": {
        town: "Meru",
        subcounties: [
            "Buuri East",
            "Buuri West",
            "Igembe Central",
            "Igembe North",
            "Igembe South",
            "Imenti Central",
            "Imenti North",
            "Imenti South",
            "Tigania East",
            "Tigania West"
        ]
    },

    "Migori": {
        town: "Migori",
        subcounties: [
            "Awendo",
            "Kuria East",
            "Kuria West",
            "Nyatike",
            "Rongo",
            "Suna East",
            "Suna West",
            "Uriri"
        ]
    },

    "Mombasa": {
        town: "Mombasa",
        subcounties: [
            "Changamwe",
            "Jomvu",
            "Kisauni",
            "Likoni",
            "Mvita",
            "Nyali"
        ]
    },

    "Murang'a": {
        town: "Murang'a",
        subcounties: [
            "Gatanga",
            "Kahuro",
            "Kandara",
            "Kangema",
            "Kigumo",
            "Kiharu",
            "Mathioya",
            "Murang'a South"
        ]
    },

    "Nairobi": {
        town: "Nairobi",
        subcounties: [
            "Dagoretti North",
            "Dagoretti South",
            "Embakasi Central",
            "Embakasi East",
            "Embakasi North",
            "Embakasi South",
            "Embakasi West",
            "Kamukunji",
            "Kasarani",
            "Kibra",
            "Lang'ata",
            "Makadara",
            "Mathare",
            "Roysambu",
            "Ruaraka",
            "Starehe",
            "Westlands"
        ]
    },

    "Nakuru": {
        town: "Nakuru",
        subcounties: [
            "Bahati",
            "Gilgil",
            "Kuresoi North",
            "Kuresoi South",
            "Molo",
            "Naivasha",
            "Nakuru Town East",
            "Nakuru Town West",
            "Njoro",
            "Rongai",
            "Subukia"
        ]
    },

    "Nandi": {
        town: "Kapsabet",
        subcounties: [
            "Aldai",
            "Chesumei",
            "Emgwen",
            "Mosop",
            "Nandi Hills",
            "Tinderet"
        ]
    },

    "Narok": {
        town: "Narok",
        subcounties: [
            "Narok East",
            "Narok North",
            "Narok South",
            "Narok West",
            "Transmara East",
            "Transmara West"
        ]
    },

    "Nyamira": {
        town: "Nyamira",
        subcounties: [
            "Borabu",
            "Manga",
            "Masaba North",
            "Nyamira North",
            "Nyamira South"
        ]
    },

    "Nyandarua": {
        town: "Ol Kalou",
        subcounties: [
            "Kinangop",
            "Kipipiri",
            "Ndaragwa",
            "Ol Jorok",
            "Ol Kalou"
        ]
    },

    "Nyeri": {
        town: "Nyeri",
        subcounties: [
            "Kieni",
            "Mathira",
            "Mukurweini",
            "Nyeri Town",
            "Othaya",
            "Tetu"
        ]
    },

    "Samburu": {
        town: "Maralal",
        subcounties: [
            "Samburu East",
            "Samburu North",
            "Samburu West"
        ]
    },

    "Siaya": {
        town: "Siaya",
        subcounties: [
            "Bondo",
            "Gem",
            "Rarieda",
            "Ugenya",
            "Ugunja",
            "Siaya"
        ]
    },

    "Taita-Taveta": {
        town: "Voi",
        subcounties: [
            "Mwatate",
            "Taita",
            "Taveta",
            "Voi"
        ]
    },

    "Tana River": {
        town: "Hola",
        subcounties: [
            "Bura",
            "Galole",
            "Garsen"
        ]
    },

    "Tharaka-Nithi": {
        town: "Chuka",
        subcounties: [
            "Chuka/Igamba-Ng'ombe",
            "Maara",
            "Tharaka"
        ]
    },

    "Trans Nzoia": {
        town: "Kitale",
        subcounties: [
            "Cherangany",
            "Endebess",
            "Kiminini",
            "Kwanza",
            "Saboti"
        ]
    },

    "Turkana": {
        town: "Lodwar",
        subcounties: [
            "Loima",
            "Turkana Central",
            "Turkana East",
            "Turkana North",
            "Turkana South",
            "Turkana West"
        ]
    },

    "Uasin Gishu": {
        town: "Eldoret",
        subcounties: [
            "Ainabkoi",
            "Kapsaret",
            "Kesses",
            "Moiben",
            "Soy",
            "Turbo"
        ]
    },

    "Vihiga": {
        town: "Mbale",
        subcounties: [
            "Emuhaya",
            "Hamisi",
            "Luanda",
            "Sabatia",
            "Vihiga"
        ]
    },

    "Wajir": {
        town: "Wajir",
        subcounties: [
            "Buna",
            "Eldas",
            "Habaswein",
            "Tarbaj",
            "Wajir East",
            "Wajir North",
            "Wajir South",
            "Wajir West"
        ]
    },

    "West Pokot": {
        town: "Kapenguria",
        subcounties: [
            "Kipkomo",
            "Pokot Central",
            "Pokot North",
            "Pokot South",
            "West Pokot"
        ]
    }
};


/* Make available globally */

window.KenyaLocations = KenyaLocations;
                       /* =========================================================
   TIME ENGINE
   ========================================================= */

const TimeEngine = {

    advanceYear() {

        if (window.Game) {
            Game.advanceLife();
        }
    },

    getAge(birthYear, currentYear) {

        return currentYear - birthYear;
    },

    getLifeStage(age) {

        if (age < 3) return "Infant";
        if (age < 6) return "Early Childhood";
        if (age < 13) return "Childhood";
        if (age < 18) return "Teenager";
        if (age < 25) return "Young Adult";
        if (age < 40) return "Adult";
        if (age < 60) return "Middle Age";
        if (age < 75) return "Older Adult";

        return "Elderly";
    }
};

window.TimeEngine = TimeEngine;
                           /* =========================================================
   LIFE EVENT ENGINE
   ========================================================= */

const EventEngine = {

    randomEvent() {

        const events = [
            {
                title: "A New Opportunity",
                description: "Someone in your life presents you with an opportunity.",
                type: "opportunity"
            },
            {
                title: "Family Expense",
                description: "Your household has an unexpected expense.",
                type: "finance"
            },
            {
                title: "Community Event",
                description: "Something happens in your local community.",
                type: "community"
            },
            {
                title: "Learning",
                description: "You gain experience from something that happened this year.",
                type: "learning"
            },
            {
                title: "Change",
                description: "Your circumstances change and you have to adapt.",
                type: "life"
            }
        ];

        return events[
            Math.floor(Math.random() * events.length)
        ];
    },

    generate() {
        return this.randomEvent();
    }
};

window.EventEngine = EventEngine;
                           /* =========================================================
   PLAYER SYSTEM
   ========================================================= */

const PlayerSystem = {

    create(data) {

        return {
            id: Date.now(),

            firstName: data.firstName || "Unknown",
            middleName: data.middleName || "",
            surname: data.surname || "",

            sex: data.sex || "Unknown",

            age: 0,

            health: 100,

            education: "Not yet started",

            career: "Child",

            experience: 0,

            reputation: 50,

            skills: {
                communication: 5,
                mathematics: 5,
                science: 5,
                technology: 5,
                leadership: 5,
                physical: 5,
                creativity: 5,
                business: 5
            }
        };
    },

    fullName(player) {

        return [
            player.firstName,
            player.middleName,
            player.surname
        ]
            .filter(Boolean)
            .join(" ");
    }
};

window.PlayerSystem = PlayerSystem;
                           /* =========================================================
   FAMILY SYSTEM
   ========================================================= */

const FamilySystem = {

    createParent(relation) {

        const maleNames = [
            "John",
            "Peter",
            "David",
            "Samuel",
            "Joseph"
        ];

        const femaleNames = [
            "Mary",
            "Grace",
            "Faith",
            "Jane",
            "Esther"
        ];

        const names =
            relation === "Mother"
                ? femaleNames
                : maleNames;

        return {
            id: Date.now() + Math.random(),

            name:
                names[
                    Math.floor(
                        Math.random() * names.length
                    )
                ],

            relation,

            age:
                22 +
                Math.floor(
                    Math.random() * 20
                ),

            occupation:
                "Worker",

            health: 90
        };
    },

    createSibling() {

        const names = [
            "Brian",
            "Kevin",
            "Mercy",
            "Sharon",
            "Daniel"
        ];

        return {
            id: Date.now() + Math.random(),

            name:
                names[
                    Math.floor(
                        Math.random() * names.length
                    )
                ],

            relation: "Sibling",

            age:
                1 +
                Math.floor(
                    Math.random() * 10
                ),

            occupation: "Child",

            health: 95
        };
    }
};

window.FamilySystem = FamilySystem;
                           /* =========================================================
   HOUSEHOLD SYSTEM
   ========================================================= */

const HouseholdSystem = {

    create() {

        const housingTypes = [
            "Rural homestead",
            "Permanent family house",
            "Iron-sheet house",
            "Rental house",
            "Basic permanent house"
        ];

        return {

            type: "Family household",

            housing:
                housingTypes[
                    Math.floor(
                        Math.random() *
                        housingTypes.length
                    )
                ],

            rooms:
                2 +
                Math.floor(
                    Math.random() * 4
                ),

            electricity:
                Math.random() > 0.2,

            water:
                Math.random() > 0.3,

            sanitation:
                "Basic",

            internet:
                Math.random() > 0.5,

            security:
                "Normal"
        };
    }
};

window.HouseholdSystem = HouseholdSystem;
                           /* =========================================================
   SAVE SYSTEM
   ========================================================= */

const SaveSystem = {

    key: "kenyanLifeSimulatorSave",

    save(state) {

        localStorage.setItem(
            this.key,
            JSON.stringify(state)
        );

        return true;
    },

    load() {

        const data =
            localStorage.getItem(this.key);

        if (!data) {
            return null;
        }

        try {
            return JSON.parse(data);
        } catch (error) {
            console.error(
                "Save file error:",
                error
            );

            return null;
        }
    },

    exists() {

        return !!localStorage.getItem(
            this.key
        );
    },

    delete() {

        localStorage.removeItem(
            this.key
        );
    }
};

window.SaveSystem = SaveSystem;
