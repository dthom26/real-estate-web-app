import heroRepository from "../repositories/heroRepository.js";

// GET - get the single hero document
export const getHero = async (req, res, next) => {
  try {
    const heroData = await heroRepository.get();
    if (!heroData) {
      return res.status(404).json({ error: "Hero data not found" });
    }
    res.json(heroData);
  } catch (error) {
    next(error);
  }
};

// PUT - update the hero doc (upserts if missing)
export const updateHero = async (req, res, next) => {
  try {
    const updatedData = await heroRepository.update(req.body);
    res.json(updatedData);
  } catch (error) {
    next(error);
  }
};
