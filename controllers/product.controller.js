const Product = require("../models/Product")

const PAGE_SIZE = 10
const productController = {}

productController.createProduct = async (req, res) => {
    try {
        const { id, name, image, description, category, is_active, price, } = req.body
        const product = new Product({
            id,
            name,
            image,
            description,
            category,
            is_active,
            price,
        });

        await product.save()
        res.status(200).json({ status: "success", product })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.getProducts = async (req, res) => {
    try {
        const { page, name } = req.query
        const cond = name ? {
            name: { $regex: name, $options: 'i' }, is_active: "active"
        } : { is_active: "active" }

        let query = Product.find(cond)
        let response = { status: "success", };
        if (page) {
            query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
            // 총 몇개의 페이지가 있는지? 
            // 데이터가 총 몇개 있는지 체크해서 페이지 사이즈로 나눈다.
            const totalItemNum = await Product.countDocuments(cond);
            const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
            response.totalPageNum = totalPageNum;
        }

        const productList = await query.exec()
        response.data = productList
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { id, name, image, description, category, is_active, price, }  = req.body

        // TODO HERE 여기 다시 보기 
        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            { id, name, image, description, category, is_active, price,  },
            { new: true }
        );
        if (!product) throw new Error("Item doesn't exist!!")
        res.status(200).json({ status: "success", data: product })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await Product.findByIdAndUpdate(
            { _id: productId },
            { is_active: "inactive" }
        );

        if (!product) throw new Error("No item found")
        res.status(200).json({ status: "success" })

    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

productController.getProductById = async (req, res) => {
    try {

        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) throw new Error("No item found!!")
        res.status(200).json({ status: "success", data: product })
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message })
    }
}

module.exports = productController