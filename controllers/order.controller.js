const orderController = {}
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator")
const productController = require("./product.controller");

PAGE_SIZE = 5; 

orderController.createOrder = async (req, res) => {
    try {
        // 프론트엔드에서 데이터 보낸거 다 받아와 
        
        // const { userId } = req;
        const userId = "userId_virtual" 
        const { name, phone, price, productId, productName, productCategory } = req.body

        // order를 만들자
        const newOrder = new Order({
            userId,
            name,
            phone,
            price,
            productId,
            productName,
            productCategory,
            orderNum: randomStringGenerator()
        });

        await newOrder.save()
        res.status(200).json({ status: "success", orderNum: newOrder.orderNum })

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

orderController.updateOrder = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(
            id,
            { status: status },
            { new: true }
        );
        if (!order) throw new Error("Can't find order");

        res.status(200).json({ status: "success", data: order });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 최근 주소 가져오기
orderController.fetchRecentAddress = async (req, res) => {
    try {
        const { userId } = req;

        const recentOrder = await Order.findOne({ userId })
            .sort({ createdAt: -1 })
            .select("shipTo contact -_id"); // 최근 주소와 연락처 정보만 선택

        if (!recentOrder) {
            return res.status(404).json({ status: "fail", message: "No recent address found." });
        }

        res.status(200).json({ status: "success", data: recentOrder });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

// 모든 이전 주소 가져오기
orderController.fetchPreviousAddresses = async (req, res) => {
    try {
        const { userId } = req;

        const previousOrders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .select("shipTo contact -_id"); // 모든 주문의 주소와 연락처 정보만 선택

        if (!previousOrders || previousOrders.length === 0) {
            return res.status(404).json({ status: "fail", message: "No previous addresses found." });
        }

        res.status(200).json({ status: "success", data: previousOrders });
    } catch (error) {
        return res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = orderController;