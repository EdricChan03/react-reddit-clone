import { Community, Post, PrismaClient, Role, User } from '@prisma/client';
import { bold, cyan, greenBright, redBright, symbols, yellowBright } from 'ansi-colors';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';


// Utility functions
// Generate random number in range (inclusive)
function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random element from array
function getRandomElement<T>(array: T[]) {
  return array[random(0, array.length - 1)];
}

const prisma = new PrismaClient();

const logger = {
  info: (message: string) => console.log(cyan(`${bold(symbols.info)} ${message}`)),
  error: (message: string) => console.error(redBright(`${bold(symbols.cross)} ${message}`)),
  warning: (message: string) => console.warn(yellowBright(`${bold(symbols.warning)} ${message}`)),
  success: (message: string) => console.log(greenBright(`${bold(symbols.check)} ${message}`))
}

const data = {
  getUsers(entries = 10, role: Role = 'USER'): Omit<User, 'id'>[] {
    return new Array(entries).fill(undefined).map(() => {
      const firstName = faker.name.firstName(),
        lastName = faker.name.lastName();
      const email = faker.internet.email(firstName, lastName);
      const password = bcrypt.hashSync(faker.internet.password());

      return { email, name: firstName + lastName, password, role }
    });
  },
  getCommunities(randomModId: () => string): Omit<Community, 'id' | 'createdAt' | 'updatedAt'>[] {
    return [
      { name: 'Aww', description: 'Animals who are too cute to not be shared!', ownerId: randomModId() },
      { name: 'Gaming', description: 'For anything related to games - video games, card games, board games, etc.', ownerId: randomModId() },
      { name: 'Technology', description: 'Anything goes when it comes to technology!', ownerId: randomModId() },
      { name: 'Music', description: 'The musical community - discuss music news, your favourite music, etc here!', ownerId: randomModId() },
      { name: 'Movies', description: 'Got an interesting movie to share? Share it here!', ownerId: randomModId() },
      { name: 'TV', description: 'Discuss the latest in Television here', ownerId: randomModId() },
      { name: 'Sports', description: 'Sports news and highlights from major sporting events', ownerId: randomModId() },
      { name: 'Food', description: 'The place to share your food images/recipes!', ownerId: randomModId() },
      { name: 'Travel', description: 'Explore the world! Find something new out there!', ownerId: randomModId() },
      { name: 'Funny', description: 'Got something funny to share? We\'ll gladly accept it!', ownerId: randomModId() },
      { name: 'Art', description: 'Anything related to art!', ownerId: randomModId() },
      { name: 'Books', description: 'Share your favourite books/books you\'re currently reading here!', ownerId: randomModId() },
      { name: 'News', description: 'The latest world news, all in one community.', ownerId: randomModId() },
      { name: 'Science', description: 'The place where you can find and share new scientific research.', ownerId: randomModId() },
      { name: 'Health', description: 'Discuss and share health news here!', ownerId: randomModId() },
      { name: 'Education', description: 'Got something educational to share? Or are you a teacher looking to share your personal insights? Either way, welcome!', ownerId: randomModId() },
      { name: 'Business', description: 'The latest business news, all in one community.', ownerId: randomModId() },
      { name: 'Fitness', description: 'Fitness!', ownerId: randomModId() },
      { name: 'Singapore', description: 'The latest Singaporean news/local buzz, all in one community.', ownerId: randomModId() }
    ];
  },
  getPosts(entries = 10, randomCommunityId: () => string, randomAuthorId: () => string): Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] {
    return new Array(entries).fill(undefined).map(() => {
      const title = faker.lorem.sentence();
      const content = faker.lorem.paragraph();

      return { title, content, communityId: randomCommunityId(), published: faker.datatype.boolean(), authorId: randomAuthorId() }
    });
  }
};

async function hasExistingData() {
  const users = await prisma.user.findMany();
  const profiles = await prisma.profile.findMany();
  const communities = await prisma.community.findMany();
  const posts = await prisma.post.findMany();

  return users.length > 0 || profiles.length > 0 || communities.length > 0 || posts.length > 0;
}

// Seed initial data
async function seedData() {
  logger.info('Creating users...');
  const usersList = [
    data.getUsers(30),
    data.getUsers(3, 'ADMIN'),
    data.getUsers(20, 'MODERATOR')
  ].flat();

  const users = await Promise.all(
    usersList
      .map(async user =>
        await prisma.user.create({ data: user }))
  );
  logger.success(`${users.length} users created!`);

  logger.info('Creating profiles...');
  const profiles = await Promise.all(
    users.map(async ({ id: userId }) =>
      await prisma.profile.create({ data: { userId, bio: faker.lorem.paragraph() } }))
  );
  logger.success(`${profiles.length} profiles created!`);

  logger.info('Creating communities...');
  const randomModId = () => users[random(33, users.length - 1)].id;

  const communities = await Promise.all(
    data.getCommunities(randomModId).map(async community =>
      await prisma.community.create({ data: community }))
  );
  logger.success(`${communities.length} communities created!`);

  logger.info('Creating posts...');
  const randomCommunityId = () => getRandomElement(communities).id;
  const randomAuthorId = () => getRandomElement(users).id;
  const posts = await Promise.all(
    data.getPosts(30, randomCommunityId, randomAuthorId).map(async post =>
      await prisma.post.create({ data: post }))
  );
  logger.success(`${posts.length} posts created!`);
}

async function main() {
  if (await hasExistingData()) {
    logger.error('Database already has data, exiting...');
    console.log();
    logger.info('Tip: To reset the database, run the following command:');
    logger.warning('(WARNING! This command will delete all data in the database!)');
    logger.warning('(If you are sure you want to reset the database, run the following command:)');
    logger.info('-'.repeat(24));
    logger.info(`${bold('npx prisma migrate reset')}`);
    logger.info('-'.repeat(24));
    process.exit(1);
  } else {
    let hasError = false;
    await seedData()
      .catch(e => {
        logger.error('Could not seed data: ' + e);
        hasError = true;
        throw e;
      })
      .finally(async () => {
        if (!hasError) {
          console.log();
          logger.success('Seeding complete!');
        }
        await prisma.$disconnect();
      });
  }
}

main();
