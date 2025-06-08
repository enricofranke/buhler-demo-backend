import { Reflector } from '@nestjs/core';
import { Roles, ROLES_KEY } from './roles.decorator';

describe('Roles Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should set metadata with single role', () => {
    // Arrange
    const TestClass = class {};
    const decorator = Roles('ADMIN');

    // Act
    decorator(TestClass);

    // Assert
    const metadata = reflector.get(ROLES_KEY, TestClass);
    expect(metadata).toEqual(['ADMIN']);
  });

  it('should set metadata with multiple roles', () => {
    // Arrange
    const TestClass = class {};
    const decorator = Roles('ADMIN', 'USER', 'MODERATOR');

    // Act
    decorator(TestClass);

    // Assert
    const metadata = reflector.get(ROLES_KEY, TestClass);
    expect(metadata).toEqual(['ADMIN', 'USER', 'MODERATOR']);
  });

  it('should set metadata with no roles', () => {
    // Arrange
    const TestClass = class {};
    const decorator = Roles();

    // Act
    decorator(TestClass);

    // Assert
    const metadata = reflector.get(ROLES_KEY, TestClass);
    expect(metadata).toEqual([]);
  });

  it('should work as method decorator', () => {
    // Arrange
    class TestClass {
      testMethod() {
        return 'test';
      }
    }
    const decorator = Roles('SALES');
    const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod')!;

    // Act
    decorator(TestClass.prototype, 'testMethod', descriptor);

    // Assert
    const metadata = reflector.get(ROLES_KEY, TestClass.prototype.testMethod);
    expect(metadata).toEqual(['SALES']);
  });

  it('should handle duplicate roles', () => {
    // Arrange
    const TestClass = class {};
    const decorator = Roles('ADMIN', 'ADMIN', 'USER');

    // Act
    decorator(TestClass);

    // Assert
    const metadata = reflector.get(ROLES_KEY, TestClass);
    expect(metadata).toEqual(['ADMIN', 'ADMIN', 'USER']); // Preserves duplicates
  });

  it('should have correct ROLES_KEY constant', () => {
    expect(ROLES_KEY).toBe('roles');
  });
}); 