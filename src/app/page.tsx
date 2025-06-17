'use client';
import React, { useState } from "react";

// Bonsai part type
type BonsaiPart = {
  id: number;
  x: number;
  y: number;
  isBad: boolean;
  isCut: boolean;
};

const INITIAL_PARTS: BonsaiPart[] = [
  { id: 1, x: 180, y: 100, isBad: false, isCut: false },
  { id: 2, x: 110, y: 160, isBad: false, isCut: false },
  { id: 3, x: 250, y: 160, isBad: false, isCut: false },
  { id: 4, x: 80, y: 230, isBad: false, isCut: false },
  { id: 5, x: 280, y: 230, isBad: false, isCut: false },
];

function getRandomLeafPosition(existing: BonsaiPart[]): { x: number; y: number } {
  let x: number = 0, y: number = 0, tries = 0;
  do {
    x = 80 + Math.random() * 200;
    y = 80 + Math.random() * 220;
    tries++;
  } while (
    existing.some(p => Math.abs(p.x - x) < 50 && Math.abs(p.y - y) < 50) && tries < 20
  );
  return { x, y };
}

export default function Home() {
  const [parts, setParts] = useState<BonsaiPart[]>(INITIAL_PARTS);
  const [time, setTime] = useState(0);
  const [win, setWin] = useState(false);
  const [lose, setLose] = useState(false);

  // Game configuration state
  const [healthyInterval, setHealthyInterval] = useState(1); // seconds for new healthy leaf (changed default to 1)
  const [badInterval, setBadInterval] = useState(2); // seconds for new bad leaf
  const [winCount, setWinCount] = useState(30); // healthy leaves to win
  const [loseCount, setLoseCount] = useState(10); // bad leaves to lose

  // Time passes every second
  React.useEffect(() => {
    if (win || lose) return;
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [win, lose]);

  // Track how long each bad leaf has been bad
  const [, setBadTimers] = useState<{ [id: number]: number }>({});

  // Update badTimers every second
  React.useEffect(() => {
    if (win || lose) return;
    setBadTimers((prev) => {
      const updated: { [id: number]: number } = {};
      parts.forEach((p) => {
        if (p.isBad && !p.isCut) {
          updated[p.id] = (prev[p.id] || 0) + 1;
        }
      });
      return updated;
    });
  }, [time, parts, win, lose]);

  // Lose condition: loseCount or more red leaves
  React.useEffect(() => {
    const redLeaves = parts.filter(p => p.isBad && !p.isCut).length;
    if (redLeaves >= loseCount && !lose) {
      setLose(true);
    }
  }, [parts, lose, loseCount]);

  // Win condition: winCount healthy leaves and 0 red leaves
  React.useEffect(() => {
    const greenLeaves = parts.filter(p => !p.isBad && !p.isCut).length;
    const redLeaves = parts.filter(p => p.isBad && !p.isCut).length;
    if (greenLeaves >= winCount && redLeaves === 0 && !win) {
      setWin(true);
    }
  }, [parts, win, winCount]);

  // Cut a bad part
  const handleCut = (id: number) => {
    setParts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, isCut: true, isBad: false } : p
      )
    );
  };

  const handleReset = () => {
    setParts(INITIAL_PARTS);
    setTime(0);
    setWin(false);
    setLose(false);
    setBadTimers({});
  };

  // Add a new healthy leaf every healthyInterval seconds
  React.useEffect(() => {
    if (win || lose) return;
    if (time > 0 && time % healthyInterval === 0) {
      setParts((prev) => {
        const nextId = prev.length ? Math.max(...prev.map(p => p.id)) + 1 : 1;
        const { x, y } = getRandomLeafPosition(prev);
        return [
          ...prev,
          { id: nextId, x, y, isBad: false, isCut: false },
        ];
      });
    }
  }, [time, win, lose, healthyInterval]);

  // Turn a healthy leaf bad every badInterval seconds
  React.useEffect(() => {
    if (win || lose) return;
    if (time > 0 && time % badInterval === 0) {
      setParts((prev) => {
        const healthy = prev.filter((p) => !p.isBad && !p.isCut);
        if (healthy.length === 0) return prev;
        const idx = Math.floor(Math.random() * healthy.length);
        const badId = healthy[idx].id;
        return prev.map((p) =>
          p.id === badId ? { ...p, isBad: true } : p
        );
      });
    }
  }, [time, win, lose, badInterval]);

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-b from-green-100 to-green-300">
      <h1 className="text-3xl font-bold mb-4 text-green-900 drop-shadow">Bonsai Cutting Game</h1>
      {win && (
        <div className="mb-4 p-4 bg-green-200 text-green-900 rounded shadow text-xl font-semibold">
          🎉 You win! Your bonsai has {winCount} healthy leaves and 0 bad leaves!
        </div>
      )}
      {lose && (
        <div className="mb-4 p-4 bg-red-200 text-red-900 rounded shadow text-xl font-semibold">
          ❌ You lose! Your bonsai has {loseCount} or more bad leaves.
        </div>
      )}
      <p className="mb-2 text-green-800">Time: {time}s</p>
      <p className="mb-2 text-green-800">Healthy leaves: {parts.filter(p => !p.isBad && !p.isCut).length} | Bad leaves: {parts.filter(p => p.isBad && !p.isCut).length}</p>
      <svg width="100%" height={420} className="mb-6 max-w-[400px]" viewBox="0 0 360 420" preserveAspectRatio="xMidYMax meet">
        {/* Pot */}
        <ellipse cx={180} cy={390} rx={80} ry={24} fill="#b45309" stroke="#78350f" strokeWidth={4} />
        <ellipse cx={180} cy={384} rx={72} ry={14} fill="#fde68a" />
        {/* Trunk - curved path */}
        <path d="M180 384 Q170 260 200 180 Q220 120 180 100" stroke="#8B5C2A" strokeWidth={22} fill="none" strokeLinecap="round" />
        {/* Branches */}
        <path d="M180 240 Q120 180 110 160" stroke="#8B5C2A" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d="M185 200 Q240 150 250 160" stroke="#8B5C2A" strokeWidth={9} fill="none" strokeLinecap="round" />
        <path d="M200 300 Q100 270 100 270" stroke="#8B5C2A" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M200 300 Q260 270 260 270" stroke="#8B5C2A" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* Leaf clusters (parts) */}
        {/* First render all healthy leaves, then all red leaves so reds are on top */}
        {parts.filter(part => !part.isCut && !part.isBad).map((part) => {
          // Draw each leaf as a large, detailed, pointed SVG path
          const leafWidth = 48;
          const leafHeight = 80;
          const cx = part.x;
          const cy = part.y;
          // SVG path for a large, pointed, curved leaf
          const leafPath = `M${cx},${cy} ` +
            `C${cx - leafWidth / 2},${cy - leafHeight / 2} ${cx - leafWidth / 3},${cy - leafHeight} ${cx},${cy - leafHeight} ` +
            `C${cx + leafWidth / 3},${cy - leafHeight} ${cx + leafWidth / 2},${cy - leafHeight / 2} ${cx},${cy}`;
          // Vein path
          const veinPath = `M${cx},${cy} Q${cx},${cy - leafHeight / 2} ${cx},${cy - leafHeight}`;
          return (
            <g key={part.id}>
              <path
                d={leafPath}
                fill={"url(#leafGradient)"}
                stroke="#14532d"
                strokeWidth={2}
                style={{ opacity: 1, filter: 'drop-shadow(0 0 6px #22c55e)' }}
              />
              <path
                d={veinPath}
                stroke="#bbf7d0"
                strokeWidth={1.5}
                fill="none"
                opacity={0.7}
              />
            </g>
          );
        })}
        {parts.filter(part => !part.isCut && part.isBad).map((part) => {
          // Draw each leaf as a large, detailed, pointed SVG path
          const leafWidth = 48;
          const leafHeight = 80;
          const cx = part.x;
          const cy = part.y;
          // SVG path for a large, pointed, curved leaf
          const leafPath = `M${cx},${cy} ` +
            `C${cx - leafWidth / 2},${cy - leafHeight / 2} ${cx - leafWidth / 3},${cy - leafHeight} ${cx},${cy - leafHeight} ` +
            `C${cx + leafWidth / 3},${cy - leafHeight} ${cx + leafWidth / 2},${cy - leafHeight / 2} ${cx},${cy}`;
          return (
            <g key={part.id}>
              <path
                d={leafPath}
                fill="#dc2626"
                stroke="#14532d"
                strokeWidth={4}
                style={{ cursor: "pointer", opacity: 0.8, filter: 'drop-shadow(0 0 8px #dc2626)' }}
                onClick={() => handleCut(part.id)}
              />
            </g>
          );
        })}
        {/* Leaf gradient */}
        <defs>
          <linearGradient id="leafGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
        </defs>
      </svg>
      <p className="mb-2 text-green-900">Click red (bad) parts to cut them!</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
        onClick={handleReset}
      >
        Reset Bonsai
      </button>
      <form className="mb-4 flex flex-wrap gap-4 items-end bg-white/80 p-4 rounded shadow max-w-xl" onSubmit={e => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-green-900">Seconds for Healthy Leaf</label>
          <input type="number" min={1} step={1} value={healthyInterval} onChange={e => setHealthyInterval(Number(e.target.value) || 1)} className="border rounded px-2 py-1 w-24 text-green-700" />
          <span className="text-xs text-gray-500 ml-2">(default: 1)</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">Seconds for Bad Leaf</label>
          <input type="number" min={1} step={1} value={badInterval} onChange={e => setBadInterval(Number(e.target.value) || 1)} className="border rounded px-2 py-1 w-24 text-green-700" />
          <span className="text-xs text-gray-500 ml-2">(default: 2)</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">Healthy Leaves to Win</label>
          <input type="number" min={1} step={1} value={winCount} onChange={e => setWinCount(Number(e.target.value) || 1)} className="border rounded px-2 py-1 w-24 text-green-700" />
          <span className="text-xs text-gray-500 ml-2">(default: 30)</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-green-900">Bad Leaves to Lose</label>
          <input type="number" min={1} step={1} value={loseCount} onChange={e => setLoseCount(Number(e.target.value) || 1)} className="border rounded px-2 py-1 w-24 text-green-700" />
          <span className="text-xs text-gray-500 ml-2">(default: 10)</span>
        </div>
      </form>
    </div>
  );
}
