import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('should add numbers correctly', () => {
    expect(2 + 2).toBe(4);
  });

  it('should check string', () => {
    expect('campus').toBe('campus');
  });
  describe('Visitor Feature', () => {
  it('should create visitor object', () => {
    const visitor = { name: "John", purpose: "Meeting" };
    expect(visitor.name).toBe("John");
  });
});