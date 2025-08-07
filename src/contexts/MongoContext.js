import React, { createContext, useState, useContext } from 'react';

const MongoContext = createContext();

export const MongoProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const connect = (details) => {
    setConnectionDetails(details);
    setIsConnected(true);
    // In a real app, you would store this in localStorage or context
    localStorage.setItem('mongoConnection', JSON.stringify(details));
  };

  const disconnect = () => {
    setIsConnected(false);
    setConnectionDetails(null);
    localStorage.removeItem('mongoConnection');
  };

  return (
    <MongoContext.Provider
      value={{
        isConnected,
        connectionDetails,
        showConnectionModal,
        setShowConnectionModal,
        connect,
        disconnect
      }}
    >
      {children}
    </MongoContext.Provider>
  );
};

export const useMongo = () => useContext(MongoContext);