import property from "../models/property.js";

class PropertyRepository {
  async findAll(filter = {}) {
    return await property.find(filter);
  }

  async create(data) {
    return await property.create(data);
  }

  async findById(id) {
    return await property.findById(id);
  }

  async updateById(id, data) {
    return await property.findByIdAndUpdate(id, data, { new: true });
  }

  async count(filter = {}) {
    return await property.countDocuments(filter);
  }

  async deleteById(id) {
    return await property.findByIdAndDelete(id);
  }
  async findFeatured({limit = 5} = {}) {
    return await property.find({ featured: true, status: 'published' })
  .sort({ featuredOrder: 1 })
  .limit(limit)
  .select('_id image alt address price bedrooms bathrooms sqft link featuredImage featuredOrder')
  .lean();
  }
}

export default new PropertyRepository();
