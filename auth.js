import {
  getUsers,
  saveUser,
  findUser,
  setCurrentUser
} from "./db.js";

const signupForm =
  document.getElementById("signupForm");

if (signupForm) {

  signupForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      const name =
        document
          .getElementById("signupName")
          .value
          .trim();

      const email =
        document
          .getElementById("signupEmail")
          .value
          .trim();

      const password =
        document
          .getElementById("signupPassword")
          .value;

      const role =
        document
          .getElementById("signupRole")
          .value;

      const users = getUsers();

      const existing =
        users.find(
          user => user.email === email
        );

      if (existing) {

        document
          .getElementById("signupStatus")
          .textContent =
          "Email sudah digunakan.";

        return;
      }

      saveUser({
        name,
        email,
        password,
        role
      });

      window.location.href =
        "login.html";
    }
  );
}

const loginForm =
  document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    (e) => {

      e.preventDefault();

      const email =
        document
          .getElementById("loginEmail")
          .value
          .trim();

      const password =
        document
          .getElementById("loginPassword")
          .value;

      const user =
        findUser(email, password);

      if (!user) {

        document
          .getElementById("loginStatus")
          .textContent =
          "Email atau password salah.";

        return;
      }

      setCurrentUser(user);

      window.location.href =
        "index.html";
    }
  );
}