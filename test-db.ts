import { prisma } from './lib/prisma';

async function testConnection() {
  try {
    // Test the connection by counting users
    const userCount = await prisma.user.count();
    console.log(`Connected to database. Found ${userCount} users.`);
    
    // Try to fetch some vitals data
    const vitals = await prisma.vital.findMany({
      take: 5,
      orderBy: {
        timestamp: 'desc'
      }
    });
    console.log('Recent vitals:', vitals);
  } catch (error) {
    console.error('Database connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();