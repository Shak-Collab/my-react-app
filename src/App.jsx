import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";

function Earth() {
  const texture = useTexture("https://threejs.org/examples/textures/land_ocean_ice_cloud_2048.jpg");

  return (
    <mesh>
      <sphereGeometry args={[1.5, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div style={styles.page}>

      {/* LEFT LOGIN */}
      <div style={styles.panel}>
        <h2 style={{ color: "white" }}>LOGIN</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button}>Enter</button>
      </div>

      {/* EARTH */}
      <Canvas style={styles.canvas}>
        <ambientLight intensity={1} />
        <directionalLight position={[3, 3, 3]} />

        <Earth />

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>

    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    background: "black",
    overflow: "hidden",
    position: "relative",
    fontFamily: "Arial"
  },

  panel: {
    position: "absolute",
    top: "20px",
    left: "20px",
    width: "250px",
    padding: "15px",
    background: "rgba(0,0,0,0.6)",
    border: "1px solid #00ffcc",
    borderRadius: "10px",
    zIndex: 10
  },

  input: {
    width: "100%",
    margin: "8px 0",
    padding: "10px",
    background: "black",
    border: "1px solid #00ffcc",
    color: "#00ffcc"
  },

  button: {
    width: "100%",
    padding: "10px",
    background: "#00ffcc",
    border: "none",
    marginTop: "10px",
    cursor: "pointer"
  },

  canvas: {
    height: "100vh",
    width: "100vw"
  }
};

export default App;