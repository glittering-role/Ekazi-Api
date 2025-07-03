import { v4 as uuidv4 } from 'uuid';
import { Roles, UserDetails, UserLocation, UserRoles, Users } from "../Modules/Users/model/associations";

// Function to generate random data
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Tracking generated values
const generatedEmails: Set<string> = new Set();
const generatedUsernames: Set<string> = new Set();
const generatedPhoneNumbers: Set<string> = new Set();

// Function to generate a unique value
const generateUniqueValue = (
    type: 'email' | 'username' | 'phone_number',
    baseValue: string,
    index: number
): string => {
    let value = `${baseValue}${index}`;
    if (type === 'email') value = `${value}@example.com`;
    else if (type === 'phone_number') value = `+123456789${getRandomInt(100, 999)}`;

    // Ensure uniqueness
    while ((type === 'email' && generatedEmails.has(value)) ||
    (type === 'username' && generatedUsernames.has(value)) ||
    (type === 'phone_number' && generatedPhoneNumbers.has(value))) {
        value = `${baseValue}${index}_${getRandomInt(1000, 9999)}`;
    }

    // Add to the respective set
    if (type === 'email') generatedEmails.add(value);
    else if (type === 'username') generatedUsernames.add(value);
    else if (type === 'phone_number') generatedPhoneNumbers.add(value);

    return value;
};

// Generate a unique random user
const generateUniqueRandomUser = async (index: number) => {
    const email = generateUniqueValue('email', 'user', index);
    const username = generateUniqueValue('username', 'user', index);
    const phone_number = generateUniqueValue('phone_number', 'user', index);

    return {
        id: uuidv4(),
        email,
        phone_number,
        username,
        password: 'hashedPassword' + getRandomInt(100, 999),
        status: 'Active',
        authType: 'email',
        isActive: true,
        isEmailVerified: getRandomInt(0, 1) === 1,
    };
};

const generateRandomUserDetails = (userId: string, index: number) => ({
    id: uuidv4(),
    user_id: userId,
    first_name: `FirstName${index}`,
    middle_name: `MiddleName${getRandomInt(1, 5)}`,
    last_name: `LastName${index}`,
    gender: getRandomInt(0, 1) === 0 ? 'Male' : 'Female',
    date_of_birth: new Date(getRandomInt(1980, 2000), getRandomInt(0, 11), getRandomInt(1, 28)),
    image: `image_url_${index}`,
    about_the_user: `Description about user ${index}`,
});

const generateRandomUserLocation = (userId: string, index: number) => ({
    id: uuidv4(),
    user_id: userId,
    country: 'Country' + getRandomInt(1, 5),
    state: 'State' + getRandomInt(1, 5),
    state_name: 'StateName' + getRandomInt(1, 5),
    continent: 'Continent' + getRandomInt(1, 5),
    city: `City${getRandomInt(1, 100)}`,
    zip: `${getRandomInt(10000, 99999)}`,
});

const generateRandomUserRole = (userId: string, roles: string | any[]) => ({
    id: uuidv4(),
    user_id: userId,
    role_id: roles[getRandomInt(0, roles.length - 1)].id,
});

// Function to insert data in batches
const insertInBatches = async (data: any[], model: any, batchSize: number) => {
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        await model.bulkCreate(batch);
        console.log(`Inserted batch ${i / batchSize + 1}`);
    }
};

const seedData = async () => {
    try {
        console.log('Starting seeder...');

        // Create roles
        const roles = await Roles.bulkCreate([
            { id: uuidv4(), role_name: 'admin', role_status: true },
            { id: uuidv4(), role_name: 'user', role_status: true },
            { id: uuidv4(), role_name: 'service_provider', role_status: true },
        ]);

        // Generate and insert users in batches
        const totalUsers = 20;
        const batchSize = 10;
        const users = [];
        for (let i = 1; i <= totalUsers; i++) {
            const user = await generateUniqueRandomUser(i);
            users.push(user);
        }
        await insertInBatches(users, Users, batchSize);

        // Fetch all created users (in batches if necessary)
        const createdUsers = await Users.findAll();

        // Generate and insert user details in batches
        const userDetails = createdUsers.map((user, index) => generateRandomUserDetails(user.id, index + 1));
        await insertInBatches(userDetails, UserDetails, batchSize);

        // Generate and insert user locations in batches
        const userLocations = createdUsers.map((user, index) => generateRandomUserLocation(user.id, index + 1));
        await insertInBatches(userLocations, UserLocation, batchSize);

        // Assign random roles to users in batches
        const userRoles = createdUsers.map((user) => generateRandomUserRole(user.id, roles));
        await insertInBatches(userRoles, UserRoles, batchSize);

        console.log('Seeder completed successfully.');
    } catch (error) {
        console.error('Error running seeder:', error);
    }
};

seedData().then(() => console.log('Seeder finished.'));