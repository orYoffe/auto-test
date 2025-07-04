/**
 * UserService: Handles user operations like registration and authentication
 */
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  private users: Map<string, User> = new Map();
  
  /**
   * Register a new user
   * @param username User's username
   * @param email User's email address
   * @param password User's password (will be hashed)
   * @returns The created user object (without password)
   * @throws Error if username or email already exists
   */
  async registerUser(username: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    // Validate inputs
    if (!username || !email || !password) {
      throw new Error('Username, email and password are required');
    }
    
    // Check if username or email already exists
    for (const user of this.users.values()) {
      if (user.username === username) {
        throw new Error('Username already exists');
      }
      if (user.email === email) {
        throw new Error('Email already exists');
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const now = new Date();
    const user: User = {
      id: uuidv4(),
      username,
      email,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    };
    
    // Save user
    this.users.set(user.id, user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Authenticate a user
   * @param usernameOrEmail Username or email for authentication
   * @param password Password to verify
   * @returns User object if authentication succeeds (without password)
   * @throws Error if authentication fails
   */
  async authenticateUser(usernameOrEmail: string, password: string): Promise<Omit<User, 'password'>> {
    // Find user by username or email
    let foundUser: User | undefined;
    
    for (const user of this.users.values()) {
      if (user.username === usernameOrEmail || user.email === usernameOrEmail) {
        foundUser = user;
        break;
      }
    }
    
    if (!foundUser) {
      throw new Error('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = foundUser;
    return userWithoutPassword;
  }
  
  /**
   * Get user by ID
   * @param id User ID
   * @returns User object if found (without password)
   * @throws Error if user not found
   */
  getUserById(id: string): Omit<User, 'password'> {
    const user = this.users.get(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Update user details
   * @param id User ID
   * @param updates Object containing fields to update
   * @returns Updated user object (without password)
   * @throws Error if user not found
   */
  async updateUser(
    id: string, 
    updates: Partial<Pick<User, 'username' | 'email' | 'password'>>
  ): Promise<Omit<User, 'password'>> {
    const user = this.users.get(id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if username or email already exists
    if (updates.username || updates.email) {
      for (const existingUser of this.users.values()) {
        if (existingUser.id !== id) {
          if (updates.username && existingUser.username === updates.username) {
            throw new Error('Username already exists');
          }
          if (updates.email && existingUser.email === updates.email) {
            throw new Error('Email already exists');
          }
        }
      }
    }
    
    // Update fields
    if (updates.username) user.username = updates.username;
    if (updates.email) user.email = updates.email;
    
    // Hash new password if provided
    if (updates.password) {
      user.password = await bcrypt.hash(updates.password, 10);
    }
    
    // Update timestamp
    user.updatedAt = new Date();
    
    // Save updated user
    this.users.set(id, user);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  /**
   * Delete a user
   * @param id User ID
   * @returns True if user was deleted
   * @throws Error if user not found
   */
  deleteUser(id: string): boolean {
    if (!this.users.has(id)) {
      throw new Error('User not found');
    }
    
    return this.users.delete(id);
  }
}
