import About from '../models/about.js';

class AboutRepository {
    async get() {
        return await About.findOne();
    }

    async update(data) {
        return await About.findOneAndUpdate(
            {},
            data,
            { new: true, upsert: true, returnDocument: 'after', runValidators: true }
        );
    }
}

export default new AboutRepository();