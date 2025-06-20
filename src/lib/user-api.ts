// Mock user API - replace with actual backend implementation
interface User {
  id: string;
  mobile: string;
  password: string;
  isVerified: boolean;
  createdAt: string;
  verificationCode?: string;
}

class UserAPI {
  private users: User[] = [
    {
      id: '1',
      mobile: '01012345678',
      password: 'password123', // In real app, this would be hashed
      isVerified: true,
      createdAt: '2025-01-15T10:30:00Z'
    },
    {
      id: '2',
      mobile: '01098765432',
      password: 'password456',
      isVerified: true,
      createdAt: '2025-01-14T14:20:00Z'
    }
  ];

  private pendingVerifications: Map<string, { code: string; expiry: number }> = new Map();

  async login(mobile: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.users.find(u => u.mobile === mobile);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Account not verified' };
    }

    return { success: true, user };
  }

  async register(mobile: string, password: string): Promise<{ success: boolean; error?: string }> {
    const existingUser = this.users.find(u => u.mobile === mobile);
    
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.pendingVerifications.set(mobile, { code: verificationCode, expiry });

    // In real implementation, send SMS here
    console.log(`Verification code for ${mobile}: ${verificationCode}`);

    return { success: true };
  }

  async verifyCode(mobile: string, code: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const pending = this.pendingVerifications.get(mobile);
    
    if (!pending) {
      return { success: false, error: 'No verification pending for this mobile' };
    }

    if (Date.now() > pending.expiry) {
      this.pendingVerifications.delete(mobile);
      return { success: false, error: 'Verification code expired' };
    }

    if (pending.code !== code && code !== '123456') { // Accept 123456 for demo
      return { success: false, error: 'Invalid verification code' };
    }

    // Create user account
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      mobile,
      password: 'temp_password', // This should be set during registration
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.pendingVerifications.delete(mobile);

    return { success: true, user: newUser };
  }

  async completeRegistration(mobile: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.users.find(u => u.mobile === mobile);
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    user.password = password; // In real app, hash this password
    
    return { success: true, user };
  }

  async getAllUsers(): Promise<User[]> {
    return this.users.map(user => ({ ...user, password: undefined } as any));
  }

  async resendVerificationCode(mobile: string): Promise<{ success: boolean; error?: string }> {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.pendingVerifications.set(mobile, { code: verificationCode, expiry });

    // In real implementation, send SMS here
    console.log(`New verification code for ${mobile}: ${verificationCode}`);

    return { success: true };
  }
}

export const userApi = new UserAPI();
