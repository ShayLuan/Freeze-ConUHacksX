(function () {
  const API_BASE = "";

  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginError = document.getElementById("login-error");
  const registerError = document.getElementById("register-error");
  const errorMsg = document.getElementById("errorMsg");

  function showLoginError(msg) {
    if (loginError) {
      loginError.textContent = msg || "";
      loginError.style.display = msg ? "block" : "none";
    }
    if (errorMsg) {
      errorMsg.style.display = msg ? "block" : "none";
      errorMsg.textContent = msg || "Incorrect email or password.";
    }
  }

  function showRegisterError(msg) {
    if (registerError) {
      registerError.textContent = msg || "";
      registerError.style.display = msg ? "block" : "none";
    }
  }

  function clearErrors() {
    showLoginError("");
    showRegisterError("");
    if (errorMsg) errorMsg.style.display = "none";
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;

      if (!email || !password) {
        showLoginError("Email and password are required.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showLoginError(data.error || "Invalid email or password.");
          return;
        }

        if (data.user) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }
        window.location.href = "/";
      } catch (err) {
        showLoginError("Unable to reach server. Please try again.");
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors();

      const username = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (!email || !password) {
        showRegisterError("Email and password are required.");
        return;
      }

      if (password !== confirmPassword) {
        showRegisterError("Passwords do not match.");
        return;
      }

      if (password.length < 6) {
        showRegisterError("Password must be at least 6 characters.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username || undefined,
            email,
            password,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          showRegisterError(data.error || "Registration failed. Please try again.");
          return;
        }

        if (data.user_id) {
          sessionStorage.setItem("registered", "true");
        }
        showRegisterError("");
        registerForm.reset();
        alert("Account created successfully. You can now log in.");
      } catch (err) {
        showRegisterError("Unable to reach server. Please try again.");
      }
    });
  }
})();
