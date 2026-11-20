export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  const padMins = String(mins).padStart(2, '0');
  const padSecs = String(secs).padStart(2, '0');
  const padMs = String(ms).padStart(2, '0');
  return `${padMins}:${padSecs}.${padMs}`;
}

export function formatResolution(width: number, height: number): string {
  if (!width || !height) return 'Unknown';
  return `${width} × ${height}`;
}

export function getAspectRatioLabel(width: number, height: number): string {
  if (!width || !height) return 'Custom';
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  const ratioW = width / divisor;
  const ratioH = height / divisor;

  // Check common approximations
  const ratio = width / height;
  if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16 (Vertical)';
  if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9 (Landscape)';
  if (Math.abs(ratio - 1) < 0.05) return '1:1 (Square)';
  if (Math.abs(ratio - 4 / 5) < 0.05) return '4:5 (Portrait)';

  return `${ratioW}:${ratioH}`;
}
