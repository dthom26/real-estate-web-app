import serviceRepository from "../repositories/serviceRepository.js";

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const services = await serviceRepository.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// Create new service
export const createService = async (req, res) => {
  try {
    const newService = await serviceRepository.create(req.body);
    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: "Failed to create service" });
  }
};

// Update service
export const updateService = async (req, res) => {
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
    res.status(500).json({ error: "Failed to update service" });
  }
};

// Delete service
export const deleteService = async (req, res) => {
  try {
    const deletedService = await serviceRepository.deleteById(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};

// Get service by id
export const getServiceById = async (req, res) => {
  try {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service" });
  }
};
