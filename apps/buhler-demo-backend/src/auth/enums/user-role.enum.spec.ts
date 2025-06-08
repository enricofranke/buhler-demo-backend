import { UserRole } from './user-role.enum';

describe('UserRole Enum', () => {
  it('should have correct values', () => {
    expect(UserRole.ADMIN).toBe('ADMIN');
    expect(UserRole.USER).toBe('USER');
    expect(UserRole.SALES).toBe('SALES');
    expect(UserRole.MODERATOR).toBe('MODERATOR');
  });

  it('should have all expected roles', () => {
    const expectedRoles = ['ADMIN', 'USER', 'SALES', 'MODERATOR'];
    const actualRoles = Object.values(UserRole);
    
    expect(actualRoles).toEqual(expectedRoles);
    expect(actualRoles.length).toBe(4);
  });

  it('should have all expected keys', () => {
    const expectedKeys = ['ADMIN', 'USER', 'SALES', 'MODERATOR'];
    const actualKeys = Object.keys(UserRole);
    
    expect(actualKeys).toEqual(expectedKeys);
    expect(actualKeys.length).toBe(4);
  });

  it('should be usable in switch statements', () => {
    const getRoleDescription = (role: UserRole): string => {
      switch (role) {
        case UserRole.ADMIN:
          return 'Administrator';
        case UserRole.USER:
          return 'Regular User';
        case UserRole.SALES:
          return 'Sales Representative';
        case UserRole.MODERATOR:
          return 'Moderator';
        default:
          return 'Unknown';
      }
    };

    expect(getRoleDescription(UserRole.ADMIN)).toBe('Administrator');
    expect(getRoleDescription(UserRole.USER)).toBe('Regular User');
    expect(getRoleDescription(UserRole.SALES)).toBe('Sales Representative');
    expect(getRoleDescription(UserRole.MODERATOR)).toBe('Moderator');
  });

  it('should be usable for role checking', () => {
    const isAdminRole = (role: string): boolean => {
      return role === UserRole.ADMIN;
    };

    const isSalesRole = (role: string): boolean => {
      return role === UserRole.SALES;
    };

    expect(isAdminRole('ADMIN')).toBe(true);
    expect(isAdminRole('USER')).toBe(false);
    expect(isSalesRole('SALES')).toBe(true);
    expect(isSalesRole('ADMIN')).toBe(false);
  });

  it('should support Object.values for iteration', () => {
    const roles = Object.values(UserRole);
    
    expect(roles.includes(UserRole.ADMIN)).toBe(true);
    expect(roles.includes(UserRole.USER)).toBe(true);
    expect(roles.includes(UserRole.SALES)).toBe(true);
    expect(roles.includes(UserRole.MODERATOR)).toBe(true);
  });
}); 