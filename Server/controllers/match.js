const prisma = require('../prisma');
const { getUserSports } = require("./user");
const { createChatWithWelcomeMessage } = require("./chat");

// Trouver les matches potentiels
const findMatches = async (userId) => {
    const userIdInt = parseInt(userId, 10);
    const userSports = await getUserSports(userIdInt);
    const sportIds = userSports.map(userSport => userSport.sport_id);

    const potentialMatches = await prisma.userSport.findMany({
        where: {
            sport_id: {
                in: sportIds,
            },
            user_id: {
                not: userIdInt,
            },
        },
        include: {
            user: true,
        },
    });

    const matchedUsers = potentialMatches.map(userSport => userSport.user);
    return [...new Set(matchedUsers)];
};

// Créer une demande de match
const createMatch = async (req, res) => {
    try {
        const { user_id_1, user_id_2 } = req.body;

        // Vérifier si un match existe déjà entre ces utilisateurs
        const existingMatch = await prisma.match.findFirst({
            where: {
                OR: [
                    { 
                        user_id_1: user_id_1, 
                        user_id_2: user_id_2 
                    },
                    { 
                        user_id_1: user_id_2, 
                        user_id_2: user_id_1 
                    }
                ]
            }
        });

        if (existingMatch) {
            return res.status(400).json({ 
                error: "A match already exists between these users" 
            });
        }

        // Créer un nouveau match avec le statut 'PENDING'
        const newMatch = await prisma.match.create({
            data: {
                user_id_1: user_id_1,
                user_id_2: user_id_2,
                status: 'PENDING'
            }
        });

        res.status(201).json(newMatch);
    } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Accepter un match
const acceptMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const matchIdInt = parseInt(matchId, 10);

        // Mettre à jour le statut du match à "ACCEPTED"
        const updatedMatch = await prisma.match.update({
            where: { match_id: matchIdInt },
            data: { status: 'ACCEPTED' }
        });

        // Créer un chat pour les utilisateurs matchés
        const newChat = await createChatWithWelcomeMessage(matchIdInt);

        res.status(200).json({ 
            message: 'Match accepted and chat created successfully.',
            match: updatedMatch,
            chat: newChat
        });
    } catch (error) {
        console.error("Error accepting match:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Rejeter un match
const rejectMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const matchIdInt = parseInt(matchId, 10);

        // Mettre à jour le statut du match à "REJECTED"
        const updatedMatch = await prisma.match.update({
            where: { match_id: matchIdInt },
            data: { status: 'REJECTED' }
        });

        res.status(200).json({ 
            message: 'Match rejected successfully.',
            match: updatedMatch
        });
    } catch (error) {
        console.error("Error rejecting match:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Obtenir tous les matches d'un utilisateur
const getUserMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId, 10);

        const matches = await prisma.match.findMany({
            where: {
                OR: [
                    { user_id_1: userIdInt },
                    { user_id_2: userIdInt }
                ]
            },
            include: {
                user_1: true,
                user_2: true
            }
        });

        res.json(matches);
    } catch (error) {
        console.error("Error fetching user matches:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Obtenir les matches en attente d'un utilisateur
const getPendingMatches = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdInt = parseInt(userId, 10);

        const pendingMatches = await prisma.match.findMany({
            where: {
                OR: [
                    { user_id_1: userIdInt },
                    { user_id_2: userIdInt }
                ],
                status: 'PENDING'
            },
            include: {
                user_1: true,
                user_2: true
            }
        });

        res.json(pendingMatches);
    } catch (error) {
        console.error("Error fetching pending matches:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    findMatches,
    createMatch,
    acceptMatch,
    rejectMatch,
    getUserMatches,
    getPendingMatches
};
