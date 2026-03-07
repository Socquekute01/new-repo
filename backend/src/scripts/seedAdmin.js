import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

const seedAdmin = async () => {
    try {
        await connectDB();

        const defaultPermissions = [
            { key: 'manage_products', description: 'Manage products' },
            { key: 'manage_orders', description: 'Manage orders' },
        ];

        await Promise.all(
            defaultPermissions.map((permission) =>
                Permission.findOneAndUpdate(
                    { key: permission.key },
                    { $setOnInsert: permission },
                    { new: true, upsert: true }
                )
            )
        );

        const permissionDocs = await Permission.find({
            key: { $in: defaultPermissions.map((p) => p.key) },
        });
        const permissionByKey = new Map(permissionDocs.map((p) => [p.key, p._id]));

        const allPermissions = await Permission.find();
        const adminRole = await Role.findOneAndUpdate(
            { name: 'admin' },
            { $set: { description: 'admin' }, $setOnInsert: { name: 'admin' } },
            { new: true, upsert: true }
        );

        if (allPermissions.length > 0) {
            const permissionIds = allPermissions.map((permission) => permission._id);
            adminRole.permissions = permissionIds;
            await adminRole.save();
        }

        const managerPermissionIds = [permissionByKey.get('manage_products')].filter(Boolean);
        const staffPermissionIds = [permissionByKey.get('manage_orders')].filter(Boolean);

        await Role.findOneAndUpdate(
            { name: 'manager' },
            {
                $set: { description: 'manager', permissions: managerPermissionIds },
                $setOnInsert: { name: 'manager' },
            },
            { new: true, upsert: true }
        );

        await Role.findOneAndUpdate(
            { name: 'staff' },
            {
                $set: { description: 'staff', permissions: staffPermissionIds },
                $setOnInsert: { name: 'staff' },
            },
            { new: true, upsert: true }
        );

        let user = await User.findOne({ email: ADMIN_EMAIL });

        if (!user) {
            user = new User({
                username: ADMIN_USERNAME,
                name: ADMIN_USERNAME,
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
                roles: [adminRole._id],
            });
            await user.save();
            console.log('? Admin user created');
        } else {
            user.role = 'admin';
            user.roles = Array.from(new Set([...(user.roles || []), adminRole._id]));
            await user.save();
            console.log('? Admin user updated');
        }

        console.log('Admin credentials:');
        console.log(`- email: ${ADMIN_EMAIL}`);
        console.log(`- password: ${ADMIN_PASSWORD}`);
        process.exit(0);
    } catch (error) {
        console.error('? Failed to seed admin:', error);
        process.exit(1);
    }
};

seedAdmin();
