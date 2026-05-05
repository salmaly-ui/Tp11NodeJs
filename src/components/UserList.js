import React, { useState, useEffect } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const addUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          createdAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const savedUser = await response.json();
      setUsers([...users, savedUser]);
      setSuccessMessage(`Utilisateur ${savedUser.firstName} ${savedUser.lastName} ajouté avec succès !`);
      
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'user',
        status: 'active'
      });
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      setUsers(users.filter(user => user.id !== id));
      setSuccessMessage('Utilisateur supprimé avec succès !');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatId = (id) => {
    if (typeof id === 'number') return id;
    return id.toString().substring(0, 8) + '...';
  };

  if (loading && users.length === 0) {
    return <div className="loading">Chargement des utilisateurs...</div>;
  }

  return (
    <div className="user-list-container">
      <h1>Gestion des Utilisateurs</h1>
      
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          Erreur: {error}
          <button onClick={fetchUsers}>Réessayer</button>
        </div>
      )}
      
      <div className="stats-card">
        <h3>Statistiques</h3>
        <p>Total utilisateurs: {users.length}</p>
        <p>Administrateurs: {users.filter(u => u.role === 'administrator').length}</p>
        <p>Utilisateurs actifs: {users.filter(u => u.status === 'active').length}</p>
      </div>
      
      <div className="add-user-form">
        <h2>Ajouter un utilisateur</h2>
        <form onSubmit={addUser}>
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="Prénom"
              value={newUser.firstName}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Nom"
              value={newUser.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Téléphone"
              value={newUser.phone}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-row">
            <select name="role" value={newUser.role} onChange={handleInputChange}>
              <option value="user">Utilisateur</option>
              <option value="moderator">Modérateur</option>
              <option value="administrator">Administrateur</option>
            </select>
            
            <select name="status" value={newUser.status} onChange={handleInputChange}>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Ajout en cours...' : 'Ajouter utilisateur'}
          </button>
        </form>
      </div>
      
      <div className="users-table">
        <h2>Liste des utilisateurs ({users.length})</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Prénom</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="id-cell" title={user.id}>
                    {formatId(user.id)}
                  </td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role === 'administrator' ? 'Admin' : user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.status}`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="delete-btn"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserList;