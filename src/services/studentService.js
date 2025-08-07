const EXPRESS_API_URL = process.env.REACT_APP_API_URL || 'https://gyrus-backend-admin.onrender.com/api/student';

export const loginStudent = async (name, regNo) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, regNo }),
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
        throw new Error(data.message || 'Student not found or invalid credentials');
      }
      if (response.status === 404) {
        throw new Error(data.message || 'Teacher not found');
      }
      throw new Error(data.message || 'Login failed');
    }

    if (!data.success || !data.data) {
      throw new Error(data.message || 'Invalid response format from server');
    }

    localStorage.setItem('studentData', JSON.stringify(data.data));
    return data.data;
  } catch (error) {
    console.error('Login error:', error.message);
    throw new Error(error.message || 'Failed to connect to server');
  }
};

export const getStudentData = () => {
  const data = localStorage.getItem('studentData');
  return data ? JSON.parse(data) : null;
};

export const clearStudentSession = () => {
  localStorage.removeItem('studentData');
};