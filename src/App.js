import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MongoProvider } from './contexts/MongoContext';
import { useMongo } from './contexts/MongoContext';
import MongoConnectionModal from './components/MongoConnectionModal';
import Layout from './components/Layout';
import routes from './routes';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner.js';

function App() {
  return (
    <MongoProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Non-admin routes and /admin/login */}
            {routes
              .filter((route) => !route.path.startsWith('/admin') || route.path === '/admin/login')
              .map((route, index) => (
                route.protected ? (
                  <Route key={index} element={<Layout />}>
                    <Route path={route.path} element={route.element} />
                  </Route>
                ) : (
                  <Route key={index} path={route.path} element={route.element} />
                )
              ))}
            {/* Other admin routes */}
            <Route element={<Layout />}>
              {routes
                .filter((route) => route.path.startsWith('/admin') && route.protected)
                .map((route, index) => (
                  <Route key={index} path={route.path} element={route.element} />
                ))}
            </Route>
          </Routes>
        </Suspense>
        <MongoConnectionWrapper />
      </Router>
    </MongoProvider>
  );
}

const MongoConnectionWrapper = () => {
  const { showConnectionModal, setShowConnectionModal, connect } = useMongo();
  
  return (
    <MongoConnectionModal
      open={showConnectionModal}
      onClose={() => setShowConnectionModal(false)}
      onConnect={connect}
    />
  );
};

export default App;