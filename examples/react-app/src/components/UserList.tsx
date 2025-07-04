import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserListProps {
  initialUsers?: User[];
  onUserSelect?: (user: User) => void;
  filterByEmail?: string;
}

export const UserList: React.FC<UserListProps> = ({
  initialUsers = [],
  onUserSelect,
  filterByEmail,
}) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<boolean>(initialUsers.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUsers.length === 0) {
      fetchUsers();
    }
  }, [initialUsers]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.example.com/users');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = filterByEmail
    ? users.filter(user => user.email.includes(filterByEmail))
    : users;

  const handleUserClick = (user: User) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  if (isLoading) {
    return <div data-testid="loading">Loading users...</div>;
  }

  if (error) {
    return <div data-testid="error">Error: {error}</div>;
  }

  return (
    <div className="user-list" data-testid="user-list">
      <h2>Users</h2>
      {filteredUsers.length === 0 ? (
        <p data-testid="no-users">No users found</p>
      ) : (
        <ul>
          {filteredUsers.map((user) => (
            <li 
              key={user.id} 
              onClick={() => handleUserClick(user)}
              data-testid={`user-${user.id}`}
            >
              {user.name} ({user.email})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
