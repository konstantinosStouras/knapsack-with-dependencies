import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

const NUM_ITEMS = 6;
const VECTOR_DIM = 5;

const randomVector = (baseVector = null, noise = 2) => {
  if (!baseVector) return Array.from({ length: VECTOR_DIM }, () => Math.random() * 10);
  return baseVector.map(v => Math.max(0, Math.min(10, v + (Math.random() * noise * 2 - noise))));
};

const cosineSimilarity = (a, b) => {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB);
};

const averageSimilarity = (items) => {
  let sum = 0, count = 0;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      sum += cosineSimilarity(items[i].attributes, items[j].attributes);
      count++;
    }
  }
  return count > 0 ? sum / count : 0;
};

const getAllSubsets = (items) => {
  const subsets = [];
  const n = items.length;
  for (let i = 1; i < 1 << n; i++) {
    const subset = [];
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) subset.push(items[j]);
    }
    subsets.push(subset);
  }
  return subsets;
};

const generateItemsAndThreshold = () => {
  const baseVector = randomVector();
  const shuffledIndices = [...Array(NUM_ITEMS).keys()].sort(() => 0.5 - Math.random());
  const similarIndices = new Set(shuffledIndices.slice(0, 3));
  const items = Array.from({ length: NUM_ITEMS }, (_, i) => {
    const isSimilar = similarIndices.has(i);
    const vector = isSimilar
      ? randomVector(baseVector, 1)
      : randomVector(randomVector(), 5);
    return {
      id: `project-${i}`,
      name: `Project ${i + 1}`,
      value: Math.floor(Math.random() * 100),
      attributes: isSimilar && i === Math.min(...similarIndices) ? baseVector : vector,
    };
  });

//Make sure that for each round the Target Portfolio Compatibility Score is always a random number between [0.88, 0.98]. 
// This makes the optimal subset to have fewer items and always between 2-5 items (as opposed to all of them being the optimal)
  const threshold = parseFloat((Math.random() * 0.1 + 0.88).toFixed(4));
  const subsets = getAllSubsets(items).filter(sub =>
    sub.length >= 2 && sub.length <= 5 && averageSimilarity(sub) >= threshold
  );

  let best = { value: 0, subset: [] };
  for (const subset of subsets) {
    const value = subset.reduce((sum, project) => sum + project.value, 0);
    if (value > best.value) {
      best = { value, subset };
    }
  }

  return { items, similarityThreshold: threshold, optimalSubset: best };
};

const findOptimalSubset = (items, threshold) => {
  const subsets = getAllSubsets(items);
  let best = { value: 0, subset: [] };
  for (const subset of subsets) {
    const sim = averageSimilarity(subset);
    const value = subset.reduce((sum, project) => sum + project.value, 0);
    if (sim >= threshold && value > best.value) {
      best = { value, subset };
    }
  }
  return best;
};

export default function CosineKnapsackGame() {
  const [{ items, similarityThreshold }, setRoundData] = useState(generateItemsAndThreshold);
  const [round, setRound] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [optimalIds, setOptimalIds] = useState([]);
  const [optimalStats, setOptimalStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [quit, setQuit] = useState(false);
  const [strategyLog, setStrategyLog] = useState([]);
  //const [fullGameLog, setFullGameLog] = useState([]); // Required for full session tracking


  const selectedItems = items.filter((project) => selectedIds.includes(project.id));
  const totalValue = selectedItems.reduce((sum, project) => sum + project.value, 0);
  const similarity = averageSimilarity(selectedItems);
  const success = similarity >= similarityThreshold;

  const toggleItem = (id) => {
  setSelectedIds((prev) => {
    const isAlreadySelected = prev.includes(id);
    const updated = isAlreadySelected ? prev.filter((x) => x !== id) : [...prev, id];
    const project = items.find(it => it.id === id);
    setStrategyLog(log => [...log, `${project.name} ${isAlreadySelected ? 'removed' : 'added'}`]);
    return updated;
  });
};


const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  const match = ua.match(/(Chrome|Firefox|Safari|Edg|OPR|Trident)\/(\d+\.\d+)/);
  return match ? `${match[1]} ${match[2]}` : "Unknown Browser";
};

const getDeviceType = () => {
  if (typeof navigator.userAgentData !== "undefined") {
    return navigator.userAgentData.mobile ? "Mobile" : "Desktop";
  }
  return /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
};

// This function takes a UTC date and formats it nicely in UK timezone

const formatDateToUKTime = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(date);
  const lookup = {};
  parts.forEach(({ type, value }) => {
    lookup[type] = value;
  });

  const time = date.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return `${lookup.weekday}, ${lookup.day} ${lookup.month} ${time} UK time`;
};


