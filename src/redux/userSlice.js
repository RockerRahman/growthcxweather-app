

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [], 
  loggedInUser: null, 
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      console.log(state, "state");
      state.users.push(action.payload); 
      state.loggedInUser = action.payload;
      localStorage.setItem("users", JSON.stringify(state.users));
      localStorage.setItem("loggedInUser", JSON.stringify(state.loggedInUser));
    },
    initializeUser: (state) => {
      const storedUsers = JSON.parse(localStorage.getItem("users"));
      if (storedUsers) {
        state.users = storedUsers;
      }
      const storedLoggedInUser = JSON.parse(
        localStorage.getItem("loggedInUser")
      );
      if (storedLoggedInUser) {
        state.loggedInUser = storedLoggedInUser;
      }
    },
  },
});

export const { setUser, initializeUser } = userSlice.actions;

export const selectUser = (state) => state.user;

export default userSlice.reducer;
