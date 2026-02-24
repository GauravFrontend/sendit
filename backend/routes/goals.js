import express from 'express';
import Goal from '../models/Goal.js';
import User from '../models/User.js';

const router = express.Router();

// GET all goals for a user
// Query param: ?userId=...
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "UserId required" });

        const goals = await Goal.find({ userId });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE a new goal
router.post('/', async (req, res) => {
    try {
        const { userId, title, type, startDate, endDate } = req.body;

        // Basic validation
        if (!userId || !title) {
            return res.status(400).json({ error: "UserId and Title are required" });
        }

        const effectiveStartDate = startDate || new Date().toISOString().split('T')[0];

        const newGoal = new Goal({
            userId,
            title,
            type: type || 'one-time',
            startDate: effectiveStartDate,
            endDate: endDate || null,
            createdAt: effectiveStartDate, // Use start date as the 'creation'/'effective' date
            completedDates: []
        });

        const savedGoal = await newGoal.save();
        res.status(201).json(savedGoal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TOGGLE goal completion for a specific date
// PATCH /:goalId/toggle
// Body: { date: "YYYY-MM-DD" }
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.body; // Date string to toggle

        if (!date) return res.status(400).json({ error: "Date is required" });

        const goal = await Goal.findById(id);
        if (!goal) return res.status(404).json({ error: "Goal not found" });

        const index = goal.completedDates.indexOf(date);
        if (index === -1) {
            // Not completed yet -> Mark as done
            goal.completedDates.push(date);
        } else {
            // Already completed -> Unmark
            goal.completedDates.splice(index, 1);
        }
        await goal.save();

        // -- Daily Reward Logic --
        // Check if ALL tasks for this 'date' are complete
        // Only run this check if we just COMPLETED a task (added date)
        let newGemCount = null;
        if (index === -1) {
            const user = await User.findById(goal.userId);

            // If reward not already claimed for this date
            if (user.lastDailyReward !== date) {
                // Grant reward immediately on FIRST completion
                user.gems += 10;
                user.lastDailyReward = date;
                await user.save();
                newGemCount = user.gems;
            }
        }

        res.json({ goal, gems: newGemCount }); // Return new gem count if updated
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CATCH UP: Mark a past goal as done (Costs 20 Gems)
router.post('/:id/catchup', async (req, res) => {
    try {
        const { date, userId } = req.body; // Date to mark as done

        const user = await User.findById(userId);
        if (user.gems < 20) {
            return res.status(400).json({ error: "Not enough gems! Need 20." });
        }

        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ error: "Goal not found" });

        // Add date if not exists
        if (!goal.completedDates.includes(date)) {
            goal.completedDates.push(date);
            await goal.save();

            // Deduct gems
            user.gems -= 20;
            await user.save();
        }

        res.json({ goal, gems: user.gems });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a goal
router.delete('/:id', async (req, res) => {
    try {
        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