// Reset user and session ID on app load 
// That’s good if you always want fresh IDs per page reload. 
// But if in the future you want users to play multiple sessions without losing session tracking, you would remove that reset. (Just an idea.)
sessionStorage.removeItem('sessionId');
sessionStorage.removeItem('userId');

const generateLogData = (round, items, selectedIds, similarityThreshold, strategyLogRaw, optimalStatsRaw) => {
  const sessionId = sessionStorage.getItem('sessionId') || crypto.randomUUID();
  const userId = sessionStorage.getItem('userId') || crypto.randomUUID();
  sessionStorage.setItem('sessionId', sessionId);
  sessionStorage.setItem('userId', userId);

  const selectedItems = items.filter((project) => selectedIds.includes(project.id));
  const totalValue = selectedItems.reduce((sum, p) => sum + p.value, 0);
  const similarity = averageSimilarity(selectedItems);
  const success = similarity >= similarityThreshold;

  const optimalStats = optimalStatsRaw || findOptimalSubset(items, similarityThreshold);
  const optimalSimilarity = averageSimilarity(optimalStats.subset);

  const strategyLog = strategyLogRaw || [];

  // Collect project-level details
  const itemData = items.flatMap((item, idx) => {
    return {
      [`Project ${idx + 1} Value`]: item.value,
      [`Project ${idx + 1} Attributes`]: `[${item.attributes.map(v => v.toFixed(2)).join(', ')}]`,
      [`Project ${idx + 1} Selected`]: selectedIds.includes(item.id) ? 'Yes' : 'No'
    };
  });

  const itemLog = itemData.reduce((acc, val) => ({ ...acc, ...val }), {});

  return {
    // timestamp: new Date().toISOString(),
	timestamp: formatDateToUKTime(new Date().toISOString()),
    userId,
    sessionId,
    browser: getBrowserInfo(),
    device: getDeviceType(),
    round,
    totalValue,
    similarity: similarity.toFixed(4),
    targetSimilarity: similarityThreshold,
    success,
    strategy: strategyLog.join(", "),
    finalSelection: selectedItems.map(item => item.name).join(", "),
    optimalSet: optimalStats.subset.map(item => item.name).join(", "),
    optimalValue: optimalStats.value.toString(),
    optimalSimilarity: optimalSimilarity.toFixed(4),
    ...itemLog
  };
};

