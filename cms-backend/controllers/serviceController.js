import serviceRepository from "../repositories/serviceRepository.js";

// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceRepository.findAll();
    res.json(services);
  } catch (error) {
    next(error);
  }
};

// Create new service
export const createService = async (req, res, next) => {
  try {
    const newService = await serviceRepository.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    next(error);
  }
};

// Update service
export const updateService = async (req, res, next) => {
  try {
    const updatedService = await serviceRepository.updateById(
      req.params.id,
      req.body,
    );
    if (!updatedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(updatedService);
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const deletedService = await serviceRepository.deleteById(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get service by id
export const getServiceById = async (req, res, next) => {
  try {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    next(error);
  }
};
