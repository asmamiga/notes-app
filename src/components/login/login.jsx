import React, { useState } from "react";
import axiosApi from "../axios";
import "./login.css";

const Login = ({ setToken, setIsConnected, setUserInfo}) => {
  const [cin, setCin] = useState(localStorage.getItem("cin") || "");
  const [password, setPassword] = useState(localStorage.getItem("password") || "");
  const [loginError, setLoginError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(false); // Reset error state on new attempt

    try {
      const res = await axiosApi.post("/login", { cin, password });

      setIsConnected(true);
      setToken(res.token);
      setUserInfo({
        userfirstname: res.user.first_name,
        userlastname: res.user.last_name,
      });

      localStorage.setItem("cin", cin);
      localStorage.setItem("password", password);
      localStorage.setItem("token", res.token);
    } catch (err) {
      console.log("Login failed");
      setLoginError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className={`box ${loginError ? 'has-error' : ''}`}>
        <div className="border-line"></div>
        <form onSubmit={handleLogin}>
          {isLoading ? (
            <div className="dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : (
            <>
              <h1>Hello Sweet Stuff </h1>
              <div className="input-box">
                <input
                  type="text"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  placeholder="CIN"
                />
                <span>CIN</span>
                <i></i>
              </div>
              <div className="input-box">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <span>Password</span>
                <i></i>
              </div>
              {loginError && (
                <div className="error-message">Invalid CIN or password</div>
              )}
              <button className="btn" type="submit" >login</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;