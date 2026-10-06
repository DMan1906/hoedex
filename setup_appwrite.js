import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const endpoint = process.env.VITE_APPWRITE_ENDPOINT;
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const dbId = process.env.VITE_APPWRITE_DATABASE_ID;
const catchesColId = process.env.VITE_APPWRITE_CATCHES_COLLECTION_ID;
const milestonesColId = process.env.VITE_APPWRITE_MILESTONES_COLLECTION_ID;

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

const databases = new Databases(client);

async function setup() {
    console.log('Starting Appwrite Database Setup...');

    // Permissions
    const { Permission, Role } = await import('node-appwrite');
    const catchesPermissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
    ];

    // 1. Setup Catches Collection
    try {
        await databases.getCollection(dbId, catchesColId);
        console.log('Catches collection already exists, updating permissions...');
        await databases.updateCollection(dbId, catchesColId, 'Catches', catchesPermissions);
    } catch (e) {
        console.log('Creating Catches collection...');
        await databases.createCollection(dbId, catchesColId, 'Catches', catchesPermissions);
    }

    console.log('Adding attributes to Catches...');
    try { await databases.createStringAttribute(dbId, catchesColId, 'user_id', 36, true); } catch(e) { /* ignore already exists */ }
    try { await databases.createStringAttribute(dbId, catchesColId, 'image_id', 36, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, catchesColId, 'animal_breed', 100, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, catchesColId, 'country_of_origin', 100, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, catchesColId, 'special_characteristics', 500, false); } catch(e) { }
    try { await databases.createBooleanAttribute(dbId, catchesColId, 'is_legendary', false, false, false); } catch(e) { }
    try { await databases.createStringAttribute(dbId, catchesColId, 'legendary_type', 50, false); } catch(e) { }
    try { await databases.createDatetimeAttribute(dbId, catchesColId, 'created_at', true); } catch(e) { }

    console.log('Adding new attributes to Catches...');
    try { await databases.createStringAttribute(dbId, catchesColId, 'name', 100, false); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'age', false, 0, 100); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'rating_face', false, 1, 10); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'rating_body', false, 1, 10); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'rating_personality', false, 1, 10); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'rating_compatibility', false, 1, 10); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, catchesColId, 'rating_red_flags', false, 1, 10); } catch(e) { }
    try { await databases.createStringAttribute(dbId, catchesColId, 'owner_contact', 100, false); } catch(e) { }

    // 2. Setup Milestones Collection
    const milestonesPermissions = [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
    ];

    try {
        await databases.getCollection(dbId, milestonesColId);
        console.log('Milestones collection already exists, updating permissions...');
        await databases.updateCollection(dbId, milestonesColId, 'Milestones', milestonesPermissions);
    } catch (e) {
        console.log('Creating Milestones collection...');
        await databases.createCollection(dbId, milestonesColId, 'Milestones', milestonesPermissions);
    }

    console.log('Adding attributes to Milestones...');
    try { await databases.createStringAttribute(dbId, milestonesColId, 'user_id', 36, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, milestonesColId, 'milestone_name', 100, true); } catch(e) { }
    try { await databases.createDatetimeAttribute(dbId, milestonesColId, 'unlocked_at', true); } catch(e) { }

    // 2.5 Setup Profiles Collection
    const profilesColId = 'profiles';
    try {
        await databases.getCollection(dbId, profilesColId);
        console.log('Profiles collection already exists, updating permissions...');
        await databases.updateCollection(dbId, profilesColId, 'Profiles', catchesPermissions);
    } catch (e) {
        console.log('Creating Profiles collection...');
        await databases.createCollection(dbId, profilesColId, 'Profiles', catchesPermissions);
    }

    console.log('Adding attributes to Profiles...');
    try { await databases.createStringAttribute(dbId, profilesColId, 'user_id', 36, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, profilesColId, 'name', 100, true); } catch(e) { }
    try { await databases.createStringAttribute(dbId, profilesColId, 'avatar_id', 36, false); } catch(e) { }
    try { await databases.createIntegerAttribute(dbId, profilesColId, 'catches_count', false, 0, 1000000, 0); } catch(e) { }
    try { await databases.createDatetimeAttribute(dbId, profilesColId, 'created_at', true); } catch(e) { }

    // 3. Setup Storage Bucket Permissions
    const { Storage } = await import('node-appwrite');
    const storageClient = new Storage(client);
    const storageId = process.env.VITE_APPWRITE_STORAGE_ID;
    
    try {
        await storageClient.getBucket(storageId);
        console.log('Storage bucket found, updating permissions...');
        await storageClient.updateBucket(
            storageId,
            'Hoedex Storage',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
    } catch (e) {
        console.log('Creating Storage bucket...');
        try {
            await storageClient.createBucket(
                storageId,
                'Hoedex Storage',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
        } catch(err) {
            console.log('Could not create/update bucket automatically. Error:', err.message);
        }
    }

    console.log('Setup finished! Please note that attributes may take a few seconds to become fully available.');
}

setup().catch(console.error);
