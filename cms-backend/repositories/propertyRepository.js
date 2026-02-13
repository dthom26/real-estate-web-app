import property from "../models/property.js";

class PropertyRepository {
  async findAll(filter = {}) {
    try {
      return await property.find(filter);
    } catch (error) {
      throw new Error(`Error fetching properties: ${error.message}`);
    }
  }
  // Create new property
  async create(data) {
    try {
      return await property.create(data);
    } catch (error) {
      throw new Error(`Error creating property: ${error.message}`);
    }
  }
  // Find a property by ID
  async findById(id) {
    try {
      return await property.findById(id);
    } catch (error) {
      throw new Error(`Error fetching property by ID: ${error.message}`);
    }
  }
  // Update a property by ID
  async updateById(id, data) {
    try {
      return await property.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
      throw new Error(`Error updating property: ${error.message}`);
    }
  }
  // count properties
  async count(filter = {}) {
    try {
      return await property.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting properties: ${error.message}`);
    }
  }
  // delete a property by ID
  async deleteById(id) {
    try {
      return await property.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting property: ${error.message}`);
    }
  }
}

export default new PropertyRepository();
