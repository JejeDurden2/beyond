export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}
