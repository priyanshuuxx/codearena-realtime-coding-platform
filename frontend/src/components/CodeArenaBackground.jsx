import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const nodes = [
  { id: 'auth', x: 13, y: 26, size: 7 },
  { id: 'match', x: 31, y: 16, size: 5 },
  { id: 'queue', x: 55, y: 25, size: 8 },
  { id: 'judge', x: 78, y: 18, size: 6 },
  { id: 'socket', x: 88, y: 43, size: 5 },
  { id: 'editor', x: 68, y: 67, size: 7 },
  { id: 'battle', x: 43, y: 78, size: 6 },
  { id: 'rank', x: 19, y: 65, size: 5 },
  { id: 'api', x: 51, y: 49, size: 5 },
];

const connections = [
  ['auth', 'match'],
  ['match', 'queue'],
  ['queue', 'judge'],
  ['judge', 'socket'],
  ['socket', 'editor'],
  ['editor', 'battle'],
  ['battle', 'rank'],
  ['rank', 'auth'],
  ['queue', 'api'],
  ['api', 'battle'],
  ['api', 'editor'],
];

const systemLogs = [
  { text: '> connecting to CodeArena...', x: '7%', y: '18%' },
  { text: '> matchmaking service online', x: '65%', y: '34%' },
  { text: '> code execution ready_', x: '10%', y: '82%' },
  { text: '> socket room synchronized', x: '62%', y: '76%' },
];

function getNode(id) {
  return nodes.find((node) => node.id === id);
}

function CodeArenaBackground() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || reduceMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.to('.system-glow', {
        xPercent: 8,
        yPercent: -6,
        scale: 1.08,
        duration: 14,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.system-node', {
        scale: 1.35,
        opacity: 0.9,
        transformOrigin: 'center',
        duration: 2.8,
        ease: 'power2.inOut',
        stagger: 0.22,
        yoyo: true,
        repeat: -1,
      });

      gsap.to('.connection-flow', {
        strokeDashoffset: -90,
        duration: 5.8,
        ease: 'power3.inOut',
        stagger: 0.28,
        repeat: -1,
      });

      gsap.to('.system-log', {
        opacity: 0.18,
        y: -4,
        duration: 4.5,
        ease: 'power2.inOut',
        stagger: 0.8,
        yoyo: true,
        repeat: -1,
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div ref={rootRef} className="codearena-system-bg" aria-hidden="true">
      <div className="system-grid" />
      <div className="system-glow" />

      <svg className="system-map" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {connections.map(([fromId, toId], index) => {
          const from = getNode(fromId);
          const to = getNode(toId);
          const pathId = `path-${fromId}-${toId}`;

          return (
            <g key={`${fromId}-${toId}`}>
              <line className="connection-base" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              <line className="connection-flow" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
              <path id={pathId} d={`M ${from.x} ${from.y} L ${to.x} ${to.y}`} fill="none" opacity="0" />
              <circle className="system-particle" r="0.34">
                <animateMotion dur="8s" repeatCount="indefinite" begin={`${index * 0.4}s`}>
                  <mpath href={`#${pathId}`} />
                </animateMotion>
              </circle>
            </g>
          );
        })}

        {nodes.map((node) => (
          <g key={node.id}>
            <circle className="system-node-halo" cx={node.x} cy={node.y} r={node.size * 0.7} />
            <circle className="system-node" cx={node.x} cy={node.y} r={node.size * 0.18} />
          </g>
        ))}
      </svg>

      <div className="system-logs">
        {systemLogs.map((log) => (
          <span key={log.text} className="system-log" style={{ left: log.x, top: log.y }}>
            {log.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CodeArenaBackground;
