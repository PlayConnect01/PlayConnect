const db = require("../database/index");
const getbrands = async (req, res) => {
    try {
        const brands = await db.brands.findAll();
        console.log(brands);

        res.send(brands);
    } catch (error) {
        console.error("Error fetching brands:", error);
        res.status(500).send("Failed to fetch brands");
    }
};
const deletebrand = async (req, res) => {
    const { id } = req.params; 
    try {
        const result = await db.brands.destroy({
            where: { id: id }
        });
        
        if (result) {
            res.status(200).send({ message: "Brand deleted successfully." });
        } else {
            res.status(404).send({ message: "Brand not found." });
        }
    } catch (error) {
        console.error("Error deleting brand:", error);
        res.status(500).send("Failed to delete brand");
    }
};

const updateverified = async (req, res) => {
    const { id } = req.params; 
    const { verified } = req.body; // Expecting the new verified status in the request body

    try {
        const result = await db.brands.update(
            { verified: verified }, // Update the verified field
            { where: { id: id } } // Condition to find the brand by ID
        );

        if (result[0] === 1) { // result[0] indicates the number of rows affected
            res.status(200).send({ message: "Brand verified status updated successfully." });
        } else {
            res.status(404).send({ message: "Brand not found." });
        }
    } catch (error) {
        console.error("Error updating brand verified status:", error);
        res.status(500).send("Failed to update brand verified status");
    }
};

module.exports = {

    getbrands,deletebrand,updateverified
   
};