import About from '../models/about.js';

class AboutRepository {
    async get() {
        try {
            return await About.findOne();
        } catch (error) {
            throw new Error(`Error fetching about: ${error.message}`);
        }
    };
    async update(data) {
        try {
            return await About.findOneAndUpdate(
                {},
                data,
                { new: true, upsert: true, returnDocument: 'after', runValidators: true }
            );
        } catch (error) {
            throw new Error(`Error updating about: ${error.message}`);
        }
    }
}

export default new AboutRepository();