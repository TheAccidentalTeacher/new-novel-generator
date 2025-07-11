import { useState } from 'react'
import './App.css'

function App() {
  const [mode, setMode] = useState('home')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generateContent = async (generationMode) => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/generateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: generationMode,
          prompt: prompt || undefined
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        setResult(data.result)
        setMode('result')
      } else {
        setResult(`Error: ${data.error}`)
        setMode('result')
      }
    } catch (error) {
      setResult(`Error: ${error.message}`)
      setMode('result')
    }
    setLoading(false)
  }

  const renderHome = () => (
    <div className="home">
      <h1>🖋️ Novel Generator</h1>
      <p>Create amazing stories with AI assistance</p>
      
      <div className="mode-buttons">
        <button 
          className="mode-btn quick"
          onClick={() => setMode('quick')}
        >
          ⚡ Quick Novel
          <span>Generate a complete novel instantly</span>
        </button>
        
        <button 
          className="mode-btn guided"
          onClick={() => setMode('guided')}
        >
          📝 Guided Mode
          <span>Step-by-step novel creation</span>
        </button>
      </div>
    </div>
  )

  const renderQuick = () => (
    <div className="quick-mode">
      <h2>⚡ Quick Novel Generation</h2>
      <p>Enter a prompt or leave blank for a random story</p>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your novel idea, theme, or genre (optional)..."
        rows={4}
      />
      
      <div className="action-buttons">
        <button onClick={() => generateContent('quick')} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Novel'}
        </button>
        <button onClick={() => setMode('home')} className="secondary">
          Back
        </button>
      </div>
    </div>
  )

  const renderGuided = () => (
    <div className="guided-mode">
      <h2>📝 Guided Mode</h2>
      <p>Choose what to generate:</p>
      
      <div className="guided-options">
        <button onClick={() => generateContent('outline')} disabled={loading}>
          📋 Generate Outline
        </button>
        <button onClick={() => generateContent('chapter')} disabled={loading}>
          📖 Write Chapter
        </button>
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your story idea, characters, or setting..."
        rows={4}
      />
      
      <div className="action-buttons">
        <button onClick={() => setMode('home')} className="secondary">
          Back
        </button>
      </div>
    </div>
  )

  const renderResult = () => (
    <div className="result">
      <h2>📚 Generated Content</h2>
      <div className="result-content">
        <pre>{result}</pre>
      </div>
      <div className="action-buttons">
        <button onClick={() => setMode('home')}>
          Generate Another
        </button>
        <button 
          onClick={() => navigator.clipboard.writeText(result)}
          className="secondary"
        >
          Copy Text
        </button>
      </div>
    </div>
  )

  return (
    <div className="app">
      {mode === 'home' && renderHome()}
      {mode === 'quick' && renderQuick()}
      {mode === 'guided' && renderGuided()}
      {mode === 'result' && renderResult()}
    </div>
  )
}

export default App
