// import prisma from '../prisma';

// // Fonction qui gère le match accepté et crée le chat avec le message d'accueil automatique
// export async function handleMatchAccepted(matchId) {
//   // Récupérer les utilisateurs impliqués dans le match accepté
//   const match = await prisma.match.findUnique({
//     where: { match_id: matchId },
//     include: {
//       user_1: true,
//       user_2: true,
//     },
//   });

//   if (!match || match.status !== 'ACCEPTED') {
//     throw new Error('Match non trouvé ou non accepté');
//   }

//   // Créer un chat entre les deux utilisateurs
//   const chat = await prisma.chat.create({
//     data: {
//       is_group: false, // Ce n'est pas un groupe
//       call_type: 'NONE', // Aucun appel pour le moment
//       call_status: null,
//       call_initiator_id: null,
//       call_start_time: null,
//       call_end_time: null,
//       call_duration: null,
//     },
//   });

//   // Ajouter les deux utilisateurs au chat
//   await prisma.chatMember.createMany({
//     data: [
//       { chat_id: chat.chat_id, user_id: match.user_id_1 },
//       { chat_id: chat.chat_id, user_id: match.user_id_2 },
//     ],
//   });

//   // Ajouter un message d'accueil automatique dans le chat
//   await prisma.message.create({
//     data: {
//       chat_id: chat.chat_id,
//       sender_id: null, // Aucun utilisateur n'envoie ce message
//       content: 'You can now start your discussion!',
//       message_type: 'TEXT', // Type de message texte
//     },
//   });
// } 