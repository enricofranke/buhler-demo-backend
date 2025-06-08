import { Reflector } from '@nestjs/core';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public Decorator', () => {
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
  });

  it('should set public metadata on class', () => {
    // Arrange
    const TestClass = class {};
    const decorator = Public();

    // Act
    decorator(TestClass);

    // Assert
    const metadata = reflector.get(IS_PUBLIC_KEY, TestClass);
    expect(metadata).toBe(true);
  });

  it('should work as method decorator', () => {
    // Arrange
    class TestClass {
      testMethod() {
        return 'test';
      }
    }
    const decorator = Public();
    const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, 'testMethod')!;

    // Act
    decorator(TestClass.prototype, 'testMethod', descriptor);

    // Assert
    const metadata = reflector.get(IS_PUBLIC_KEY, TestClass.prototype.testMethod);
    expect(metadata).toBe(true);
  });

  it('should have correct IS_PUBLIC_KEY constant', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should always set metadata to true', () => {
    // Arrange
    const TestClass1 = class {};
    const TestClass2 = class {};
    const decorator1 = Public();
    const decorator2 = Public();

    // Act
    decorator1(TestClass1);
    decorator2(TestClass2);

    // Assert
    const metadata1 = reflector.get(IS_PUBLIC_KEY, TestClass1);
    const metadata2 = reflector.get(IS_PUBLIC_KEY, TestClass2);
    expect(metadata1).toBe(true);
    expect(metadata2).toBe(true);
  });
}); 