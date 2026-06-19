interface StatusBarProps {
  status: { message: string; type: 'success' | 'error' | 'info' } | null;
}

export default function StatusBar({ status }: StatusBarProps) {
  if (!status) return null;

  const bgColor = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  }[status.type];

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgColor} text-white py-2 px-4 shadow-lg z-50`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <span className="text-xs font-medium">{status.message}</span>
        <span className="text-xs opacity-75">Press any key to dismiss</span>
      </div>
    </div>
  );
}
