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
}

export default new PropertyRepository();
