const Order = require("../models/Order");
const salesController = {};

salesController.getProductSales = async (req, res) => {
  try {
    const salesList = await Order.aggregate([
      {
        $group: {
          _id: "$productId", // productId를 기준으로 그룹화
          totalQuantity: { $sum: 1 }, // 총 판매량
          totalSales: { $sum: "$price" }, // 총 매출 금액
        },
      },
      {
        $lookup: {
          from: "products", // Product 컬렉션과 조인
          localField: "_id", // Order의 productId 필드와 연결
          foreignField: "_id", // Product의 _id 필드와 연결
          as: "productDetails", // 조인 결과를 productDetails에 저장
        },
      },
      {
        $unwind: "$productDetails", // productDetails 배열을 평탄화
      },
      {
        $project: {
          _id: 0, // 기본적으로 _id를 포함하지 않음
          productId: "$_id", // productId를 반환
          productName: "$productDetails.name", // 상품명
          category: "$productDetails.category", // 카테고리
          totalQuantity: 1, // 판매량
          totalSales: 1, // 총 매출
        },
      },
      {
        $sort: { totalSales: -1 }, // 매출 금액 기준으로 내림차순 정렬
      },
    ]);

    res.status(200).json({ status: "success", data: salesList });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

salesController.getDailySales = async (req, res) => {
    try {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7); // 현재 날짜로부터 7일 전 계산
  
      const dailySales = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: twoWeeksAgo }, // 최근 1주간 데이터만 필터링
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // 날짜별로 그룹화
            },
            totalQuantity: { $sum: 1 }, // 하루 총 판매량
            totalSales: { $sum: "$price" }, // 하루 총 매출
          },
        },
        {
          $project: {
            _id: 0, // 기본적으로 _id를 반환하지 않음
            date: "$_id", // 날짜
            totalQuantity: 1, // 하루 판매량
            totalSales: 1, // 하루 매출
          },
        },
        {
          $sort: { date: 1 }, // 날짜 순으로 정렬
        },
      ]);
  
      res.status(200).json({ status: "success", data: dailySales });
    } catch (error) {
      res.status(400).json({ status: "fail", error: error.message });
    }
  };

module.exports = salesController;