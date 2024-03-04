import "./Scorebar.css"

const Scorebar = ({cat, avg, score, hoveredPair, setHoveredPair}) => {
  const cat2num = {
    "occupation": 0, 
    "communication": 1,
    "commonsense": 2,
    "tools": 3,
    "ethic": 4,
  }
  
  const handleMouseEnter = (index) => {
    if (setHoveredPair) {
      setHoveredPair(index);
    }
    
  };

  const handleMouseLeave = () => {
    if (setHoveredPair) {
      setHoveredPair(null);
    }
    
  };
  
  
  return (
    <div id={cat} className="score-item">
        <div className="score-box">
            <div className="score-label">
                {cat === "occupation" ? "직무이해" :
                cat === "communication" ? "커뮤니케이션" :
                cat === "commonsense" ? "시사/상식" :
                cat === "tools" ? "도구" :
                cat === "ethic" ? "윤리" : cat}
            </div>
            <hr style={{ border: "1px solid #808080", width: '1', height: '100%'}} />
            <div className={hoveredPair===cat2num[cat]? `score-bars-hover${cat2num[cat]}` : "score-bars"} id={cat}
                onMouseEnter={() => handleMouseEnter(cat2num[cat])}
                onMouseLeave={handleMouseLeave}>
              <div className="score-bar-inner">
                <div className={`score-bar ${cat}`} style={{ width: `${avg}%` }}></div>
                <div className={hoveredPair===cat2num[cat]? `score-bar-score-hover${cat2num[cat]}`: "score-bar-score"}>{Math.round(avg)}</div>
              </div>
              <div className="score-bar-inner">
                <div className={`score-bar user-score ${cat}`} style={{ width: `${score}%` }}></div>
                <div className={hoveredPair===cat2num[cat]? `score-bar-score-hover${cat2num[cat]}`: "score-bar-score"}>{Math.round(score)}</div>
              </div>            
            </div>
 
        </div>
    </div>
  )
}

export default Scorebar;