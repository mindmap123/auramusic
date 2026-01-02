const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const style = await prisma.musicStyle.findFirst();
        if (!style) {
            console.log("No styles found, creating one...");
            return;
        }

        console.log("Creating test schedule...");
        const newSched = await prisma.storeSchedule.create({
            data: {
                styleId: style.id,
                startTime: "10:00",
                endTime: "11:00",
                storeId: null
            }
        });
        console.log("Created:", newSched);

        console.log("Testing reachability...");
        const schedules = await prisma.storeSchedule.findMany({
            include: { style: true, store: true }
        });
        console.log("Found:", schedules.length);

        // Cleanup
        await prisma.storeSchedule.delete({ where: { id: newSched.id } });
        console.log("Cleanup done.");

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
