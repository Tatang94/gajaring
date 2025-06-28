import { timeAgo } from './timeAgo';

describe('timeAgo', () => {
  const now = new Date('2024-01-01T12:00:00Z');
  
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(now);
  });
  
  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should return "Just now" for timestamps less than a minute ago', () => {
    const timestamp = new Date(now.getTime() - 30 * 1000); // 30 seconds ago
    expect(timeAgo(timestamp)).toBe('Just now');
  });

  it('should return minutes for timestamps less than an hour ago', () => {
    const timestamp = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    expect(timeAgo(timestamp)).toBe('5 minutes ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 60 * 1000); // 1 minute ago
    expect(timeAgo(timestamp2)).toBe('1 minute ago');
  });

  it('should return hours for timestamps less than a day ago', () => {
    const timestamp = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    expect(timeAgo(timestamp)).toBe('3 hours ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
    expect(timeAgo(timestamp2)).toBe('1 hour ago');
  });

  it('should return days for timestamps less than a week ago', () => {
    const timestamp = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    expect(timeAgo(timestamp)).toBe('3 days ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
    expect(timeAgo(timestamp2)).toBe('1 day ago');
  });

  it('should return weeks for timestamps less than a month ago', () => {
    const timestamp = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks ago
    expect(timeAgo(timestamp)).toBe('2 weeks ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 7 * 24 * 60 * 60 * 1000); // 1 week ago
    expect(timeAgo(timestamp2)).toBe('1 week ago');
  });

  it('should return months for timestamps less than a year ago', () => {
    const timestamp = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months ago
    expect(timeAgo(timestamp)).toBe('6 months ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 30 * 24 * 60 * 60 * 1000); // 1 month ago
    expect(timeAgo(timestamp2)).toBe('1 month ago');
  });

  it('should return years for timestamps more than a year ago', () => {
    const timestamp = new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago
    expect(timeAgo(timestamp)).toBe('2 years ago');
    
    const timestamp2 = new Date(now.getTime() - 1 * 365 * 24 * 60 * 60 * 1000); // 1 year ago
    expect(timeAgo(timestamp2)).toBe('1 year ago');
  });

  it('should handle string timestamps', () => {
    const timestamp = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(timestamp)).toBe('5 minutes ago');
  });

  it('should handle number timestamps', () => {
    const timestamp = now.getTime() - 5 * 60 * 1000;
    expect(timeAgo(timestamp)).toBe('5 minutes ago');
  });
});