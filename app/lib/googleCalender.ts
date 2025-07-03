import { TimeBlock } from "@/app/types"; 

export async function createGoogleEvent(block: TimeBlock, accessToken: string) {
  const start = new Date();
  start.setHours(block.startHour, block.startMinute);

  const end = new Date();
  end.setHours(block.endHour, block.endMinute);

  const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: block.title,
      description: `VAsA Planner - ${block.type}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create Google event: ${text}`);
  }

  return res.json();
}
