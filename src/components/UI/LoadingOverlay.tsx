interface LoadingOverlayProps {
  message: string;
  visible: boolean;
}

export function LoadingOverlay({ message, visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <h3 className="text-white font-bold text-lg mb-2">Creating Your Cat's Legend</h3>
        <p className="text-white/80 text-sm mb-4">{message}</p>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse"
            style={{ width: '60%' }}
          ></div>
        </div>
        <p className="text-white/60 text-xs mt-4">This usually takes 20-30 seconds</p>
      </div>
    </div>
  );
}