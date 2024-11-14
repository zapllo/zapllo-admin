import { createContext, useReducer, useEffect } from "react";
import reducers from "./Reducers";
import { getData } from "../utils/fetchData";
import Cookies from 'js-cookie';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const initialState = { auth: {} };
  const [state, dispatch] = useReducer(reducers, initialState);

  useEffect(() => {
    const firstLogin = localStorage.getItem("firstLogin");
    const loginTime = localStorage.getItem("loginTime");

    if (firstLogin && loginTime) {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - loginTime;

      // Check if more than 1 hour (3600000 milliseconds) has passed
      if (elapsedTime > 3600000) {
        localStorage.removeItem("firstLogin");
        localStorage.removeItem("loginTime");
        Cookies.remove('token');  // Remove the token cookie as well
        dispatch({ type: "LOGOUT" });
        return;
      }

      getData("/auth/accessToken").then((res) => {
        if (res.err) {
          localStorage.removeItem("firstLogin");
          localStorage.removeItem("loginTime");
          Cookies.remove('token');  // Remove the token cookie on error
          return;
        }

        dispatch({
          type: "AUTH",
          payload: {
            token: res.access_token,
            user: res.user,
          },
        });
      });
    }
  }, []);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};
