import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
    expect(typeof CurrentUser).toBe('function');
  });

  it('should be a parameter decorator factory', () => {
    // Arrange & Act
    const decoratorInstance = CurrentUser();

    // Assert
    expect(decoratorInstance).toBeDefined();
    expect(typeof decoratorInstance).toBe('function');
  });
}); 