// =========================================
// KENYAN LIFE SIMULATOR
// CORE GAME ENGINE — V1 FOUNDATION
// =========================================

"use strict";

/* =========================================
   GAME STATE
========================================= */

const Game = {

    version: "1.0",

    state: {
        started: false,

        player: null,

        family: [],

        household: null,

        location: {
            country: "Kenya",
            county: "",
            subCounty: "",
            town: "",
            areaType: "urban"
        },

        finances: {
            cash: 0,
            bank: 0,
            mobileMoney: 0,
            savings: 0,
            debt: 0,
            assets: 0,
            netWorth: 0
        },

        currentEvent: null,

        year: 2026,

        lastSaved: null
    },

    /* =====================================
       INITIALIZE GAME
    ====================================== */

    init() {

        console.log("Kenyan Life Simulator starting...");

        this.bindEvents();

        this.loadSavedGame();

        if (!this.state.started) {
            this.showScreen("start-screen");
        }
    },


    /* =====================================
       DOM HELPERS
    ====================================== */

    $(id) {
        return document.getElementById(id);
    },


    /* =====================================
       SCREEN CONTROL
    ===================================== */

    showScreen(screenId) {

        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.remove("active");
        });

        const screen = this.$(screenId);

        if (screen) {
            screen.classList.add("active");
        }
    },


    /* =====================================
       BUTTON EVENTS
    ====================================== */

    bindEvents() {

        // Create life
        this.$("create-life-btn")?.addEventListener(
            "click",
            () => {
                this.showScreen("creation-screen");
            }
        );


        // Random life
        this.$("random-life-btn")?.addEventListener(
            "click",
            () => {
                this.startRandomLife();
            }
        );


        // Back
        this.$("back-to-start")?.addEventListener(
            "click",
            () => {
                this.showScreen("start-screen");
            }
        );


        // Creation mode buttons
        this.$("custom-character")?.addEventListener(
            "click",
            () => {
                this.setCreationMode("custom");
            }
        );


        this.$("generated-character")?.addEventListener(
            "click",
            () => {
                this.setCreationMode("random");
            }
        );


        // Character form
        this.$("character-form")?.addEventListener(
            "submit",
            event => {
                event.preventDefault();

                this.startCustomLife();
            }
        );


        // Age up
        this.$("age-up-btn")?.addEventListener(
            "click",
            () => {
                this.advanceLife();
            }
        );


        // Save
        this.$("save-btn")?.addEventListener(
            "click",
            () => {
                this.saveGame();

                this.notify("Life saved successfully.");
            }
        );


        // Family
        this.$("family-btn")?.addEventListener(
            "click",
            () => {
                this.showFamily();
            }
        );


        // Career
        this.$("career-btn")?.addEventListener(
            "click",
            () => {
                this.showMessage(
                    "Career",
                    "Career systems will unlock according to your age, education, skills and experience."
                );
            }
        );


        // Assets
        this.$("assets-btn")?.addEventListener(
            "click",
            () => {
                this.showMessage(
                    "Assets",
                    "Your asset system will track property, land, vehicles, businesses, livestock, savings and personal possessions."
                );
            }
        );


        // Finance
        this.$("finance-btn")?.addEventListener(
            "click",
            () => {
                this.showMessage(
                    "Finances",
                    "Your financial system will track income, expenses, savings, debt, investments and net worth."
                );
            }
        );


        // Modal close
        this.$("close-modal")?.addEventListener(
            "click",
            () => {
                this.closeModal();
            }
        );


        // Close modal by clicking background
        this.$("modal")?.addEventListener(
            "click",
            event => {

                if (event.target === this.$("modal")) {
                    this.closeModal();
                }

            }
        );

    }


    /* =====================================
       CREATION MODE
    ====================================== */

    setCreationMode(mode) {

        const custom = this.$("custom-character");
        const random = this.$("generated-character");

        if (mode === "custom") {

            custom?.classList.add("selected");
            random?.classList.remove("selected");

            this.enableCreationForm(true);

        } else {

            random?.classList.add("selected");
            custom?.classList.remove("selected");

            this.enableCreationForm(false);
        }
    }


    enableCreationForm(enabled) {

        const form = this.$("character-form");

        if (!form) {
            return;
        }

        const fields = form.querySelectorAll(
            "input, select"
        );

        fields.forEach(field => {

            // Keep the household selection usable.
            if (field.name === "household") {
                return;
            }

            field.disabled = !enabled;

        });
    }


    /* =====================================
       CUSTOM LIFE
    ====================================== */

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
            document.querySelector(
                'input[name="sex"]:checked'
            )?.value;

        const birthYear =
            Number(this.$("birth-year")?.value) || 2026;

        const birthMonth =
            Number(this.$("birth-month")?.value) || 1;

        const county =
            this.$("county")?.value || "Nairobi";

        const subCounty =
            this.$("sub-county")?.value || "Not selected";

        const household =
            document.querySelector(
                'input[name="household"]:checked'
            )?.value || "random";


        const playerName = [
            firstName,
            middleName,
            surname
        ]
        .filter(Boolean)
        .join(" ");


        this.state.player = {

            id: this.generateId(),

            firstName:
                firstName || "Baby",

            middleName,

            surname:
                surname || "Kenyan",

            nickname,

            sex:
                sex || "unknown",

            age: 0,

            birthYear,

            birthMonth,

            health: 100,

            education: "None",

            skills: {},

            career: null,

            experience: 0,

            reputation: 0,

            alive: true,

            name:
                nickname ||
                playerName ||
                "Baby Kenyan"
        };


        this.state.year = birthYear;


        this.state.location = {

            country: "Kenya",

            county,

            subCounty,

            town: this.getDefaultTown(county),

            areaType: "urban"
        };


        this.createHousehold(household);

        this.initializeFinances();

        this.state.started = true;

        this.state.currentEvent =
            this.createBirthEvent();


        this.updateDashboard();

        this.showScreen("dashboard-screen");

        this.saveGame();

        this.notify(
            "Your life has begun."
        );
    }


    /* =====================================
       RANDOM LIFE
    ====================================== */

    startRandomLife() {

        const counties = [
            "Nairobi",
            "Mombasa",
            "Kiambu",
            "Nakuru",
            "Kisumu",
            "Uasin Gishu",
            "Machakos",
            "Nyeri",
            "Meru",
            "Turkana",
            "Wajir",
            "Garissa",
            "Kakamega",
            "Kisii",
            "Bungoma",
            "Narok"
        ];


        const maleNames = [
            "Julius",
            "Brian",
            "Kevin",
            "Daniel",
            "Samuel",
            "David",
            "Ian",
            "Martin",
            "Collins",
            "Dennis"
        ];


        const femaleNames = [
            "Mary",
            "Ann",
            "Mercy",
            "Faith",
            "Grace",
            "Sharon",
            "Brenda",
            "Esther",
            "Lucy",
            "Wanjiku"
        ];


        const surnames = [
            "Mburu",
            "Otieno",
            "Kamau",
            "Mwangi",
            "Kiptoo",
            "Ochieng",
            "Mutua",
            "Njoroge",
            "Wanjala",
            "Omondi"
        ];


        const sex =
            Math.random() > 0.5
                ? "male"
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
            
