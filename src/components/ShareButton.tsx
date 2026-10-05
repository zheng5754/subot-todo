interface Props {
  onShare: () => void;
  connected: boolean;
}

export function ShareButton({ onShare, connected }: Props) {
  return (
    <button className="share-btn" onClick={onShare} disabled={!connected}>
      {connected ? '🔗 分享链接' : '连接中...'}
    </button>
  );
}
