import propertyRepository from "../repositories/propertyRepository.js";

// get all properties
export const getAllProperties = async (req, res, next) => {
  try {
    const properties = await propertyRepository.findAll();
    res.json(properties);
  } catch (error) {
    next(error);
  }
};
// create new property
export const createProperty = async (req, res, next) => {
  try {
    const newProperty = await propertyRepository.create(req.body);
    res.status(201).json(newProperty);
  } catch (error) {
    next(error);
  }
};
// update property
export const updateProperty = async (req, res, next) => {
  try {
    const updatedProperty = await propertyRepository.updateById(
      req.params.id,
      req.body,
    );
    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
};
// delete property
export const deleteProperty = async (req, res, next) => {
  try {
    const deletedProperty = await propertyRepository.deleteById(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};
// get property by id
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};
// get featured properties for carousel
export const getCarousel = async (req, res, next) => {
  try {
    const rawLimit = Number(req.query.limit) || 5;
    const limit = Math.min(Math.max(rawLimit, 1), 50);
    const slides = await propertyRepository.findFeatured({ limit });

    const payload = slides.map((s) => ({
      _id: s._id,
      image: s.featuredImage || s.image,
      alt: s.alt,
      address: s.address,
      price: s.price,
      bedrooms: s.bedrooms,
      bathrooms: s.bathrooms,
      sqft: s.sqft,
      link: s.link,
      order: s.featuredOrder ?? 0,
    }));

    res.json(payload);
  } catch (error) {
    next(error);
  }
};
