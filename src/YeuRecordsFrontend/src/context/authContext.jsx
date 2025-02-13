import React, { createContext, useState, useEffect } from "react";
import jwt_decode from "jwt-decode";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const login = (token) => {
    try {
      let decodedUser;
      if (token.split(".").length === 3) {
        // Nếu token có 2 dấu chấm, giải mã như JWT
        decodedUser = jwt_decode(token);

        const userInfo = {
          activeEmail: decodedUser.activeEmail,
          iss: decodedUser.iss,
          fullname: decodedUser.fullname,
          avatar: decodedUser.avatar,
          userId: decodedUser.userId,
          email: decodedUser.email,
          status: decodedUser.status,
        };

        setUser(decodedUser);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        // Nếu không phải JWT, lưu token như chuỗi
        decodedUser = { token };
        setUser(decodedUser);
      }

      localStorage.setItem("accessToken", token);
      setIsUserLoading(false);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    setIsUserLoading(false);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        if (token.split(".").length === 3) {
          setUser(jwt_decode(token));
        } else {
          setUser({ token });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogout();
      }
    }
    setIsUserLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isUserLoading, login, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
