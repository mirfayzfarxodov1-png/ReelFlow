const { messaging } = require('./firebase');

class PushNotificationService {
    async sendNotification(token, title, body, data = {}) {
        if (!token) return;

        const message = {
            notification: { title, body },
            data: data,
            token: token
        };

        try {
            const response = await messaging.send(message);
            console.log('Notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    }

    async sendLikeNotification(userToken, likerUsername, videoId) {
        await this.sendNotification(
            userToken,
            'Yangi layk!',
            `${likerUsername} sizning videongizga layk bosdi`,
            { type: 'like', videoId: videoId.toString() }
        );
    }

    async sendCommentNotification(userToken, commenterUsername, videoId) {
        await this.sendNotification(
            userToken,
            'Yangi izoh!',
            `${commenterUsername} videongizga izoh qoldirdi`,
            { type: 'comment', videoId: videoId.toString() }
        );
    }

    async sendFollowNotification(userToken, followerUsername) {
        await this.sendNotification(
            userToken,
            'Yangi kuzatuvchi!',
            `${followerUsername} sizni kuzatishni boshladi`,
            { type: 'follow' }
        );
    }

    async sendMessageNotification(userToken, senderUsername, message) {
        await this.sendNotification(
            userToken,
            `${senderUsername} xabar yubordi`,
            message.substring(0, 50),
            { type: 'message' }
        );
    }

    async sendVerifiedNotification(userToken) {
        await this.sendNotification(
            userToken,
            'Tasdiqlandi!',
            'Akkauntingiz tasdiqlandi. Endi ko\'k belgiga egasiz!',
            { type: 'verified' }
        );
    }

    async sendAchievementNotification(userToken, achievementName) {
        await this.sendNotification(
            userToken,
            'Yangi yutuq!',
            `Siz "${achievementName}" yutug'ini qo'lga kiritdingiz!`,
            { type: 'achievement' }
        );
    }

    async sendLiveStartNotification(followerTokens, channelName) {
        const message = {
            notification: {
                title: 'Jonli efir boshlandi!',
                body: `${channelName} jonli efirga chiqdi`
            },
            tokens: followerTokens,
            data: { type: 'live' }
        };

        try {
            const response = await messaging.sendMulticast(message);
            console.log(`${response.successCount} notifications sent`);
            return response;
        } catch (error) {
            console.error('Error sending bulk notification:', error);
        }
    }
}

module.exports = new PushNotificationService();
