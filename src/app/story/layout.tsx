export default function StoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Story page has its own full-screen layout
  return <>{children}</>;
}
