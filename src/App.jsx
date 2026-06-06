import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

function App() {
  // 1️⃣ მონაცემები (inputs)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  // 2️⃣ რეგისტრაციის ფუნქცია
  const register = async () => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser(result.user);
      alert("რეგისტრაცია წარმატებულია 🚀");
    } catch (error) {
      alert(error.message);
    }
  };

  // 3️⃣ ეკრანი
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>My Social App 🚀</h1>

      {!user ? (
        <div>
          <h2>Register</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "10px" }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: "block", margin: "10px auto", padding: "10px" }}
          />

          <button onClick={register} style={{ padding: "10px 20px" }}>
            Sign Up
          </button>
        </div>
      ) : (
        <div>
          <h2>Welcome 🚀</h2>
          <p>{user.email}</p>
        </div>
      )}
    </div>
  );
}

export default App;