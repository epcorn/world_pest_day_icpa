const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path as needed

const MONGO_URI = 'mongodb+srv://epcorn:epcorn1234@eppl.du6ol.mongodb.net/WorldPestDay?retryWrites=true&w=majority';

async function getUsersWithoutVideo() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const users = await User.find({ videoUrl: null })
            .select('name email companyName -_id') // Exclude _id here
            .lean();

        console.log('Users who have not uploaded video:\n', users);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

getUsersWithoutVideo();
