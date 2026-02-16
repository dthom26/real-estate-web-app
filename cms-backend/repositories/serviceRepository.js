import Service from "../models/service.js";

class ServiceRepository {
  async findAll(filter = {}) {
    try {
      return await Service.find(filter);
    } catch (error) {
      throw new Error(`Error fetching services: ${error.message}`);
    }
  }

  async create(data) {
    try {
      return await Service.create(data);
    } catch (error) {
      throw new Error(`Error creating service: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      return await Service.findById(id);
    } catch (error) {
      throw new Error(`Error fetching service by ID: ${error.message}`);
    }
  }

  async updateById(id, data) {
    try {
      return await Service.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw new Error(`Error updating service: ${error.message}`);
    }
  }

  async count(filter = {}) {
    try {
      return await Service.countDocuments(filter);
    } catch (error) {
      throw new Error(`Error counting services: ${error.message}`);
    }
  }

  async deleteById(id) {
    try {
      return await Service.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting service: ${error.message}`);
    }
  }
}

export default new ServiceRepository();
