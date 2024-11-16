const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const productSchema = Schema({
    id: { type: String, required: true, unique: true }, 
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: Array, required: true },    
    description: { type: String, required: true },
    price: { type: Number, required: true },
    is_active: { type: String, default: "active" },
}, { timestamps: true })

productSchema.methods.toJSON = function () {
    const obj = this._doc
    delete obj.__v
    delete obj.updateAT
    delete obj.createAt
    return obj
}

// Mongoose의 post 미들웨어를 사용하여 에러 메시지 커스터마이징
productSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        // 중복 키 에러가 발생한 경우
        next(new Error('id 값이 이미 존재합니다. 다른 id 값을 넣어주세요!'));
    } else {
        // 다른 에러는 기본 처리
        next(error);
    }
});

const Product = mongoose.model("Product", productSchema)
module.exports = Product;