const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');
const User = require('./models/User');

dotenv.config();

const seedOrganizer = {
  name: 'EventFlow Seed Organizer',
  email: 'seed.organizer@eventflow.test',
  password: 'seed12345',
  role: 'Organizer',
};

const buildEvents = (organizerId) => [
  {
    organizerId,
    title: 'MERN Stack Masterclass',
    description:
      'An intensive full-stack bootcamp for aspiring web developers. Learn MongoDB, Express, React, Node.js, REST APIs, authentication, deployment workflows, and real-world project architecture through hands-on sessions.',
    date: new Date('2026-09-05T10:00:00+05:30'),
    location: 'Innovation Lab, Amrapali University, Haldwani',
    totalCapacity: 120,
    ticketsAvailable: 42,
    price: 1499,
    imageUrl: 'https://source.unsplash.com/1200x800/?coding,web-development',
  },
  {
    organizerId,
    title: 'Gamer Wave Esports Fiesta',
    description:
      'A high-energy esports festival featuring squad battles, Free Fire finals, Minecraft creative challenges, live commentary, gaming booths, and prizes for top players and teams.',
    date: new Date('2026-09-20T14:00:00+05:30'),
    location: 'Central Auditorium, Amrapali University, Haldwani',
    totalCapacity: 300,
    ticketsAvailable: 0,
    price: 599,
    imageUrl: 'https://source.unsplash.com/1200x800/?gaming,esports',
  },
  {
    organizerId,
    title: 'The Ultimate Musical Night',
    description:
      'A dual-genre concert experience opening with a soulful Kishore Kumar tribute and closing with a power-packed Yo Yo Honey Singh live performance, complete with lights, sound, and food stalls.',
    date: new Date('2026-10-10T18:30:00+05:30'),
    location: 'Open Air Theatre, Haldwani',
    totalCapacity: 500,
    ticketsAvailable: 188,
    price: 999,
    imageUrl: 'https://source.unsplash.com/1200x800/?concert,music',
  },
  {
    organizerId,
    title: 'Amrapali University Chess Championship',
    description:
      'A grand chess tournament for students and strategy lovers, focused on classical openings, theoretical outcomes, middlegame planning, rapid rounds, and expert game analysis.',
    date: new Date('2026-10-24T09:30:00+05:30'),
    location: 'Seminar Hall B, Amrapali University, Haldwani',
    totalCapacity: 96,
    ticketsAvailable: 63,
    price: 0,
    imageUrl: 'https://source.unsplash.com/1200x800/?chess,tournament',
  },
  {
    organizerId,
    title: 'Tech for Good Summit',
    description:
      'A practical seminar on building web apps for hyper-local disaster response, volunteer coordination, resource mapping, emergency alerts, and community-first technology solutions.',
    date: new Date('2026-11-08T11:00:00+05:30'),
    location: 'City Convention Centre, Haldwani',
    totalCapacity: 180,
    ticketsAvailable: 117,
    price: 299,
    imageUrl: 'https://source.unsplash.com/1200x800/?technology,community',
  },
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    const hashedPassword = await bcrypt.hash(seedOrganizer.password, 10);
    const organizer = await User.findOneAndUpdate(
      { email: seedOrganizer.email },
      {
        name: seedOrganizer.name,
        email: seedOrganizer.email,
        password: hashedPassword,
        role: seedOrganizer.role,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await Ticket.deleteMany({});
    await Event.deleteMany({});

    const events = await Event.insertMany(buildEvents(organizer._id));

    console.log(`Seed complete: inserted ${events.length} events`);
    console.log(`Organizer login: ${seedOrganizer.email} / ${seedOrganizer.password}`);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedDatabase();
