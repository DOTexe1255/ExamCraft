import React, { createContext, useContext, useState } from "react";

// Create Context
const MyContext = createContext();

const testdata="abcd"

// Create Provider Component
export const MyProvider = ({ children }) => {

   return (
    <MyContext.Provider value={{ 
                                    testdata
                              }}>
      {children}
    </MyContext.Provider>
  );
};

// Export custom hook for easy access
export const useMyContext = () => useContext(MyContext);
