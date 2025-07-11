import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [storyData, setStoryData] = useState({
    title: '',
    genre: '',
    synopsis: '',
    characters: [],
    worldbuilding: [],
    outline: [],
    scenes: []
  })
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')

  const generateContent = async (type, prompt, additionalData = {}) => {
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/generateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: type,
          prompt: prompt,
          storyData: storyData,
          ...additionalData
        })
      })
      
      const data = await response.json()
      if (response.ok) {
        setGeneratedContent(data.result)
        return data.result
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Generation error:', error)
      setGeneratedContent(`Error: ${error.message}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  const renderSidebar = () => (
    <div className="sidebar">
      <div className="logo">
        <h2>� Novel Studio</h2>
      </div>
      <nav className="nav-menu">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          🏠 Home
        </button>
        <button 
          className={`nav-item ${activeTab === 'story-bible' ? 'active' : ''}`}
          onClick={() => setActiveTab('story-bible')}
        >
          📖 Story Bible
        </button>
        <button 
          className={`nav-item ${activeTab === 'characters' ? 'active' : ''}`}
          onClick={() => setActiveTab('characters')}
        >
          👥 Characters
        </button>
        <button 
          className={`nav-item ${activeTab === 'worldbuilding' ? 'active' : ''}`}
          onClick={() => setActiveTab('worldbuilding')}
        >
          🌍 Worldbuilding
        </button>
        <button 
          className={`nav-item ${activeTab === 'outline' ? 'active' : ''}`}
          onClick={() => setActiveTab('outline')}
        >
          📋 Outline
        </button>
        <button 
          className={`nav-item ${activeTab === 'scenes' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenes')}
        >
          🎬 Scenes
        </button>
        <button 
          className={`nav-item ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          ⚡ Quick Generate
        </button>
      </nav>
    </div>
  )

  const renderHome = () => (
    <div className="content-panel">
      <div className="welcome-section">
        <h1>Welcome to Novel Studio</h1>
        <p className="subtitle">Your comprehensive AI-powered novel development workspace</p>
        
        <div className="quick-actions">
          <div className="action-card">
            <h3>🚀 Quick Start</h3>
            <p>Generate a complete novel premise instantly</p>
            <button onClick={() => setActiveTab('generator')} className="btn-primary">
              Start Generating
            </button>
          </div>
          
          <div className="action-card">
            <h3>📚 Build Your Story</h3>
            <p>Create detailed characters, world, and plot structure</p>
            <button onClick={() => setActiveTab('story-bible')} className="btn-secondary">
              Open Story Bible
            </button>
          </div>
          
          <div className="action-card">
            <h3>📝 Scene by Scene</h3>
            <p>Write your novel one scene at a time</p>
            <button onClick={() => setActiveTab('scenes')} className="btn-secondary">
              Start Writing
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStoryBible = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>📖 Story Bible</h2>
        <p>Central hub for all your story elements</p>
      </div>
      
      <div className="story-bible-grid">
        <div className="bible-section">
          <h3>📋 Basic Info</h3>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              value={storyData.title}
              onChange={(e) => setStoryData({...storyData, title: e.target.value})}
              placeholder="Enter your story title"
            />
          </div>
          <div className="form-group">
            <label>Genre</label>
            <input 
              type="text" 
              value={storyData.genre}
              onChange={(e) => setStoryData({...storyData, genre: e.target.value})}
              placeholder="e.g., Fantasy, Romance, Sci-Fi"
            />
          </div>
        </div>
        
        <div className="bible-section">
          <h3>📖 Synopsis</h3>
          <textarea 
            value={storyData.synopsis}
            onChange={(e) => setStoryData({...storyData, synopsis: e.target.value})}
            placeholder="Write a brief synopsis of your story..."
            rows={6}
          />
          <button 
            onClick={() => generateContent('synopsis', `Generate a compelling synopsis for a ${storyData.genre} novel titled "${storyData.title}"`)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Synopsis'}
          </button>
        </div>
        
        <div className="bible-section">
          <h3>🎭 Style & Tone</h3>
          <div className="style-options">
            <button className="style-btn">📖 Literary</button>
            <button className="style-btn">🎪 Commercial</button>
            <button className="style-btn">🔥 Dramatic</button>
            <button className="style-btn">😊 Light</button>
            <button className="style-btn">🌙 Dark</button>
            <button className="style-btn">🎭 Humorous</button>
          </div>
        </div>
        
        <div className="bible-section">
          <h3>📊 Story Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{storyData.characters.length}</span>
              <span className="stat-label">Characters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{storyData.worldbuilding.length}</span>
              <span className="stat-label">World Elements</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{storyData.outline.length}</span>
              <span className="stat-label">Chapters</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{storyData.scenes.length}</span>
              <span className="stat-label">Scenes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCharacters = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>👥 Characters</h2>
        <div className="header-actions">
          <button className="btn-primary">+ Add Character</button>
          <button 
            onClick={() => generateContent('character', `Create a compelling character for a ${storyData.genre} story`)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Character'}
          </button>
        </div>
      </div>
      
      <div className="characters-grid">
        {storyData.characters.length === 0 ? (
          <div className="empty-state">
            <h3>No characters yet</h3>
            <p>Create your first character to bring your story to life</p>
          </div>
        ) : (
          storyData.characters.map((character, index) => (
            <div key={index} className="character-card">
              <div className="character-avatar">👤</div>
              <h4>{character.name}</h4>
              <p className="character-role">{character.role}</p>
              <p className="character-description">{character.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )

  const renderWorldbuilding = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>🌍 Worldbuilding</h2>
        <div className="header-actions">
          <button className="btn-primary">+ Add Element</button>
          <button 
            onClick={() => generateContent('worldbuilding', `Create worldbuilding elements for a ${storyData.genre} story`)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Element'}
          </button>
        </div>
      </div>
      
      <div className="worldbuilding-categories">
        <div className="category-tabs">
          <button className="tab-btn active">🏛️ Locations</button>
          <button className="tab-btn">📚 Lore</button>
          <button className="tab-btn">🎭 Culture</button>
          <button className="tab-btn">⚔️ Magic System</button>
          <button className="tab-btn">🏛️ Government</button>
          <button className="tab-btn">💰 Economy</button>
        </div>
        
        <div className="worldbuilding-content">
          {storyData.worldbuilding.length === 0 ? (
            <div className="empty-state">
              <h3>No world elements yet</h3>
              <p>Build your world with locations, cultures, magic systems, and more</p>
            </div>
          ) : (
            <div className="worldbuilding-grid">
              {storyData.worldbuilding.map((element, index) => (
                <div key={index} className="world-element-card">
                  <h4>{element.name}</h4>
                  <p className="element-type">{element.type}</p>
                  <p className="element-description">{element.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderOutline = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>📋 Outline</h2>
        <div className="header-actions">
          <button className="btn-primary">+ Add Chapter</button>
          <button 
            onClick={() => generateContent('outline', `Create a detailed outline for a ${storyData.genre} novel`)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Outline'}
          </button>
        </div>
      </div>
      
      <div className="outline-structure">
        {storyData.outline.length === 0 ? (
          <div className="empty-state">
            <h3>No outline yet</h3>
            <p>Create your story structure with chapters and plot points</p>
          </div>
        ) : (
          <div className="outline-list">
            {storyData.outline.map((chapter, index) => (
              <div key={index} className="outline-item">
                <div className="chapter-number">Chapter {index + 1}</div>
                <div className="chapter-content">
                  <h4>{chapter.title}</h4>
                  <p>{chapter.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderScenes = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>🎬 Scenes</h2>
        <div className="header-actions">
          <button className="btn-primary">+ Add Scene</button>
          <button 
            onClick={() => generateContent('scene', `Write a compelling scene for a ${storyData.genre} story`)}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : '✨ Generate Scene'}
          </button>
        </div>
      </div>
      
      <div className="scenes-workspace">
        <div className="scene-controls">
          <select className="scene-select">
            <option>All chapters</option>
            <option>Chapter 1</option>
            <option>Chapter 2</option>
          </select>
          <select className="pov-select">
            <option>3rd person ltd. POV</option>
            <option>1st person POV</option>
            <option>Omniscient POV</option>
          </select>
          <select className="tense-select">
            <option>Past tense</option>
            <option>Present tense</option>
          </select>
        </div>
        
        <div className="scene-editor">
          <textarea 
            placeholder="Write or generate your scene here..."
            rows={15}
            value={generatedContent}
            onChange={(e) => setGeneratedContent(e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderGenerator = () => (
    <div className="content-panel">
      <div className="panel-header">
        <h2>⚡ Quick Generate</h2>
        <p>Generate complete novels, chapters, or story elements instantly</p>
      </div>
      
      <div className="generator-options">
        <div className="generator-card">
          <h3>📖 Complete Novel</h3>
          <p>Generate a full novel premise with characters and plot</p>
          <button 
            onClick={() => generateContent('quick', 'Generate a complete novel premise with characters, plot, and setting')}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Novel'}
          </button>
        </div>
        
        <div className="generator-card">
          <h3>📋 Story Outline</h3>
          <p>Create a detailed chapter-by-chapter outline</p>
          <button 
            onClick={() => generateContent('outline', 'Generate a detailed story outline with plot points and character arcs')}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Outline'}
          </button>
        </div>
        
        <div className="generator-card">
          <h3>📝 First Chapter</h3>
          <p>Write an engaging opening chapter</p>
          <button 
            onClick={() => generateContent('chapter', 'Write an engaging first chapter with compelling characters and plot hook')}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Chapter'}
          </button>
        </div>
      </div>
      
      {generatedContent && (
        <div className="generated-content">
          <div className="content-header">
            <h3>Generated Content</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(generatedContent)}
              className="btn-copy"
            >
              📋 Copy
            </button>
          </div>
          <div className="content-text">
            <pre>{generatedContent}</pre>
          </div>
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch(activeTab) {
      case 'home': return renderHome()
      case 'story-bible': return renderStoryBible()
      case 'characters': return renderCharacters()
      case 'worldbuilding': return renderWorldbuilding()
      case 'outline': return renderOutline()
      case 'scenes': return renderScenes()
      case 'generator': return renderGenerator()
      default: return renderHome()
    }
  }

  return (
    <div className="app">
      {renderSidebar()}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
