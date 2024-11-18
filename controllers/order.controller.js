const orderController = {}
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator")
const productController = require("./product.controller");

PAGE_SIZE = 10;

orderController.createOrder = async (req, res) => {
    try {

        // 프론트엔드에서 데이터 보낸거 다 받아와 
        const { userId } = req;
        const { name, email, phone, price, productId, productName, productCategory } = req.body

        // order를 만들자
        const newOrder = new Order({
            userId,
            name,
            email,
            phone,
            price,
            productId,
            productName,
            productCategory,
            orderNum: randomStringGenerator()
        });

        await newOrder.save()
        res.status(200).json({ status: "success", orderNum: newOrder.orderNum, orderUserId: newOrder.userId})

    } catch (error) {
        return res.status(400).json({ status: "fail", message: error.message })

    }
}

orderController.getOrder = async (req, res, next) => {
    try {
        const { userId } = req;
        const { page = 1 } = req.query;

        const orderList = await Order.find({ userId: userId })
            .sort({ createdAt: -1 }) // 최신순으로 정렬
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE)
            .populate({
                path: "items",
                populate: {
                    path: "productId",
                    model: "Product",
                    select: "image name",
                },
            });

        const totalItemNum = await Order.countDocuments({ userId }); // 수정된 부분

        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({ status: "success", data: orderList, totalPageNum })

    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message })
    }
}

orderController.getOrderList = async (req, res, next) => {
    try {
        const { page = 1, ordernum } = req.query;
        let cond = {}

        if (ordernum) {
            cond = {
                orderNum: { $regex: ordernum, $options: "i" },
            };
        }

        const orderList = await Order.find(cond)
            .sort({ createdAt: -1 }) // 최신순으로 정렬
            // .populate("userId")
            // .populate({
            //     path: "items",
            //     populate: {
            //         path: "productId",
            //         model: "Product",
            //         select: "image name",
            //     },
            //})
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);

        const totalItemNum = await Order.countDocuments(cond); // 'count()'를 'countDocuments()'로 수정
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        res.status(200).json({ status: "success", data: orderList, totalPageNum });

    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message })
    }
}

module.exports = orderController;