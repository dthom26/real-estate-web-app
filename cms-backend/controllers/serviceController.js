import serviceRepository from "../repositories/serviceRepository.js";
import cloudinary from "../config/cloudinary.js";
// Get all services
export const getAllServices = async (req, res, next) => {
  try {
    const services = await serviceRepository.findAll();
    const serialized = services.map((s) => ({
      ...s.toObject(),
      image: s.image?.url ?? null,
    }));
    res.json(serialized);
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
    const serialized = {
      ...updatedService.toObject(),
      image: updatedService.image?.url ?? null,
    };
    res.json(serialized);
  } catch (error) {
    next(error);
  }
};

// Delete service
export const deleteService = async (req, res, next) => {
  try {
    const service = await serviceRepository.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Delete the image from Cloudinary
    if (
      service.image?.public_id &&
      service.image.public_id !== "legacy/unknown"
    ) {
      await cloudinary.uploader
        .destroy(service.image.public_id)
        .catch(() => {});
      // .catch(() => {}) — same reasoning as allSettled above
    }

    await serviceRepository.deleteById(req.params.id);
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
    // Return full object including public_id — used by CMS admin edit page
    res.json(service);
  } catch (error) {
    next(error);
  }
};
