import aboutRepository from "../repositories/aboutRepository.js";

// GET - get the single about document
export const getAboutInfo = async (req, res, next) => {
    try {
        const aboutData = await aboutRepository.get();
        if (!aboutData) {
            return res.status(404).json({ error: 'About Me data not found' });
        }
        res.json(aboutData);
    } catch (error) {
        next(error);
    }
};
// PUT - update the about doc
export const updateAboutInfo = async (req, res, next) => {
    try {
        const updatedData = await aboutRepository.update(req.body);
        res.json(updatedData); 
    } catch (error) {
        next(error);
    }
};