import propertyRepository from "../repositories/propertyRepository.js";
import cloudinary from "../config/cloudinary.js";

// get all properties
export const getAllProperties = async (req, res, next) => {
  try {
    const properties = await propertyRepository.findAll();
    const serialized = properties.map((p) => ({
      ...p.toObject(),
      images: p.images.map((img) => img.url),
    }));
    res.json(serialized);
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
// // delete property - deprecated in favor of the more robust version below that also handles Cloudinary cleanup
// export const deleteProperty = async (req, res, next) => {
//   try {
//     const deletedProperty = await propertyRepository.deleteById(req.params.id);
//     if (!deletedProperty) {
//       return res.status(404).json({ error: "Property not found" });
//     }
//     res.json({ message: "Property deleted successfully" });
//   } catch (error) {
//     next(error);
//   }
// };
// get property by id
export const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }
    // Return full objects including public_id — used by CMS admin edit page
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
      images: s.featuredImage
        ? [s.featuredImage]
        : s.images.map((img) => img.url),
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
// patch featured fields only (featured, featuredOrder, featuredImage)
export const patchFeatured = async (req, res, next) => {
  try {
    const { featured, featuredOrder, featuredImage } = req.body;
    const updates = {};
    if (featured !== undefined) updates.featured = featured;
    if (featuredOrder !== undefined) updates.featuredOrder = featuredOrder;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;

    const updated = await propertyRepository.updateById(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
// delete property
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Delete all images from Cloudinary before removing the DB record
    const deletions = property.images
      .filter((img) => img.public_id && img.public_id !== "legacy/unknown")
      .map((img) => cloudinary.uploader.destroy(img.public_id));

    await Promise.allSettled(deletions);
    // Note: allSettled (not Promise.all) — if one Cloudinary deletion fails,
    // we still want to remove the MongoDB document. Don't let a failed CDN
    // call leave a zombie record in your database.

    await propertyRepository.deleteById(req.params.id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    next(error);
  }
};
