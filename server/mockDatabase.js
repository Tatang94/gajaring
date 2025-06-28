// Mock database for development when real database is not available
export const mockUsers = [
  {
    id: 1,
    email: 'admin@gajaring.com',
    display_name: 'Admin User',
    role: 'admin',
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: 2,
    email: 'user@gajaring.com',
    display_name: 'Regular User',
    role: 'user',
    avatar_url: null,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const mockSessions = [];

export const mockPosts = [
  {
    id: 1,
    user_id: 1,
    content: 'Welcome to GAJARING! This is the first post.',
    image_url: null,
    likes_count: 5,
    comments_count: 2,
    shares_count: 1,
    created_at: new Date(),
    updated_at: new Date()
  }
];

export const mockUserPasswords = [
  {
    user_id: 1,
    password_hash: '$2a$10$example.hash.for.admin.password', // This would be 'admin123' hashed
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    user_id: 2,
    password_hash: '$2a$10$example.hash.for.user.password', // This would be 'user123' hashed
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Simple mock database operations
export const mockDb = {
  selectFrom: (table) => ({
    select: (columns) => ({
      where: (column, operator, value) => ({
        executeTakeFirst: async () => {
          if (table === 'users') {
            return mockUsers.find(user => user[column] === value);
          }
          return null;
        },
        execute: async () => {
          if (table === 'users') {
            return mockUsers.filter(user => user[column] === value);
          }
          return [];
        }
      }),
      execute: async () => {
        if (table === 'users') return mockUsers;
        if (table === 'posts') return mockPosts;
        return [];
      }
    }),
    innerJoin: (joinTable, leftCol, rightCol) => ({
      select: (columns) => ({
        where: (column, operator, value) => ({
          execute: async () => {
            // Simple mock join logic
            return [];
          }
        })
      })
    })
  }),
  insertInto: (table) => ({
    values: (data) => ({
      returning: (columns) => ({
        execute: async () => {
          const newId = Math.max(...(table === 'users' ? mockUsers : mockPosts).map(item => item.id)) + 1;
          const newItem = { id: newId, ...data, created_at: new Date(), updated_at: new Date() };
          
          if (table === 'users') {
            mockUsers.push(newItem);
          } else if (table === 'posts') {
            mockPosts.push(newItem);
          }
          
          return [newItem];
        }
      })
    })
  })
};