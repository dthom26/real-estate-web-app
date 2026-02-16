import Service from "../models/service.js";

class ServiceRepository {
  async findAll(filter = {}) {
    return await Service.find(filter);
  }

  async create(data) {
    return await Service.create(data);
  }

  async findById(id) {
    return await Service.findById(id);
  }

  async updateById(id, data) {
    return await Service.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async count(filter = {}) {
    return await Service.countDocuments(filter);
  }

  async deleteById(id) {
    return await Service.findByIdAndDelete(id);
  }
}

export default new ServiceRepository();
