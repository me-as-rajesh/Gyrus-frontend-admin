const EXPRESS_API_URL = process.env.REACT_APP_API_URL || 'https://gyrus-backend-admin.onrender.com//api/admin';

export const loginAdmin = async (username, password) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      throw new Error(`Server returned HTML: ${text.substring(0, 100)}...`);
    }
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error(
          data.details
            ? `Missing fields: ${Object.keys(data.details)
                .filter((key) => data.details[key])
                .join(', ')}`
            : data.message || 'Invalid request'
        );
      }
      if (response.status === 401) {
        throw new Error(data.message || 'Invalid admin credentials');
      }
      throw new Error(data.message || 'Login failed');
    }

    if (!data.success || !data.admin) {
      throw new Error(data.message || 'Invalid response format from server');
    }

    localStorage.setItem('adminData', JSON.stringify(data.admin));
    return data.admin;
  } catch (error) {
    console.error('Admin login error:', error.message);
    throw new Error(error.message || 'Failed to connect to server');
  }
};

export const getAdminData = () => {
  const data = localStorage.getItem('adminData');
  return data ? JSON.parse(data) : null;
};

export const clearAdminSession = () => {
  localStorage.removeItem('adminData');
};

export const getAdmins = async () => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/admins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admins');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};