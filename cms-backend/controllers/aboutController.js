import aboutRepository from "../repositories/aboutRepository.js";

// GET - get the single about document
export const getAboutInfo = async (req, res) => {
    try {
        const aboutData = await aboutRepository.get();
        if (!aboutData) {
            return res.status(404).json({ error: 'About Me data not found' });
        }
        res.json(aboutData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch About Me data' });
    }
};
// PUT - update the about doc
export const updateAboutInfo = async (req, res) => {
    try {
        const updatedData = await aboutRepository.update(req.body);
        res.json(updatedData); 
    } catch (error) {
         res.status(500).json({ error: 'Failed to update About Me data' })
    }
};