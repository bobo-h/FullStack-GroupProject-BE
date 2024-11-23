const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const diarySchema = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: null },
    selectedDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return value <= today;
        },
        message: "Selected date cannot be in the future.",
      },
    },
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
  } else if (
    this.isModified("title") ||
    this.isModified("content") ||
    this.isModified("image") ||
    this.isModified("mood")
  ) {
    this.isEdited = true;
  }
  next();
});

module.exports = mongoose.model("Diary", diarySchema);
