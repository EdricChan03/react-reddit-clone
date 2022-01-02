import { Community, Post, Profile, Role, User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as faker from 'faker';
import { join } from 'path';

// Hard-coded password to make local testing easier
export const userPwd = 'thisisastrongpassword065$';

export const getUsers = (entries = 10, role: Role = 'USER'): Omit<User, 'id'>[] => {
  return new Array(entries).fill(undefined).map(() => {
    const firstName = faker.name.firstName(),
      lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);
    const password = bcrypt.hashSync(userPwd);

    return { email, name: `${firstName} ${lastName}`, password, role }
  });
};

export const getCommunities = (randomModId: () => string): Omit<Community, 'id' | 'createdAt' | 'updatedAt'>[] => {
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
};

export const getPosts = (entries = 10, randomCommunityId: () => string, randomAuthorId: () => string): Omit<Post, 'id' | 'createdAt' | 'updatedAt'>[] => {
  return new Array(entries).fill(undefined).map(() => {
    const title = faker.lorem.sentence();
    const content = faker.lorem.paragraph();

    return { title, content, communityId: randomCommunityId(), published: faker.datatype.boolean(), authorId: randomAuthorId() }
  });
};

export const getProfiles = (users: User[]): Omit<Profile, 'id'>[] => {
  return users.map(({ id: userId }) => {
    const bio = faker.lorem.paragraph();

    return { userId, bio };
  });
};
