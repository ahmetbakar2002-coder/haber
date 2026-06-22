export async function generateTimelineEvent(title: string) {
  const text = title.toLowerCase();

  if (
    text.includes("transfer") ||
    text.includes("görüşme") ||
    text.includes("imza")
  ) {
    return {
      topic: "Transfer Haberleri",
      description: title,
    };
  }

  return null;
}