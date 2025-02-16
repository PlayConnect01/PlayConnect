const prisma = require('../prisma');

// Get all notifications for a user
const getUserNotifications = async (userId) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        user_id: parseInt(userId),
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            profile_picture: true,
            location: true,
          },
        },
        match: {
          include: {
            user_1: {
              select: {
                user_id: true,
                username: true,
                profile_picture: true,
                location: true,
                sports: {
                  include: {
                    sport: true
                  }
                }
              }
            },
            user_2: {
              select: {
                user_id: true,
                username: true,
                profile_picture: true,
                location: true,
                sports: {
                  include: {
                    sport: true
                  }
                }
              }
            },
            sport: true
          }
        }
      },
    });

    // Transform notifications to include sender information
    const transformedNotifications = await Promise.all(notifications.map(async (notification) => {
      if (notification.type === 'MATCH_REQUEST') {
        const matchId = parseInt(notification.action_url);
        if (matchId) {
          const match = await prisma.match.findUnique({
            where: { match_id: matchId },
            include: {
              user_1: {
                select: {
                  user_id: true,
                  username: true,
                  profile_picture: true,
                  location: true,
                },
              },
              user_2: {
                select: {
                  user_id: true,
                  username: true,
                  profile_picture: true,
                  location: true,
                },
              },
            },
          });

          if (match) {
            const sender = match.user_1.user_id === parseInt(userId) 
              ? match.user_2 
              : match.user_1;

            return {
              ...notification,
              senderName: sender.username,
              senderImage: sender.profile_picture,
              senderLocation: sender.location,
              match_id: match.match_id,
            };
          }
        }
      }
      return notification;
    }));

    return transformedNotifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get unread notifications count
const getUnreadCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        user_id: parseInt(userId),
        is_read: false,
      },
    });
    return count;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        notification_id: parseInt(notificationId),
      },
      data: {
        is_read: true,
      },
    });
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
  try {
    await prisma.notification.updateMany({
      where: {
        user_id: parseInt(userId),
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
const deleteNotification = async (notificationId) => {
  try {
    await prisma.notification.delete({
      where: {
        notification_id: notificationId,
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
