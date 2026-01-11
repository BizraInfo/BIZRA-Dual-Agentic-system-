"use client"

export function SacredGeometry() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Golden Spiral */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 opacity-5">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-spin" style={{ animationDuration: "60s" }}>
          <path
            d="M100,100 Q150,100 150,50 Q150,0 100,0 Q50,0 50,50 Q50,100 100,100 Q200,100 200,0 Q200,-100 100,-100 Q0,-100 0,0 Q0,100 100,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
          />
        </svg>
      </div>

      {/* Flower of Life Pattern */}
      <div className="absolute top-3/4 right-1/4 w-48 h-48 opacity-5">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {Array.from({ length: 7 }, (_, i) => {
            const angle = (i * 60 * Math.PI) / 180
            const x = 100 + 30 * Math.cos(angle)
            const y = 100 + 30 * Math.sin(angle)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-accent"
              />
            )
          })}
          <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent" />
        </svg>
      </div>

      {/* Metatron's Cube */}
      <div className="absolute bottom-1/4 left-1/3 w-56 h-56 opacity-5">
        <svg viewBox="0 0 200 200" className="w-full h-full animate-pulse" style={{ animationDuration: "8s" }}>
          {/* Outer hexagon */}
          <polygon
            points="100,20 170,60 170,140 100,180 30,140 30,60"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary"
          />
          {/* Inner connections */}
          <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          <line x1="30" y1="60" x2="170" y2="140" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          <line x1="30" y1="140" x2="170" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
        </svg>
      </div>
    </div>
  )
}
