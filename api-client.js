// Frontend API Integration Helper
// Include this file in your HTML and use it to connect with the backend

const API_URL = 'http://localhost:5000/api';

// ============ USER/CONTACT FUNCTIONS ============

async function submitContactForm(name, email, message) {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, message })
    });

    if (!response.ok) throw new Error('Failed to submit form');
    const data = await response.json();
    console.log('Contact submitted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error submitting contact form:', error);
    throw error;
  }
}

async function getAllUsers() {
  try {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

async function deleteUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// ============ PROJECT FUNCTIONS ============

async function getAllProjects() {
  try {
    const response = await fetch(`${API_URL}/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return await response.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

async function createProject(title, description, technologies, link) {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, technologies, link })
    });

    if (!response.ok) throw new Error('Failed to create project');
    const data = await response.json();
    console.log('Project created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

async function updateProject(projectId, title, description, technologies, link) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, technologies, link })
    });

    if (!response.ok) throw new Error('Failed to update project');
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

async function deleteProject(projectId) {
  try {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return await response.json();
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// ============ HEALTH CHECK ============

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (response.ok) {
      console.log('✅ Backend is running');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend is not responding:', error);
    return false;
  }
}

// Export functions (if using ES modules)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    submitContactForm,
    getAllUsers,
    deleteUser,
    getAllProjects,
    createProject,
    updateProject,
    deleteProject,
    checkBackendHealth,
    API_URL
  };
}
