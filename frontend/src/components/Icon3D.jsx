// 📁 frontend/src/components/Icon3D.jsx
import { useState } from 'react';

// Renders a glossy 3D emoji icon (Microsoft Fluent Emoji 3D — MIT licensed,
// hotlinked via jsDelivr) with a soft color-matched glow behind it.
// Falls back to the given lucide icon if the asset fails to load, so the
// page never shows a broken image regardless of source reliability.
export default function Icon3D({ src, fallback: Fallback, alt = '', tone = 'blue', size = 44 }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`icon-3d icon-3d-${tone}`} style={{ width: size + 24, height: size + 24 }}>
      <span className="icon-3d-glow" aria-hidden="true" />
      {failed ? (
        <Fallback size={size * 0.5} strokeWidth={1.7} className="icon-3d-fallback" />
      ) : (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          onError={() => setFailed(true)}
          draggable="false"
        />
      )}
    </span>
  );
}