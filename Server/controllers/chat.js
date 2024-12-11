async function createChatWithWelcomeMessage(matchId) {
    // Récupérer les détails du match
    const match = await prisma.match.findUnique({
      where: { match_id: matchId },
      include: {
        user_1: true,
        user_2: true,
      },
    });
  
    if (!match || match.status !== 'accepted') {
      throw new Error("Match not found or not accepted.");
    }
  
    // Créer un chat
    const chat = await prisma.chat.create({
      data: {
        is_group: false,
        chat_members: {
          create: [
            { user_id: match.user_id_1 },
            { user_id: match.user_id_2 },
          ],
        },
      },
    });
  
    await prisma.message.create({
      data: {
        chat_id: chat.chat_id,
        sender_id: null, 
        content: "You can now start your discussion!",
        message_type: "text", 
      },
    });
  
    return chat;
  }
  