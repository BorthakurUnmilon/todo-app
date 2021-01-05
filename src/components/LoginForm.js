import React, { useState } from "react";
import '../styles/App.css'
const LoginForm = ({ error, signupHandler, loginHandler }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login">
      <div className="input-fields">
      <input value={username} type="text" placeholder="Enter username"
        onChange={e=> setUsername(e.target.value)}
      />
      <input value={password} type="password" placeholder="Enter password" 
        onChange={e=> setPassword(e.target.value)}
      />
      </div>
      {error ? <div className="error">{error}</div> : null}
      <button onClick={() => signupHandler(username,password)}>Sign Up</button>
      <button onClick={() => loginHandler(username,password)}>Log In</button>
    </div>
  );
};

export default LoginForm;
