import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', 
      required: true,
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'doctor', 
      required: true,
    },
    slotDate: {
      type: String,
      required: true,
    },
    slotTime: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: Boolean,
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);


appointmentSchema.pre(/^find/, function (next) {
  this.populate('userId')
      .populate('docId');
  next();
});


const appointmentModel =
  mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
