const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const diarySchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    selectedDate: { type: Date, required: true },
    mood: { type: Schema.Types.ObjectId, ref: "Mood", required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

diarySchema.pre("save", function (next) {
  if (this.isNew) {
    this.isEdited = false;
  } else if (this.isModified()) {
    this.isEdited = true;
  }
  next();
});

module.exports = mongoose.model("Diary", diarySchema);
