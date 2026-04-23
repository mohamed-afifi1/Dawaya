import { Router } from "./router.js";
import { SearchModule } from "./search.js";
import { InventoryModule } from "./inventory.js";

const AuthModule = {
  state: {
    user: null,
  },

  async init() {
    this.bindEvents();
    await this.refreshSession();
  },

  bindEvents() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const showLoginTab = document.getElementById("showLoginTab");
    const showRegisterTab = document.getElementById("showRegisterTab");

    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener("submit", (e) => this.handleRegister(e));
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    if (showLoginTab) {
      showLoginTab.addEventListener("click", () => this.switchAuthTab("login"));
    }

    if (showRegisterTab) {
      showRegisterTab.addEventListener("click", () => this.switchAuthTab("register"));
    }
  },

  async refreshSession() {
    try {
      const res = await fetch("DB_Ops.php?action=get_session").then((r) => r.json());
      this.state.user = res?.success ? res.data?.user : null;
      this.applyAuthUI();
    } catch (error) {
      this.state.user = null;
      this.applyAuthUI();
    }
  },

  async handleLogin(e) {
    e.preventDefault();

    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");
    const username = usernameInput?.value?.trim() || "";
    const password = passwordInput?.value || "";

    if (!username || !password) {
      this.setAuthMessage("Please enter username and password.", true);
      return;
    }

    const body = new FormData();
    body.append("action", "login");
    body.append("username", username);
    body.append("password", password);

    try {
      const res = await fetch("DB_Ops.php", {
        method: "POST",
        body,
      }).then((r) => r.json());

      if (!res.success) {
        this.state.user = null;
        this.applyAuthUI();
        this.setAuthMessage(res.error || "Login failed.", true);
        return;
      }

      this.state.user = res.data.user;
      this.applyAuthUI();
      this.setAuthMessage(`Signed in as ${this.state.user.full_name} (${this.state.user.role}).`, false);
      Router.switchSection("searchSection");
      window.location.hash = "#search";

      if (passwordInput) passwordInput.value = "";
      const currentQuery = document.getElementById("searchInput")?.value?.trim() || "";
      if (currentQuery.length >= 2) {
        SearchModule.executeSearch(currentQuery);
      }
      InventoryModule.loadTable();
    } catch (error) {
      this.setAuthMessage("Network error while logging in.", true);
    }
  },

  async handleLogout() {
    const body = new FormData();
    body.append("action", "logout");

    try {
      await fetch("DB_Ops.php", {
        method: "POST",
        body,
      });
    } catch (error) {
      // Even on network failure, clear local state to avoid stale authorization UI.
    }

    this.state.user = null;
    this.applyAuthUI();
    this.setAuthMessage("You are signed out.", false);
    Router.switchSection("authSection");
    window.location.hash = "#account";
  },

  async handleRegister(e) {
    e.preventDefault();

    const fullName = document.getElementById("registerFullName")?.value?.trim() || "";
    const username = document.getElementById("registerUsername")?.value?.trim() || "";
    const password = document.getElementById("registerPassword")?.value || "";
    const role = document.getElementById("registerRole")?.value || "customer";

    if (!fullName || !username || !password) {
      this.setAuthMessage("Please fill all register fields.", true);
      return;
    }

    const body = new FormData();
    body.append("action", "register");
    body.append("full_name", fullName);
    body.append("username", username);
    body.append("password", password);
    body.append("role", role);

    try {
      const res = await fetch("DB_Ops.php", {
        method: "POST",
        body,
      }).then((r) => r.json());

      if (!res.success) {
        this.setAuthMessage(res.error || "Registration failed.", true);
        return;
      }

      this.state.user = res.data.user;
      this.applyAuthUI();
      this.setAuthMessage(`Welcome ${this.state.user.full_name}. Account created successfully.`, false);
      Router.switchSection("searchSection");
      window.location.hash = "#search";
    } catch (error) {
      this.setAuthMessage("Network error while registering.", true);
    }
  },

  switchAuthTab(tab) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const showLoginTab = document.getElementById("showLoginTab");
    const showRegisterTab = document.getElementById("showRegisterTab");

    const loginActive = tab === "login";
    if (loginForm) loginForm.classList.toggle("hidden", !loginActive);
    if (registerForm) registerForm.classList.toggle("hidden", loginActive);
    if (showLoginTab) showLoginTab.classList.toggle("active", loginActive);
    if (showRegisterTab) showRegisterTab.classList.toggle("active", !loginActive);
  },

  applyAuthUI() {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const sessionBox = document.getElementById("sessionBox");
    const sessionUserText = document.getElementById("sessionUserText");
    const tabs = document.querySelector(".auth-tabs");

    if (!this.state.user) {
      if (loginForm) loginForm.classList.remove("hidden");
      if (registerForm) registerForm.classList.add("hidden");
      if (sessionBox) sessionBox.classList.add("hidden");
      if (tabs) tabs.classList.remove("hidden");
      if (sessionUserText) sessionUserText.textContent = "";
      this.switchAuthTab("login");
      this.setAuthMessage("Login or register to continue.", false);
      Router.switchSection("authSection");
      window.location.hash = "#account";
    } else {
      if (loginForm) loginForm.classList.add("hidden");
      if (registerForm) registerForm.classList.add("hidden");
      if (sessionBox) sessionBox.classList.remove("hidden");
      if (tabs) tabs.classList.add("hidden");
      if (sessionUserText) {
        sessionUserText.textContent = `${this.state.user.full_name} (${this.state.user.role})`;
      }
    }

    if (window.Router) {
      window.Router.updateAuthUI(this.state.user);
    }
    if (window.InventoryModule) {
      window.InventoryModule.updateRole(this.state.user?.role || null);
    }
  },

  setAuthMessage(message, isError) {
    const box = document.getElementById("authMessage");
    if (!box) return;

    box.textContent = message;
    box.classList.remove("hidden", "is-error");
    if (isError) {
      box.classList.add("is-error");
    }
  },

  isAuthenticated() {
    return !!this.state.user;
  },

  getRole() {
    return this.state.user?.role || null;
  },
};

window.AuthModule = AuthModule;

document.addEventListener("DOMContentLoaded", async () => {
  Router.init();
  SearchModule.init();
  InventoryModule.init();
  await AuthModule.init();
});
