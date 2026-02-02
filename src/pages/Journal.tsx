import { useGame } from "@/context/GameContext";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { XPEventCard } from "@/components/game/XPEventCard";

export default function Journal() {
  const { state } = useGame();

  // Sort events by timestamp, newest first
  const sortedEvents = [...state.xpEvents].sort((a, b) => b.ts - a.ts);

  // Group by date
  const eventsByDate: Record<string, typeof sortedEvents> = {};
  for (const event of sortedEvents) {
    const date = new Date(event.ts).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  }

  return (
    <PageWrapper
      title="Campaign Journal"
      subtitle="A record of all your adventures"
    >
      {sortedEvents.length === 0 ? (
        <div className="parchment-panel p-8 text-center">
          <span className="text-4xl block mb-2">📖</span>
          <p className="text-lg text-muted-foreground">
            The journal is empty...
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete quests and earn XP to fill these pages!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByDate).map(([date, events]) => (
            <div key={date}>
              <h2 className="font-fantasy text-xl mb-4 flex items-center gap-2">
                <span>📅</span>
                {date}
              </h2>
              <div className="space-y-2">
                {events.map((event) => (
                  <XPEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
