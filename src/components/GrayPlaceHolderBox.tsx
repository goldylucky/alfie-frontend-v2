export function GrayPlaceHolderBox({ content }: { content?: string }) {
  return (
    <div className="bg-gray-100 rounded-xl border flex justify-center items-center h-80">
      <h2 className="text-lg">{content}</h2>
    </div>
  );
}