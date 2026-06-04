const { messaging } = require('./firebase');
const Notification = require('./notification.model');
const User = require('../backend/models/User');

class PushNotificationService {
    
    // Device token saqlash
    async saveDeviceToken(userId, token, deviceType) {
        await User.findByIdAndUpdate(userId, {
            $push: {
                deviceTokens: {
                    token,
                    deviceType,
                    createdAt: new Date()
                }
            }
        });
    }

    // Token o'chirish
    async removeDeviceToken(userId, token) {
        await User.findByIdAndUpdate(userId, {
            $pull: { deviceTokens: { token } }
        });
    }

    // Asosiy notification yuborish
    async sendNotification(userId, title, body, data = {}, type = 'general') {
        try {
            // Save to database
            const notification = await Notification.create({
                userId,
                type,
                title,
                body,
                data,
                image: data.image || ''
            });

            // Get user's device tokens
            const user = await User.findById(userId);
            if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
                return notification;
            }

            // Send push notification
            const tokens = user.deviceTokens.map(t => t.token);
            const message = {
                notification: { title, body },
                data: {
                    type,
                    notificationId: notification._id.toString(),
                    ...data
                },
                tokens: tokens
            };

            // Send to all devices
            const response = await messaging.sendEachForMulticast(message);
            
            // Handle failed tokens
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });
                // Remove failed tokens
                for (const token of failedTokens) {
                    await this.removeDeviceToken(userId, token);
                }
            }

            return notification;
        } catch (error) {
            console.error('Send notification error:', error);
            return null;
        }
    }

    // Like notification
    async sendLikeNotification(userId, likerUsername, likerAvatar, videoId, videoTitle) {
        return await this.sendNotification(
            userId,
            'Yangi layk!',
            `${likerUsername} sizning videongizga layk bosdi`,
            {
                type: 'like',
                videoId: videoId.toString(),
                videoTitle,
                username: likerUsername,
                avatar: likerAvatar
            },
            'like'
        );
    }

    // Comment notification
    async sendCommentNotification(userId, commenterUsername, commenterAvatar, videoId, videoTitle, commentText) {
        return await this.sendNotification(
            userId,
            'Yangi izoh!',
            `${commenterUsername}: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
            {
                type: 'comment',
                videoId: videoId.toString(),
                videoTitle,
                username: commenterUsername,
                avatar: commenterAvatar,
                commentText
            },
            'comment'
        );
    }

    // Follow notification
    async sendFollowNotification(userId, followerUsername, followerAvatar) {
        return await this.sendNotification(
            userId,
            'Yangi kuzatuvchi!',
            `${followerUsername} sizni kuzatishni boshladi`,
            {
                type: 'follow',
                username: followerUsername,
                avatar: followerAvatar
            },
            'follow'
        );
    }

    // Message notification
    async sendMessageNotification(userId, senderUsername, senderAvatar, message, messageId) {
        return await this.sendNotification(
            userId,
            `${senderUsername} xabar yubordi`,
            message.length > 100 ? message.substring(0, 100) + '...' : message,
            {
                type: 'message',
                messageId: messageId.toString(),
                username: senderUsername,
                avatar: senderAvatar
            },
            'message'
        );
    }

    // Mention notification
    async sendMentionNotification(userId, mentionerUsername, mentionerAvatar, videoId, videoTitle) {
        return await this.sendNotification(
            userId,
            'Sizni tilga olishdi!',
            `${mentionerUsername} sizni videoda eslatdi`,
            {
                type: 'mention',
                videoId: videoId.toString(),
                videoTitle,
                username: mentionerUsername,
                avatar: mentionerAvatar
            },
            'mention'
        );
    }

    // Share notification
    async sendShareNotification(userId, sharerUsername, sharerAvatar, videoId, videoTitle) {
        return await this.sendNotification(
            userId,
            'Videongiz ulashildi!',
            `${sharerUsername} videongizni ulashdi`,
            {
                type: 'share',
                videoId: videoId.toString(),
                videoTitle,
                username: sharerUsername,
                avatar: sharerAvatar
            },
            'share'
        );
    }

    // Verified badge notification
    async sendVerifiedNotification(userId) {
        return await this.sendNotification(
            userId,
            'Tasdiqlandi! 🎉',
            'Akkauntingiz rasman tasdiqlandi! Endi ko\'k belgiga egasiz',
            { type: 'verified' },
            'verified'
        );
    }

    // Achievement notification
    async sendAchievementNotification(userId, achievementName, achievementIcon) {
        return await this.sendNotification(
            userId,
            'Yangi yutuq! 🏆',
            `Siz "${achievementName}" yutug'ini qo'lga kiritdingiz!`,
            {
                type: 'achievement',
                achievementName,
                achievementIcon
            },
            'achievement'
        );
    }

    // Live start notification (bulk)
    async sendLiveStartNotification(followerIds, channelName, channelAvatar, liveId) {
        const message = {
            notification: {
                title: 'Jonli efir boshlandi! 🔴',
                body: `${channelName} jonli efirga chiqdi. Hoziroq qo'shiling!`
            },
            data: {
                type: 'live',
                liveId: liveId.toString(),
                channelName,
                channelAvatar
            }
        };

        // Get all follower tokens
        const followers = await User.find({ _id: { $in: followerIds } });
        const allTokens = [];
        for (const follower of followers) {
            if (follower.deviceTokens) {
                allTokens.push(...follower.deviceTokens.map(t => t.token));
            }
        }

        if (allTokens.length === 0) return;

        // Send in batches of 500
        const batchSize = 500;
        for (let i = 0; i < allTokens.length; i += batchSize) {
            const batch = allTokens.slice(i, i + batchSize);
            const batchMessage = { ...message, tokens: batch };
            try {
                await messaging.sendEachForMulticast(batchMessage);
            } catch (error) {
                console.error('Bulk send error:', error);
            }
        }
    }

    // Gift notification
    async sendGiftNotification(userId, giverUsername, giverAvatar, giftType, giftAmount) {
        const giftIcons = {
            heart: '❤️',
            star: '⭐',
            clap: '👏',
            crown: '👑',
            diamond: '💎',
            rocket: '🚀',
            rainbow: '🌈'
        };
        
        return await this.sendNotification(
            userId,
            `${giftIcons[giftType] || '🎁'} Yangi sovg'a!`,
            `${giverUsername} sizga ${giftType} sovg'asini yubordi ($${giftAmount})`,
            {
                type: 'gift',
                giftType,
                giftAmount: giftAmount.toString(),
                username: giverUsername,
                avatar: giverAvatar
            },
            'gift'
        );
    }

    // Earning notification
    async sendEarningNotification(userId, amount, reason) {
        return await this.sendNotification(
            userId,
            '💰 Yangi daromad!',
            `Siz ${reason} uchun $${amount} ishlab topdingiz`,
            {
                type: 'earning',
                amount: amount.toString(),
                reason
            },
            'earning'
        );
    }

    // Subscription notification
    async sendSubscriptionNotification(userId, subscriberUsername, tier) {
        return await this.sendNotification(
            userId,
            '🎉 Yangi obuna!',
            `${subscriberUsername} sizning kanalingizga ${tier} obuna bo'ldi`,
            {
                type: 'subscription',
                tier,
                username: subscriberUsername
            },
            'subscription'
        );
    }

    // Report resolved notification
    async sendReportResolvedNotification(userId, targetType, resolution) {
        return await this.sendNotification(
            userId,
            'Shikoyatingiz ko\'rib chiqildi',
            `Sizning shikoyatingiz bo'yicha ${resolution === 'removed' ? 'kontent olib tashlandi' : 'hech qanday qoidabuzarlik topilmadi'}`,
            {
                type: 'report_resolved',
                targetType,
                resolution
            },
            'report_resolved'
        );
    }
}

module.exports = new PushNotificationService();
