import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import AdminSidebar from './Sidebar/AdminSidebar';
import Navbar from './Navbar/Navbar.js';
import styles from './Layout.module.css';
import Footer from '../pages/footer/Footer';
import { matchPath } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const isAdminRoute = !!matchPath({ path: '/admin/*' }, location.pathname);

  return (
    <div className={styles.appContainer}>
      {isAdminRoute ? <AdminSidebar /> : <Sidebar />}
      <div className={styles.mainContent}>
        {!isAdminRoute && <Navbar />} 
        <div className={styles.contentWrapper}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;