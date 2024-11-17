const Mood = require("../models/Mood")
const Product = require("../models/Mood")

const PAGE_SIZE = 20
const moodController = {}

moodController.createMood = async (req, res) => {
    try {
        const { id, name, image, description, isDeleted } = req.body
        const mood = new Mood({
            id,
            name,
            image,
            description,
            isDeleted
        });

        await mood.save()
        res.status(200).json({ status: "success", mood: mood })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

moodController.getMoods = async (req, res) => {
    try {
        const { page, name } = req.query
        const cond = name ? {
            name: { $regex: name, $options: 'i' }, isDeleted: "No"
        } : { isDeleted: "No" }

        let query = Mood.find(cond)
        let response = { status: "success", };
        if (page) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
            // 총 몇개의 페이지가 있는지? 
            // 데이터가 총 몇개 있는지 체크해서 페이지 사이즈로 나눈다.
            const totalItemNum = await Mood.countDocuments(cond);
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }

        const moodList = await query.exec()
        response.data = moodList
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

moodController.updateMood = async (req, res) => {
    try {
        const moodId = req.params.id;
        const { id, name, image, description, isDeleted }  = req.body

        const mood = await Mood.findByIdAndUpdate(
            { _id: moodId },
            { id, name, image, description, isDeleted },
            { new: true }
        );
        if (!mood) throw new Error("Item doesn't exist!!")
        res.status(200).json({ status: "success", data: mood })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

moodController.deleteMood = async (req, res) => {
    try {
        const moodId = req.params.id;

        const mood = await Mood.findByIdAndUpdate(
            { _id: moodId },
            { isDeleted: "Yes" }
        );

        if (!mood) throw new Error("No item found")
        res.status(200).json({ status: "success" })

    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

moodController.getMoodById = async (req, res) => {
    try {

        const moodId = req.params.id;

        const mood = await Mood.findById(moodId);
        if (!product) throw new Error("No item found!!")
        res.status(200).json({ status: "success", data: mood })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

module.exports = moodController