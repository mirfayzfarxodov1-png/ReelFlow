// ============ PAYMENT SCHEMA ============

const PaymentSchema = {
    // Foydalanuvchi
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // To'lov turi
    type: {
        type: String,
        enum: ['deposit', 'withdraw', 'gift', 'ad_revenue', 'subscription'],
        required: true
    },
    
    // Miqdor
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    fee: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    },
    
    // To'lov usuli
    method: {
        type: String,
        enum: ['credit_card', 'paypal', 'crypto', 'bank_transfer', 'reelflow_coin'],
        required: true
    },
    
    // Holati
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending',
        index: true
    },
    
    // Tranzaksiya ma'lumotlari
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paymentIntentId: String,
    receiptUrl: String,
    
    // Qo'shimcha
    description: String,
    metadata: {
        type: Map,
        of: String
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    completedAt: {
        type: Date,
        default: null
    }
};

// Indexes
PaymentSchema.index({ user: 1, createdAt: -1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });
