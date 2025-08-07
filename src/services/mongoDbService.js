const EXPRESS_API_URL = 'http://localhost:5000/api/teachers';

// Save teacher profile join request to MongoDB via Express backend
export const saveTeacherJoinRequest = async (teacherData) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/join-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...teacherData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save teacher join request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving teacher join request:', error);
    throw error;
  }
};

// Get all pending teacher join requests
export const getPendingJoinRequests = async () => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/join-requests/pending`);
    if (!response.ok) throw new Error('Failed to fetch pending join requests');
    return await response.json();
  } catch (error) {
    console.error('Error fetching pending join requests:', error);
    throw error;
  }
};

// Approve or reject teacher join request
export const updateJoinRequestStatus = async (id, status) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/join-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update join request status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating join request status:', error);
    throw error;
  }
};

// Verify teacher credentials for sign-in
export const verifyTeacherCredentials = async (email, password) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid credentials or account not approved');
    }

    const data = await response.json();
    if (data.status !== 'approved') {
      throw new Error('Account is not approved');
    }

    localStorage.setItem('teacherProfile', JSON.stringify(data));
    localStorage.setItem('teacherEmail', data.email);
    return true;
  } catch (error) {
    console.error('Error verifying credentials:', error.message);
    throw error;
  }
};

// Get teacher profile from MongoDB via Express backend
export const getTeacherProfile = async (email) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/email/${encodeURIComponent(email)}`);
    
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Failed to fetch teacher profile');
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    throw error;
  }
};

// Check if teacher profile exists
export const checkExistingProfile = async (email) => {
  try {
    const profile = await getTeacherProfile(email);
    return profile !== null;
  } catch (error) {
    console.error('Error checking profile existence:', error);
    throw error;
  }
};

// Update teacher profile
export const updateTeacherProfile = async (id, updateData) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update teacher profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    throw error;
  }
};

// Delete teacher profile
export const deleteTeacherProfile = async (id) => {
  try {
    const response = await fetch(`${EXPRESS_API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete teacher profile');
    }

    return true;
  } catch (error) {
    console.error('Error deleting teacher profile:', error);
    throw error;
  }
};

// Save teacher profile to MongoDB via Express backend (for backward compatibility)
export const saveTeacherProfile = async (teacherData) => {
  try {
    const response = await fetch(EXPRESS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...teacherData,
        createdAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save teacher profile');
    }

    const savedProfile = await response.json();

    localStorage.setItem('teacherProfile', JSON.stringify(savedProfile));
    localStorage.setItem('teacherEmail', savedProfile.email);

    return savedProfile;
  } catch (error) {
    console.error('Error saving teacher profile:', error);
    throw error;
  }
};