import { PrismaClient } from '@prisma/client';
import { bold, cyan, greenBright, redBright, symbols, yellowBright } from 'ansi-colors';
import { writeFile } from 'fs/promises';
import { getCommunities, getPosts, getProfiles, getUsers, userPwd } from './seed/data';
import { outputFile } from './seed/data-output';

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

async function hasExistingData() {
  const users = await prisma.user.findMany();
  const profiles = await prisma.profile.findMany();
  const communities = await prisma.community.findMany();
  const posts = await prisma.post.findMany();

  return users.length > 0 || profiles.length > 0 || communities.length > 0 || posts.length > 0;
}

// Seed initial data
async function seedData() {
  logger.info(`Creating users with password "${userPwd}"...`);
  const usersList = [
    getUsers(30),
    getUsers(3, 'ADMIN'),
    getUsers(20, 'MODERATOR')
  ].flat();

  const users = await Promise.all(
    usersList
      .map(user => prisma.user.create({ data: user }))
  );
  logger.success(`${users.length} users created!`);
  console.log();

  logger.info('Creating profiles...');
  const profiles = await Promise.all(
    getProfiles(users).map(profile => prisma.profile.create({ data: profile }))
  );
  logger.success(`${profiles.length} profiles created!`);
  console.log();

  logger.info('Creating communities...');
  const randomModId = () => users[random(33, users.length - 1)].id;

  const communities = await Promise.all(
    getCommunities(randomModId).map(community =>
      prisma.community.create({ data: community }))
  );
  logger.success(`${communities.length} communities created!`);
  console.log();

  logger.info('Creating posts...');
  const randomCommunityId = () => getRandomElement(communities).id;
  const randomAuthorId = () => getRandomElement(users).id;
  const posts = await Promise.all(
    getPosts(30, randomCommunityId, randomAuthorId).map(post =>
      prisma.post.create({ data: post }))
  );
  logger.success(`${posts.length} posts created!`);
  console.log();

  logger.info('Writing data to file...');
  await writeFile(outputFile, JSON.stringify({ users, profiles, communities, posts }, null, 2));
  logger.success(`Data written to file: ${outputFile}`);
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