const nextRound = () => {
  const optimal = findOptimalSubset(items, similarityThreshold);
  const logData = generateLogData(round, items, selectedIds, similarityThreshold, strategyLog, optimal);
  try {
    fetch('https://knapsack-with-dependencies.vercel.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(data => console.log('Round log success:', data))
      .catch(err => console.error('Round logging failed:', err));
  } catch (error) {
    console.error('Unexpected error during round logging:', error);
  }

  setHistory((prev) => [...prev, { round, success }]);
  
  // Save round strategy into full session log
  //setFullGameLog(prev => [...prev, { round, strategyLog }]);
  
  setRound((prev) => prev + 1);
  const newRound = generateItemsAndThreshold();
  setRoundData(newRound);
  setSelectedIds([]);
  setOptimalIds([]);
  setOptimalStats(null);
  setStrategyLog([]); // clear data after saving
};

const quitGame = () => {
  const optimal = findOptimalSubset(items, similarityThreshold);
  const logData = generateLogData(round, items, selectedIds, similarityThreshold, strategyLog, optimal);
  try {
    fetch('https://knapsack-with-dependencies.vercel.app/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(data => console.log('Log success:', data))
      .catch(err => console.error('Logging failed:', err));
  } catch (error) {
    console.error('Unexpected error during logging:', error);
  }

  setHistory((prev) => [...prev, { round, success }]);
  
  // Save final round's strategy into full session log
  //setFullGameLog(prev => [...prev, { round, strategyLog }]);
  
  setQuit(true);
  setRound(prev => prev + 1);
};

  const [showOptimalView, setShowOptimalView] = useState(false);

  const showOptimal = () => {
    if (showOptimalView) {
      setOptimalIds([]);
      setSelectedIds(prev => prev.filter(id => !optimalIds.includes(id)));
      setOptimalStats(null);
    } else {
      const result = findOptimalSubset(items, similarityThreshold);
      const ids = result.subset.map((project) => project.id);
      setOptimalIds(ids);
      setSelectedIds(ids);
      const allSubsets = getAllSubsets(items)
        .filter(sub => sub.length >= 2)
        .map(subset => ({
          names: subset.map(project => project.name).join(', '),
          value: subset.reduce((sum, project) => sum + project.value, 0),
          similarity: averageSimilarity(subset),
          valid: averageSimilarity(subset) >= similarityThreshold
        }))
        .sort((a, b) => b.value - a.value);

      setOptimalStats({
        value: result.value,
        similarity: averageSimilarity(result.subset),
        items: result.subset,
        allSubsets
      });
    }
    setShowOptimalView(!showOptimalView);
  };

  if (quit) {
  const total = history.length;
  const passed = history.filter(h => h.success).length;
  const rate = ((passed / total) * 100).toFixed(1);

  return (
    <div className="container py-4">
      <h1 className="h3 mb-4">Session Summary</h1>
      <p className="mb-3">You played {total} round(s).</p>
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Round</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {history.map(({ round, success }, idx) => (
            <tr key={idx} className={success ? "table-success" : "table-danger"}>
              <td>{round}</td>
              <td>{success ? <span className="text-success">✅ Success</span> : <span className="text-danger">❌ Failed</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3">Average Success Rate: {rate}%</p>
      <button
        className="btn btn-dark mt-3"
        onClick={() => {
          sessionStorage.removeItem('sessionId');
          sessionStorage.removeItem('userId');
          setSelectedIds([]);
          setOptimalIds([]);
          setOptimalStats(null);
          setStrategyLog([]);
          sessionStorage.removeItem('userId');
          setRound(1);
          setSelectedIds([]);
          setOptimalIds([]);
          setOptimalStats(null);
          setHistory([]);
          setRoundData(generateItemsAndThreshold());
          setQuit(false);
        }}
      >
        Play Again
      </button>
    </div>
  );
}

return (
    <div className="container py-4">
      <h1 className="text-center h1 text-primary mb-4">Project Selection with Dependencies</h1>
      <h2 className="h4">Round {round}</h2>
      <p>
        Select a portfolio of projects that maximizes total value,<br />
        subject to: Portfolio Compatibility Score ≥ {similarityThreshold} (range: -1 to 1)
      </p>

      <div className="row g-3">
        {items.map((project) => (
          <div key={project.id} className="col-md-6">
<div className={`card p-3 ${selectedIds.includes(project.id) ? 'border-primary border-2' : ''}`}>
  <div
    className="card-body cursor-pointer"
    onClick={() => toggleItem(project.id)}
  >
    <h5 className="card-title">{project.name}</h5>
    <p className="card-text">Value: {project.value}</p>
  </div>
</div>

          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h2 className="h5 mb-3">Stats</h2>
          <p><strong>Total Value:</strong> {selectedItems.reduce((sum, project) => sum + project.value, 0)}</p>
          <p><strong>Target Portfolio Compatibility Score:</strong> {similarityThreshold}</p>
          <p><strong>Current Portfolio Compatibility Score:</strong> {similarity.toFixed(3)} (
  {success ? (
    <span className="text-success fw-semibold">Pass</span>
  ) : (
    <span className="text-danger fw-semibold">Fail</span>
  )})
</p>

          <div className="d-flex gap-3 pt-3">
            <button className="btn" style={{ backgroundColor: '#28a745', color: 'white' }} onClick={nextRound}>
              Next Round
            </button>
            <button className="btn" style={{ border: '2px solid #dc3545', color: '#dc3545', backgroundColor: 'white' }} onClick={quitGame}>
              Quit
            </button>
            <button className="btn" style={{ backgroundColor: '#ffc107', color: 'black' }} onClick={showOptimal}>
              Show Optimal
            </button>
          </div>
        </div>
      </div>
      {optimalStats ? (
  <>
    <div className="card mt-4">
      <div className="card-body">
        <h2 className="h5 mb-3">Optimal Subset</h2>
        <div className="row g-3">
          {optimalStats.items.map((project) => (
            <div key={project.id} className="col-md-6">
              <div className="card border-success">
                <div className="card-body">
                  <h5 className="card-title">{project.name}</h5>
                  <p className="card-text">Value: {project.value}</p>
                  <p className="card-text small text-muted">Vector: [{project.attributes.map(v => v.toFixed(2)).join(", ")}]</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3">Optimal Subset Value: {optimalStats.value}</p>
        <p>Optimal Subset Compatibility Score: {optimalStats.similarity.toFixed(3)}</p>
      </div>
    </div>

    <div className="card mt-4">
      <div className="card-body">
        <h3 className="h6 mb-3">All Valid Subsets (2+ items)</h3>
        <div className="row g-3">
          {optimalStats.allSubsets.map((sub, idx) => (
            <div key={idx} className="col-md-6">
              <div className={`card ${sub.valid ? 'border-success' : 'border-danger'}`}>
                <div className="card-body">
                  <h5 className="card-title">{sub.names}</h5>
                  <p className="card-text">Value: {sub.value}</p>
                  <p className="card-text">Compatibility: {sub.similarity.toFixed(3)} {sub.valid ? '✅' : '❌'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </>
) : null}
    </div>
  );
}
