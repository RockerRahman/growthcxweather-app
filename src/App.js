import "./App.css";
import React, { useEffect } from "react";
import LogIn from "./Components/LogIn";
import { Provider } from "react-redux";
import { store } from "../src/redux/store";
import { initializeUser } from "./redux/userSlice";
import Weather from "./Components/Weather";
import { Routes, Route } from "react-router-dom";
import Signup from "./Components/Signup";

function App() {
  useEffect(() => {
    // Dispatch initializeUser action when the app mounts
    store.dispatch(initializeUser());
  }, []);
  return (
    <Provider store={store}>
      <div className="App">
        <Routes>
          <Route element={<Signup />} path="*" />
          <Route element={<Weather />} path="weather" />
          <Route element={<LogIn />} path="login" />
        </Routes>
        {/* <LogIn /> */}

        {/* Other components */}
      </div>
    </Provider>
  );
}

export default App;
