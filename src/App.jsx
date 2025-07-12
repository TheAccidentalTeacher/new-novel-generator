import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [activeWorldTab, setActiveWorldTab] = useState('Locations')
  const [quickGenStep, setQuickGenStep] = useState(1)
  const [quickGenData, setQuickGenData] = useState(() => {
    // Load only generated content from localStorage if available
    const saved = localStorage.getItem('quickGenContent')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Check if data is less than 7 days old (168 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 168 * 60 * 60 * 1000) {
          return {
            genre: '',
            subgenre: '',
            wordCount: '',
            userInput: '',
            synopsis: '',
            outline: parsed.data.outline || [],
            chapters: parsed.data.chapters || []
          }
        }
      } catch (e) {
        console.error('Error loading saved content:', e)
      }
    }
    return {
      genre: '',
      subgenre: '',
      wordCount: '',
      userInput: '',
      synopsis: '',
      outline: [],
      chapters: []
    }
  })
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
  
  // AutoGenerate state
  const [autoGenData, setAutoGenData] = useState({
    genre: '',
    subgenre: '',
    wordCount: '',
    synopsis: '',
    jobId: null,
    status: 'idle', // 'idle', 'processing', 'complete', 'error', 'cancelled'
    progress: 0,
    currentPhase: '',
    novel: null,
    error: null,
    estimatedTimeMinutes: 0,
    pollUrl: null,
    startTime: null,
    lastUpdate: null
  })

  // Polling interval for AutoGenerate jobs
  const [pollingInterval, setPollingInterval] = useState(null)

  // Comprehensive Error Logging Utility
  const generateDetailedErrorReport = (error, context = {}) => {
    const timestamp = new Date().toISOString();
    const errorReport = {
      timestamp,
      error: {
        name: error.name || 'Unknown Error',
        message: error.message || 'No error message available',
        stack: error.stack || 'No stack trace available',
        toString: error.toString()
      },
      context: {
        function: context.function || 'Unknown function',
        operation: context.operation || 'Unknown operation',
        userAgent: navigator.userAgent,
        currentURL: window.location.href,
        networkStatus: navigator.onLine ? 'Online' : 'Offline',
        timestamp: timestamp,
        ...context
      },
      browserInfo: {
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled?.() || false,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth
      },
      appState: {
        activeTab,
        autoGenStatus: autoGenData.status,
        autoGenJobId: autoGenData.jobId,
        quickGenStep,
        loadingState: loading
      }
    };

    const formattedReport = `
🚨 DETAILED ERROR REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 TIMESTAMP: ${timestamp}

🔴 ERROR DETAILS:
• Type: ${errorReport.error.name}
• Message: ${errorReport.error.message}
• String Representation: ${errorReport.error.toString}

📍 CONTEXT:
• Function: ${errorReport.context.function}
• Operation: ${errorReport.context.operation}
• Network Status: ${errorReport.context.networkStatus}
• Current URL: ${errorReport.context.currentURL}

🖥️ BROWSER INFORMATION:
• User Agent: ${errorReport.browserInfo.userAgent}
• Language: ${errorReport.browserInfo.language}
• Platform: ${errorReport.browserInfo.platform}
• Screen: ${errorReport.browserInfo.screenResolution} (${errorReport.browserInfo.colorDepth}-bit)
• Cookies Enabled: ${errorReport.browserInfo.cookieEnabled}

📱 APPLICATION STATE:
• Active Tab: ${errorReport.appState.activeTab}
• AutoGen Status: ${errorReport.appState.autoGenStatus}
• AutoGen Job ID: ${errorReport.appState.autoGenJobId || 'None'}
• Quick Gen Step: ${errorReport.appState.quickGenStep}
• Loading State: ${errorReport.appState.loadingState}

🔍 STACK TRACE:
${errorReport.error.stack}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 COPY THIS ENTIRE ERROR REPORT FOR DEBUGGING
`;

    // Log to console for debugging
    console.group(`🚨 Error in ${errorReport.context.function}`);
    console.error('Error Object:', error);
    console.error('Context:', errorReport.context);
    console.error('Full Report:', errorReport);
    console.groupEnd();

    return formattedReport;
  };

  // Enhanced alert function with detailed logging
  const showDetailedError = (error, context = {}) => {
    const report = generateDetailedErrorReport(error, context);
    alert(report);
    return report;
  };

  // Cost estimation and batch processing utilities
  const calculateEstimatedCost = (wordCount, useBatch = false) => {
    // OpenAI API pricing (per 1M tokens)
    const pricing = {
      'gpt-4o': { input: 2.50, output: 10.00 },
      'gpt-4o-mini': { input: 0.150, output: 0.600 }
    };
    
    // Rough token estimates (1 word ≈ 1.3 tokens)
    const getWordCountValue = (wcId) => {
      const ranges = {
        'flash-fiction': 750,
        'short-story': 4000,
        'novelette': 12500,
        'novella': 28750,
        'novel': 70000,
        'epic': 120000
      };
      return ranges[wcId] || 70000;
    };
    
    const words = getWordCountValue(wordCount);
    const tokens = words * 1.3;
    
    // Cost breakdown
    const costs = {
      synopsis: {
        model: 'gpt-4o-mini',
        inputTokens: 1000,
        outputTokens: 1000,
        cost: (1000 * pricing['gpt-4o-mini'].input + 1000 * pricing['gpt-4o-mini'].output) / 1000000
      },
      outline: {
        model: 'gpt-4o-mini', 
        inputTokens: 2000,
        outputTokens: 3000,
        cost: (2000 * pricing['gpt-4o-mini'].input + 3000 * pricing['gpt-4o-mini'].output) / 1000000
      },
      chapters: {
        model: 'gpt-4o',
        inputTokens: tokens * 0.1, // Context for each chapter
        outputTokens: tokens * 0.9, // Generated content
        cost: (tokens * 0.1 * pricing['gpt-4o'].input + tokens * 0.9 * pricing['gpt-4o'].output) / 1000000
      }
    };
    
    const totalCost = costs.synopsis.cost + costs.outline.cost + costs.chapters.cost;
    const batchDiscount = useBatch ? 0.5 : 1; // 50% discount for batch processing
    
    return {
      breakdown: costs,
      subtotal: totalCost,
      batchDiscount: useBatch ? totalCost * 0.5 : 0,
      total: totalCost * batchDiscount,
      useBatch
    };
  };

  // Get estimated cost for current selection
  const currentCostEstimate = autoGenData.wordCount ? 
    calculateEstimatedCost(autoGenData.wordCount, false) : null;
  const batchCostEstimate = autoGenData.wordCount ? 
    calculateEstimatedCost(autoGenData.wordCount, true) : null;

  // Save only generated content to localStorage whenever it changes
  useEffect(() => {
    const saveData = () => {
      // Only save if there's actual generated content
      if (quickGenData.outline.length > 0 || quickGenData.chapters.length > 0) {
        localStorage.setItem('quickGenContent', JSON.stringify({
          data: {
            outline: quickGenData.outline,
            chapters: quickGenData.chapters
          },
          timestamp: Date.now()
        }))
      }
    }
    
    // Debounce saves
    const timeoutId = setTimeout(saveData, 1000)
    return () => clearTimeout(timeoutId)
  }, [quickGenData.outline, quickGenData.chapters])

  // Genre and subgenre data
  const genres = {
    'Fantasy': ['High Fantasy', 'Urban Fantasy', 'Dark Fantasy', 'Epic Fantasy', 'Sword & Sorcery', 'Paranormal Fantasy'],
    'Science Fiction': ['Space Opera', 'Cyberpunk', 'Dystopian', 'Time Travel', 'Alien Contact', 'Post-Apocalyptic'],
    'Romance': ['Contemporary Romance', 'Historical Romance', 'Paranormal Romance', 'Romantic Suspense', 'Erotic Romance', 'LGBTQ+ Romance'],
    'Mystery': ['Cozy Mystery', 'Police Procedural', 'Detective Fiction', 'Noir', 'Psychological Thriller', 'True Crime'],
    'Thriller': ['Psychological Thriller', 'Medical Thriller', 'Legal Thriller', 'Espionage', 'Action Thriller', 'Conspiracy'],
    'Horror': ['Gothic Horror', 'Supernatural Horror', 'Psychological Horror', 'Body Horror', 'Cosmic Horror', 'Slasher'],
    'Historical Fiction': ['Medieval', 'Victorian', 'World War Era', 'Ancient Civilizations', 'Wild West', 'Renaissance'],
    'Contemporary Fiction': ['Literary Fiction', 'Women\'s Fiction', 'Family Saga', 'Coming of Age', 'Social Issues', 'Slice of Life'],
    'Young Adult': ['YA Fantasy', 'YA Romance', 'YA Dystopian', 'YA Contemporary', 'YA Sci-Fi', 'YA Mystery'],
    'Children\'s': ['Picture Books', 'Early Readers', 'Middle Grade', 'Educational', 'Adventure', 'Fantasy'],
    'Christian Fiction': ['Inspirational Romance', 'Biblical Fiction', 'Amish Romance', 'Christian Suspense', 'End Times', 'Christian Fantasy'],
    'Adventure': ['Action Adventure', 'Survival', 'Treasure Hunt', 'Exploration', 'Military', 'Spy Fiction'],
    'Crime': ['Heist', 'Organized Crime', 'Serial Killer', 'Courtroom Drama', 'Private Detective', 'Forensic'],
    'Western': ['Traditional Western', 'Weird Western', 'Modern Western', 'Outlaw', 'Frontier', 'Native American'],
    'Literary Fiction': ['Experimental', 'Metafiction', 'Magical Realism', 'Biographical', 'Social Commentary', 'Stream of Consciousness'],
    'Biographical': ['Autobiography', 'Historical Biography', 'Celebrity', 'Political', 'Scientific', 'Artistic']
  }

  const wordCounts = [
    { id: 'flash-fiction', name: 'Flash Fiction', range: '500-1,000 words', description: 'Very short story' },
    { id: 'short-story', name: 'Short Story', range: '1,000-7,500 words', description: 'Single sitting read' },
    { id: 'novelette', name: 'Novelette', range: '7,500-17,500 words', description: 'Extended short story' },
    { id: 'novella', name: 'Novella', range: '17,500-40,000 words', description: 'Short novel' },
    { id: 'novel', name: 'Novel', range: '40,000-100,000 words', description: 'Standard novel length' },
    { id: 'epic', name: 'Epic Novel', range: '100,000+ words', description: 'Extended novel' }
  ]

  const generateContent = async (type, prompt, additionalData = {}) => {
    setLoading(true)
    try {
      console.log(`Making request to /.netlify/functions/generateNovel with mode: ${type}`)
      console.log('Request data:', { mode: type, prompt, storyData, ...additionalData })
      
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
      
      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
        } catch (e) {
          errorDetails = { rawError: errorText };
        }

        const detailedError = `
🚨 GENERATION ERROR DETAILS:

Function: generateNovel
Mode: ${type}
HTTP Status: ${response.status} ${response.statusText}
URL: ${response.url}

Error Response:
${JSON.stringify(errorDetails, null, 2)}

Request Data:
- Type: ${type}
- Prompt Length: ${prompt?.length || 0} characters
- Additional Data: ${JSON.stringify(additionalData, null, 2)}

Browser Info:
- User Agent: ${navigator.userAgent}
- Timestamp: ${new Date().toISOString()}
- Network: ${navigator.onLine ? 'Online' : 'Offline'}

Please copy this error and share for debugging.
        `;
        
        alert(detailedError);
        throw new Error(detailedError);
      }
      
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.result) {
        setGeneratedContent(data.result)
        return data.result
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error('No result or error in response')
      }
    } catch (error) {
      console.error('Generation error:', error)
      
      const detailedErrorInfo = `
🚨 DETAILED GENERATION ERROR:

Function: generateNovel
Mode: ${type}
Error Type: ${error.name || 'Unknown'}
Error Message: ${error.message}

Stack Trace:
${error.stack || 'No stack trace available'}

Request Information:
- Generation Type: ${type}
- Prompt Length: ${prompt?.length || 0} characters
- Additional Data: ${JSON.stringify(additionalData, null, 2)}

Browser Information:
- User Agent: ${navigator.userAgent}
- Current URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
- Network Status: ${navigator.onLine ? 'Online' : 'Offline'}

Troubleshooting Steps:
1. Check Netlify function logs
2. Verify OpenAI API key is set in environment variables
3. Check network connectivity
4. Try again in a few minutes

Please copy this entire error message for debugging.
      `;

      setGeneratedContent(detailedErrorInfo);
      return null
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate synopsis and go to outline step
  const handleQuickGenProceedToOutline = async () => {
    if (!quickGenData.userInput.trim()) return;
    
    setLoading(true);
    try {
      // Auto-generate synopsis in the background
      const synopsis = await generateContent('synopsis', '', {
        genre: quickGenData.genre,
        subgenre: quickGenData.subgenre,
        wordCount: quickGenData.wordCount,
        userInput: quickGenData.userInput
      });
      
      if (synopsis) {
        setQuickGenData(prev => ({ 
          ...prev, 
          synopsis: synopsis,
          // Clear any old outline/chapter data to prevent conflicts
          outline: [],
          chapters: []
        }));
      }
      
      setQuickGenStep(5); // Skip step 4, go directly to outline generation
    } catch (error) {
      console.error('Synopsis generation failed:', error);
      // Even if synopsis fails, continue to outline with empty synopsis
      setQuickGenData(prev => ({ 
        ...prev,
        outline: [],
        chapters: []
      }));
      setQuickGenStep(5);
    } finally {
      setLoading(false);
    }
  };

  // Quick Generate workflow functions
  const handleQuickGenSynopsis = async () => {
    const result = await generateContent('synopsis', '', {
      genre: quickGenData.genre,
      subgenre: quickGenData.subgenre,
      wordCount: quickGenData.wordCount,
      userInput: quickGenData.userInput
    })
    
    if (result) {
      setQuickGenData(prev => ({ ...prev, synopsis: result }))
    }
  }

  const handleQuickGenOutlineNext = async () => {
    const chapterNumber = quickGenData.outline.length + 1
    const chapterStructure = getRecommendedChapterStructure(quickGenData.wordCount)
    
    // Check if we've exceeded the maximum chapters
    if (chapterNumber > chapterStructure.max) {
      alert(`⚠️ Maximum chapters reached!\n\nFor ${quickGenData.wordCount}, the maximum recommended chapters is ${chapterStructure.max}. Adding more chapters would result in very short chapters (less than ${Math.floor(500 / chapterNumber)} words each).\n\nConsider moving to the chapter writing step or choosing a longer story format.`)
      return
    }
    
    setLoading(true)
    
    try {
      console.log(`Generating outline for chapter ${chapterNumber} (${chapterNumber}/${chapterStructure.max} max)`)
      
      const response = await fetch('/.netlify/functions/generateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'outline',
          genre: quickGenData.genre,
          subgenre: quickGenData.subgenre,
          synopsis: quickGenData.synopsis,
          outline: quickGenData.outline,
          chapterNumber: chapterNumber,
          wordCount: quickGenData.wordCount,
          chapterStructure: chapterStructure,
          totalChapters: chapterStructure.recommended
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      const data = await response.json()
      
      if (data.result) {
        // Clean the result to ensure it's valid JSON
        let cleanResult = data.result.trim()
        
        // Remove any markdown formatting
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/```json\n?/, '').replace(/\n?```$/, '')
        }
        if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/```\n?/, '').replace(/\n?```$/, '')
        }
        
        // Find JSON object if there's extra text
        const jsonMatch = cleanResult.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanResult = jsonMatch[0]
        }
        
        const parsedChapter = JSON.parse(cleanResult)
        
        // Validate the structure
        if (!parsedChapter.title || !parsedChapter.summary) {
          throw new Error('Invalid chapter structure - missing title or summary')
        }
        
        setQuickGenData(prev => ({
          ...prev,
          outline: [...prev.outline, parsedChapter]
        }))
        
        console.log(`Successfully added chapter ${chapterNumber} to outline:`, parsedChapter.title)
        
        // Show guidance after adding chapter
        if (chapterNumber >= chapterStructure.recommended) {
          alert(`✅ Chapter ${chapterNumber} added!\n\n${chapterNumber >= chapterStructure.recommended ? 
            `You've reached the recommended ${chapterStructure.recommended} chapters for ${quickGenData.wordCount}. This is a good structure!` : 
            `${chapterStructure.recommended - chapterNumber} more chapters recommended for optimal ${quickGenData.wordCount} structure.`}`)
        }
        
      } else if (data.error) {
        throw new Error(data.error)
      } else {
        throw new Error('No result in response')
      }
      
    } catch (error) {
      console.error('Outline generation error:', error)
      setGeneratedContent(`Error generating chapter ${chapterNumber} outline: ${error.message}\n\nPlease try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickGenChapter = async (chapterNumber) => {
    const targetWords = getTargetWordCount(quickGenData.wordCount);
    
    const result = await generateContent('generate-chapter', '', {
      genre: quickGenData.genre,
      subgenre: quickGenData.subgenre,
      synopsis: quickGenData.synopsis,
      outline: quickGenData.outline,
      chapters: quickGenData.chapters,
      chapterNumber: chapterNumber,
      wordCount: quickGenData.wordCount
    })
    
    if (result) {
      const actualWordCount = getWordCount(result);
      const newChapter = {
        number: chapterNumber,
        title: quickGenData.outline[chapterNumber - 1]?.title || `Chapter ${chapterNumber}`,
        content: result,
        summary: quickGenData.outline[chapterNumber - 1]?.summary || '',
        wordCount: actualWordCount,
        targetWords: targetWords
      }
      
      // Show word count feedback
      if (actualWordCount < targetWords.min * 0.8) {
        alert(`⚠️ Chapter ${chapterNumber} generated with ${actualWordCount} words (target: ${targetWords.min}-${targetWords.max}). This is shorter than expected. You may want to regenerate for a longer chapter.`);
      } else if (actualWordCount > targetWords.max * 1.2) {
        alert(`⚠️ Chapter ${chapterNumber} generated with ${actualWordCount} words (target: ${targetWords.min}-${targetWords.max}). This is longer than expected but still usable.`);
      } else {
        alert(`✅ Chapter ${chapterNumber} generated successfully with ${actualWordCount} words (target: ${targetWords.min}-${targetWords.max}).`);
      }
      
      setQuickGenData(prev => ({
        ...prev,
        chapters: [...prev.chapters, newChapter]
      }))
    }
  }

  // Word count utility function
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Get target word count for chapter based on story length
  const getTargetWordCount = (storyLength) => {
    switch(storyLength) {
      case 'flash-fiction': return { min: 200, max: 500, target: 350 };
      case 'short-story': return { min: 500, max: 1000, target: 750 };
      case 'novelette': return { min: 1000, max: 2000, target: 1500 };
      case 'novella': return { min: 2000, max: 3000, target: 2500 };
      case 'novel': return { min: 2500, max: 4000, target: 3000 };
      case 'epic': return { min: 3000, max: 5000, target: 4000 };
      default: return { min: 2000, max: 4000, target: 3000 };
    }
  }

  // Get recommended chapter count and structure based on story length
  const getRecommendedChapterStructure = (storyLength) => {
    switch(storyLength) {
      case 'flash-fiction': 
        return { 
          recommended: 1, 
          min: 1, 
          max: 3, 
          description: "Very short single scene or 2-3 micro-chapters",
          wordsPerChapter: "250-500 words per section" 
        };
      case 'short-story': 
        return { 
          recommended: 3, 
          min: 1, 
          max: 5, 
          description: "Brief story with beginning, middle, end",
          wordsPerChapter: "800-1500 words per chapter" 
        };
      case 'novelette': 
        return { 
          recommended: 5, 
          min: 3, 
          max: 8, 
          description: "Extended short story with multiple scenes",
          wordsPerChapter: "1500-3000 words per chapter" 
        };
      case 'novella': 
        return { 
          recommended: 8, 
          min: 5, 
          max: 12, 
          description: "Short novel with developed plot",
          wordsPerChapter: "2500-4000 words per chapter" 
        };
      case 'novel': 
        return { 
          recommended: 15, 
          min: 10, 
          max: 25, 
          description: "Full-length novel with complex plot",
          wordsPerChapter: "3000-5000 words per chapter" 
        };
      case 'epic': 
        return { 
          recommended: 25, 
          min: 20, 
          max: 40, 
          description: "Epic novel with multiple arcs",
          wordsPerChapter: "3500-6000 words per chapter" 
        };
      default: 
        return { 
          recommended: 15, 
          min: 10, 
          max: 25, 
          description: "Standard novel structure",
          wordsPerChapter: "3000-5000 words per chapter" 
        };
    }
  }

  const resetQuickGen = () => {
    setQuickGenStep(1)
    setQuickGenData({
      genre: '',
      subgenre: '',
      wordCount: '',
      userInput: '',
      synopsis: '',
      outline: [],
      chapters: []
    })
    setGeneratedContent('')
    // Clear stored content
    localStorage.removeItem('quickGenContent')
    localStorage.removeItem('quickGenData') // Remove old storage key too
  }

  const clearGeneratedContent = () => {
    if (window.confirm('Are you sure you want to clear all generated outlines and chapters? This cannot be undone.')) {
      setQuickGenData(prev => ({
        ...prev,
        outline: [],
        chapters: []
      }))
      localStorage.removeItem('quickGenContent')
      alert('✅ Generated content cleared!')
    }
  }

  const clearAllData = () => {
    if (confirm('⚠️ This will clear ALL saved data and start completely fresh. Are you sure?')) {
      localStorage.clear()
      setQuickGenStep(1)
      setQuickGenData({
        genre: '',
        subgenre: '',
        wordCount: '',
        userInput: '',
        synopsis: '',
        outline: [],
        chapters: []
      })
      setStoryData({
        title: '',
        genre: '',
        synopsis: '',
        characters: [],
        worldbuilding: [],
        outline: [],
        scenes: []
      })
      setGeneratedContent('')
      alert('✅ All data cleared successfully!')
    }
  }

  const acceptDraft = () => {
    // Move data to main story data
    setStoryData(prev => ({
      ...prev,
      title: `${quickGenData.genre} ${quickGenData.wordCount}`,
      genre: `${quickGenData.genre} - ${quickGenData.subgenre}`,
      synopsis: quickGenData.synopsis,
      outline: quickGenData.outline.map((ch, i) => ({
        id: Date.now() + i,
        title: ch.title,
        summary: ch.summary
      }))
    }))
    
    // Show success message
    alert(`✅ Draft accepted! Your ${quickGenData.genre} novel has been moved to permanent storage. 
    
📊 Final Stats:
• Genre: ${quickGenData.genre} - ${quickGenData.subgenre}
• Chapters: ${quickGenData.chapters.length}
• Total Words: ~${quickGenData.chapters.reduce((total, ch) => total + ch.content.split(' ').length, 0).toLocaleString()}
• You can now export your novel using the export buttons.`)
    
    // Clear temporary storage but keep the data visible for export
    localStorage.removeItem('quickGenData')
  }

  const handleGenerateSynopsis = async () => {
    const result = await generateContent('synopsis', `Generate a synopsis for a ${storyData.genre} novel titled "${storyData.title}"`)
    if (result) {
      setStoryData({...storyData, synopsis: result})
    }
  }

  const handleGenerateCharacter = async () => {
    const result = await generateContent('character', `Create a character for a ${storyData.genre} story`)
    if (result) {
      const newCharacter = {
        id: Date.now(),
        name: extractName(result) || 'Generated Character',
        role: 'Main Character',
        description: result
      }
      setStoryData({...storyData, characters: [...storyData.characters, newCharacter]})
    }
  }

  const handleGenerateWorldElement = async () => {
    const result = await generateContent('worldbuilding', `Create ${activeWorldTab.toLowerCase()} for a ${storyData.genre} story`)
    if (result) {
      const newElement = {
        id: Date.now(),
        name: extractElementName(result) || `New ${activeWorldTab.slice(0, -1)}`,
        type: activeWorldTab.slice(0, -1),
        description: result
      }
      setStoryData({...storyData, worldbuilding: [...storyData.worldbuilding, newElement]})
    }
  }

  const handleGenerateOutline = async () => {
    const result = await generateContent('outline', `Create an outline for a ${storyData.genre} novel`)
    if (result) {
      const chapters = parseOutlineToChapters(result)
      setStoryData({...storyData, outline: chapters})
    }
  }

  const handleGenerateScene = async () => {
    const result = await generateContent('scene', `Write a scene for a ${storyData.genre} story`)
    if (result) {
      setGeneratedContent(result)
    }
  }

  // Export functions
  const exportToDocx = async () => {
    try {
      // Dynamic import to avoid build issues
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = await import('docx')
      const { saveAs } = await import('file-saver')
      
      const children = []
      
      // Title page
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1440, after: 720 }, // 1 inch before, 0.5 inch after
          children: [
            new TextRun({
              text: `${quickGenData.genre} Novel`,
              size: 48,
              bold: true
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Genre: ${quickGenData.genre} - ${quickGenData.subgenre}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Length: ${quickGenData.wordCount}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Total Words: ~${quickGenData.chapters.reduce((total, ch) => total + ch.content.split(' ').length, 0).toLocaleString()}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Generated: ${new Date().toLocaleDateString()}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          children: [new PageBreak()]
        })
      )
      
      // Synopsis
      if (quickGenData.synopsis) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 },
            children: [
              new TextRun({
                text: "Synopsis",
                size: 32,
                bold: true
              })
            ]
          })
        )
        
        const synopsisParas = quickGenData.synopsis.split('\n\n')
        synopsisParas.forEach(para => {
          if (para.trim()) {
            children.push(
              new Paragraph({
                spacing: { after: 240 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 24
                  })
                ]
              })
            )
          }
        })
        
        children.push(new Paragraph({ children: [new PageBreak()] }))
      }
      
      // Chapters
      quickGenData.chapters.forEach((chapter, index) => {
        // Chapter title
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 },
            children: [
              new TextRun({
                text: chapter.title,
                size: 32,
                bold: true
              })
            ]
          })
        )
        
        // Chapter content
        const contentParas = chapter.content.split('\n\n')
        contentParas.forEach(para => {
          if (para.trim()) {
            children.push(
              new Paragraph({
                spacing: { after: 240 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 360 }, // 0.25 inch first line indent
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 24
                  })
                ]
              })
            )
          }
        })
        
        // Page break after each chapter except the last
        if (index < quickGenData.chapters.length - 1) {
          children.push(new Paragraph({ children: [new PageBreak()] }))
        }
      })
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440    // 1 inch
              }
            }
          },
          children: children
        }]
      })
      
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${quickGenData.genre}-${quickGenData.subgenre}-novel.docx`)
    } catch (error) {
      console.error('Error exporting to DOCX:', error)
      showDetailedError(
        'DOCX Export Failed',
        'Failed to export your novel to DOCX format',
        error,
        'Try using the PDF or HTML export options instead. This error may occur due to browser compatibility issues with the DOCX library.',
        'exportToDOCX'
      )
    }
  }

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf')
      const { saveAs } = await import('file-saver')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Add title page
      pdf.setFontSize(24)
      pdf.text(`${quickGenData.genre} Novel`, 105, 50, { align: 'center' })
      pdf.setFontSize(16)
      pdf.text(`Genre: ${quickGenData.genre} - ${quickGenData.subgenre}`, 105, 70, { align: 'center' })
      pdf.text(`Word Count: ${quickGenData.wordCount}`, 105, 85, { align: 'center' })
      pdf.text(`Total Words: ~${quickGenData.chapters.reduce((total, ch) => total + ch.content.split(' ').length, 0).toLocaleString()}`, 105, 100, { align: 'center' })
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 115, { align: 'center' })
      
      let yPosition = 140
      
      // Add synopsis
      if (quickGenData.synopsis) {
        pdf.addPage()
        yPosition = 20
        pdf.setFontSize(16)
        pdf.text('Synopsis', 105, yPosition, { align: 'center' })
        yPosition += 15
        pdf.setFontSize(11)
        const synopsisLines = pdf.splitTextToSize(quickGenData.synopsis, 170)
        synopsisLines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 6
        })
      }
      
      // Add chapters
      quickGenData.chapters.forEach((chapter, index) => {
        pdf.addPage()
        yPosition = 30
        
        // Chapter title
        pdf.setFontSize(18)
        pdf.text(chapter.title, 105, yPosition, { align: 'center' })
        yPosition += 20
        
        // Chapter content
        pdf.setFontSize(11)
        const contentLines = pdf.splitTextToSize(chapter.content, 170)
        contentLines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 6
        })
      })
      
      const pdfBlob = pdf.output('blob')
      saveAs(pdfBlob, `${quickGenData.genre}-${quickGenData.subgenre}-novel.pdf`)
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      showDetailedError(
        'PDF Export Failed',
        'Failed to export your novel to PDF format',
        error,
        'Try using the HTML export option instead. This error may occur due to browser compatibility issues with the PDF library or very large documents.',
        'exportToPDF'
      )
    }
  }

  const exportToGoogleDocs = () => {
    try {
      const htmlContent = generateExportHTML()
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      // Create a temporary link to download the HTML file
      const link = document.createElement('a')
      link.href = url
      link.download = `${quickGenData.genre}-${quickGenData.subgenre}-novel.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      // Show instructions
      alert(`✅ HTML file downloaded successfully!

📝 To import to Google Docs:
1. Open Google Docs (docs.google.com)
2. Click "File" → "Import"
3. Click "Upload" and select the downloaded HTML file
4. The document will open with proper formatting
5. You can then edit, share, or export from Google Docs

💡 The HTML file contains your complete novel with professional formatting and will maintain proper chapter breaks when imported.`)
    } catch (error) {
      console.error('Error exporting HTML:', error)
      showDetailedError(
        'HTML Export Failed',
        'Failed to create HTML export for Google Docs import',
        error,
        'This error is unusual as HTML export is the most compatible format. Check if your browser allows file downloads and try again.',
        'exportToGoogleDocs'
      )
    }
  }

  const generateExportHTML = () => {
    const totalWords = quickGenData.chapters.reduce((total, chapter) => 
      total + (chapter.content ? chapter.content.split(' ').length : 0), 0)
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${quickGenData.genre} Novel</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 1in;
            color: #000;
        }
        .title-page {
            text-align: center;
            page-break-after: always;
            margin-top: 2in;
        }
        .title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 1in;
        }
        .metadata {
            font-size: 14pt;
            margin-bottom: 0.5in;
        }
        .synopsis {
            page-break-after: always;
            margin-top: 1in;
        }
        .synopsis-title {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0.5in;
        }
        .chapter {
            page-break-before: always;
        }
        .chapter-title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1in;
            margin-top: 1in;
        }
        .chapter-content {
            text-align: justify;
            text-indent: 0.5in;
        }
        .chapter-content p {
            margin-bottom: 0.25in;
        }
        @page {
            margin: 1in;
        }
        @media print {
            .chapter {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="title-page">
        <div class="title">${quickGenData.genre} Novel</div>
        <div class="metadata">Genre: ${quickGenData.genre} - ${quickGenData.subgenre}</div>
        <div class="metadata">Length: ${quickGenData.wordCount}</div>
        <div class="metadata">Total Words: ~${totalWords.toLocaleString()}</div>
        <div class="metadata">Generated: ${new Date().toLocaleDateString()}</div>
    </div>
    
    ${quickGenData.synopsis ? `
    <div class="synopsis">
        <div class="synopsis-title">Synopsis</div>
        <div>${quickGenData.synopsis.split('\n\n').map(para => `<p>${para}</p>`).join('')}</div>
    </div>
    ` : ''}
    
    ${quickGenData.chapters.map((chapter, index) => `
    <div class="chapter">
        <div class="chapter-title">Chapter ${chapter.number || (index + 1)}: ${chapter.title}</div>
        <div class="chapter-content">
            ${chapter.content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('')}
        </div>
    </div>
    `).join('')}
</body>
</html>`
  }

  // Helper functions
  const extractName = (text) => {
    const nameMatch = text.match(/(?:Name|Character):\s*([^\n\r]+)/i)
    return nameMatch ? nameMatch[1].trim() : null
  }

  const extractElementName = (text) => {
    const lines = text.split('\n')
    const firstLine = lines[0].replace(/^[*#-]\s*/, '').trim()
    return firstLine.length > 0 && firstLine.length < 50 ? firstLine : null
  }

  const parseOutlineToChapters = (outline) => {
    const chapters = []
    const lines = outline.split('\n')
    let currentChapter = null
    
    lines.forEach(line => {
      const chapterMatch = line.match(/(?:Chapter|Part)\s*(\d+)[:\-\s]*(.+)/i)
      if (chapterMatch) {
        if (currentChapter) chapters.push(currentChapter)
        currentChapter = {
          id: Date.now() + chapters.length,
          title: chapterMatch[2].trim(),
          summary: ''
        }
      } else if (currentChapter && line.trim()) {
        currentChapter.summary += line.trim() + ' '
      }
    })
    
    if (currentChapter) chapters.push(currentChapter)
    return chapters.length > 0 ? chapters : [{
      id: Date.now(),
      title: 'Generated Outline',
      summary: outline
    }]
  }

  const addManualCharacter = () => {
    const newCharacter = {
      id: Date.now(),
      name: 'New Character',
      role: 'Supporting Character',
      description: 'Character description...'
    }
    setStoryData({...storyData, characters: [...storyData.characters, newCharacter]})
  }

  const addManualWorldElement = () => {
    const newElement = {
      id: Date.now(),
      name: `New ${activeWorldTab.slice(0, -1)}`,
      type: activeWorldTab.slice(0, -1),
      description: 'Element description...'
    }
    setStoryData({...storyData, worldbuilding: [...storyData.worldbuilding, newElement]})
  }

  const addManualChapter = () => {
    const newChapter = {
      id: Date.now(),
      title: `Chapter ${storyData.outline.length + 1}`,
      summary: 'Chapter summary...'
    }
    setStoryData({...storyData, outline: [...storyData.outline, newChapter]})
  }

  const renderSidebar = () => (
    <div className="sidebar">
      <div className="logo">
        <h2>📚 Novel Studio</h2>
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
        <button 
          className={`nav-item ${activeTab === 'auto-generate' ? 'active' : ''}`}
          onClick={() => setActiveTab('auto-generate')}
        >
          🤖 AutoGenerate
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
            <p>Generate a complete novel premise step-by-step</p>
            <button onClick={() => setActiveTab('generator')} className="btn-primary">
              Start Generating
            </button>
          </div>
          
          <div className="action-card">
            <h3>🤖 AutoGenerate</h3>
            <p>Set it and forget it - complete novel from synopsis</p>
            <button onClick={() => setActiveTab('auto-generate')} className="btn-primary">
              Auto Generate Novel
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
        
        <div className="ai-models-info">
          <h3>🤖 AI Models Used - Optimized Performance</h3>
          <p>We use different AI models optimized for each task's complexity:</p>
          <div className="model-grid">
            <div className="model-card">
              <h4>GPT-4o</h4>
              <p><strong>Chapter Generation</strong> - Most advanced model for complex creative writing with "show, don't tell" techniques</p>
            </div>
            <div className="model-card">
              <h4>GPT-4o-mini</h4>
              <p><strong>Synopsis & Outline</strong> - Efficient for story structure and planning tasks</p>
            </div>
            <div className="model-card">
              <h4>GPT-3.5 Turbo</h4>
              <p><strong>Characters, World & Scenes</strong> - Fast and reliable for creative elements</p>
            </div>
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
            onClick={handleGenerateSynopsis}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating... (GPT-4o-mini)' : '✨ Generate Synopsis'}
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
          <button className="btn-primary" onClick={addManualCharacter}>
            + Add Character
          </button>
          <button 
            onClick={handleGenerateCharacter}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating... (GPT-3.5 Turbo)' : '✨ Generate Character'}
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
          storyData.characters.map((character) => (
            <div key={character.id} className="character-card">
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
          <button className="btn-primary" onClick={addManualWorldElement}>
            + Add Element
          </button>
          <button 
            onClick={handleGenerateWorldElement}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating... (GPT-3.5 Turbo)' : '✨ Generate Element'}
          </button>
        </div>
      </div>
      
      <div className="worldbuilding-categories">
        <div className="category-tabs">
          {['🏛️ Locations', '📚 Lore', '🎭 Culture', '⚔️ Magic System', '🏛️ Government', '💰 Economy'].map((tab) => {
            const tabName = tab.split(' ')[1]
            return (
              <button 
                key={tabName}
                className={`tab-btn ${activeWorldTab === tabName ? 'active' : ''}`}
                onClick={() => setActiveWorldTab(tabName)}
              >
                {tab}
              </button>
            )
          })}
        </div>
        
        <div className="worldbuilding-content">
          {storyData.worldbuilding.filter(element => element.type === activeWorldTab.slice(0, -1) || activeWorldTab === 'Locations' && element.type === 'Location').length === 0 ? (
            <div className="empty-state">
              <h3>No {activeWorldTab.toLowerCase()} yet</h3>
              <p>Build your world with {activeWorldTab.toLowerCase()}, and more</p>
            </div>
          ) : (
            <div className="worldbuilding-grid">
              {storyData.worldbuilding
                .filter(element => element.type === activeWorldTab.slice(0, -1) || (activeWorldTab === 'Locations' && element.type === 'Location'))
                .map((element) => (
                <div key={element.id} className="world-element-card">
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
          <button className="btn-primary" onClick={addManualChapter}>
            + Add Chapter
          </button>
          <button 
            onClick={handleGenerateOutline}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating... (GPT-4o-mini)' : '✨ Generate Outline'}
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
              <div key={chapter.id} className="outline-item">
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
            onClick={handleGenerateScene}
            className="btn-generate"
            disabled={loading}
          >
            {loading ? 'Generating... (GPT-3.5 Turbo)' : '✨ Generate Scene'}
          </button>
        </div>
      </div>
      
      <div className="scenes-workspace">
        <div className="scene-controls">
          <select className="scene-select">
            <option>All chapters</option>
            {storyData.outline.map((chapter, index) => (
              <option key={chapter.id}>Chapter {index + 1}</option>
            ))}
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

  const renderGenerator = () => {
    // Step 1: Genre Selection
    if (quickGenStep === 1) {
      return (
        <div className="content-panel">
          <div className="panel-header">
            <h2>⚡ Quick Generate - Step 1/6</h2>
            <p>Choose your genre and subgenre</p>
          </div>
          
          <div className="genre-selection">
            <div className="genre-grid">
              {Object.keys(genres).map(genre => (
                <div key={genre} className="genre-card">
                  <h3>{genre}</h3>
                  <div className="subgenre-list">
                    {genres[genre].map(subgenre => (
                      <button
                        key={subgenre}
                        className={`subgenre-btn ${quickGenData.genre === genre && quickGenData.subgenre === subgenre ? 'selected' : ''}`}
                        onClick={() => setQuickGenData(prev => ({ ...prev, genre, subgenre }))}
                      >
                        {subgenre}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {quickGenData.genre && quickGenData.subgenre && (
              <div className="step-controls">
                <p>Selected: <strong>{quickGenData.genre} - {quickGenData.subgenre}</strong></p>
                <button 
                  onClick={() => setQuickGenStep(2)}
                  className="btn-next"
                >
                  Next: Word Count →
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }

    // Step 2: Word Count Selection
    if (quickGenStep === 2) {
      return (
        <div className="content-panel">
          <div className="panel-header">
            <h2>⚡ Quick Generate - Step 2/6</h2>
            <p>Choose your target word count</p>
          </div>
          
          <div className="word-count-selection">
            <div className="word-count-grid">
              {wordCounts.map(wc => (
                <div 
                  key={wc.id}
                  className={`word-count-card ${quickGenData.wordCount === wc.id ? 'selected' : ''}`}
                  onClick={() => setQuickGenData(prev => ({ ...prev, wordCount: wc.id }))}
                >
                  <h3>{wc.name}</h3>
                  <p className="range">{wc.range}</p>
                  <p className="description">{wc.description}</p>
                </div>
              ))}
            </div>
            
            <div className="step-controls">
              <button onClick={() => setQuickGenStep(1)} className="btn-back">
                ← Back
              </button>
              {quickGenData.wordCount && (
                <button onClick={() => setQuickGenStep(3)} className="btn-next">
                  Next: Story Details →
                </button>
              )}
            </div>
          </div>
        </div>
      )
    }

    // Step 3: User Input
    if (quickGenStep === 3) {
      return (
        <div className="content-panel">
          <div className="panel-header">
            <h2>⚡ Quick Generate - Step 3/5</h2>
            <p>Tell us about your story idea</p>
          </div>
          
          <div className="user-input-section">
            <div className="selected-options">
              <p><strong>Genre:</strong> {quickGenData.genre} - {quickGenData.subgenre}</p>
              <p><strong>Length:</strong> {wordCounts.find(wc => wc.id === quickGenData.wordCount)?.name}</p>
            </div>
            
            <div className="input-group">
              <label>Describe your story idea:</label>
              <textarea
                value={quickGenData.userInput}
                onChange={(e) => setQuickGenData(prev => ({ ...prev, userInput: e.target.value }))}
                placeholder="Enter your story concept, characters, setting, plot ideas, themes, or any other details you want to include..."
                rows={8}
                className="story-input"
              />
            </div>
            
            <div className="step-controls">
              <button onClick={() => setQuickGenStep(2)} className="btn-back">
                ← Back
              </button>
              <button 
                onClick={handleQuickGenProceedToOutline}
                className="btn-next"
                disabled={!quickGenData.userInput.trim() || loading}
              >
                {loading ? 'Generating Synopsis & Outline... (GPT-4o-mini)' : 'Next: Generate Outline →'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Step 4: Outline Generation (was step 5)
    if (quickGenStep === 5) {
      const chapterStructure = getRecommendedChapterStructure(quickGenData.wordCount);
      const currentChapterCount = quickGenData.outline.length;
      const canAddMore = currentChapterCount < chapterStructure.max;
      const hasReachedRecommended = currentChapterCount >= chapterStructure.recommended;
      
      return (
        <div className="content-panel">
          <div className="panel-header">
            <h2>⚡ Quick Generate - Step 4/5</h2>
            <p>Chapter-by-chapter outline generation</p>
            {quickGenData.synopsis && (
              <div className="auto-synopsis">
                <h4>Auto-generated Synopsis:</h4>
                <p>{quickGenData.synopsis}</p>
              </div>
            )}
          </div>
          
          <div className="chapter-structure-guide">
            <h3>📊 Recommended Structure for {quickGenData.wordCount.replace('-', ' ').toUpperCase()}</h3>
            <div className="structure-info">
              <div className="structure-stat">
                <span className="stat-number">{chapterStructure.recommended}</span>
                <span className="stat-label">Recommended Chapters</span>
              </div>
              <div className="structure-stat">
                <span className="stat-number">{chapterStructure.min}-{chapterStructure.max}</span>
                <span className="stat-label">Chapter Range</span>
              </div>
              <div className="structure-stat">
                <span className="stat-number">{currentChapterCount}</span>
                <span className="stat-label">Generated So Far</span>
              </div>
            </div>
            <p className="structure-description">{chapterStructure.description}</p>
            <p className="words-per-chapter"><strong>Target:</strong> {chapterStructure.wordsPerChapter}</p>
            
            {currentChapterCount >= chapterStructure.max && (
              <div className="warning-message">
                ⚠️ <strong>Maximum chapters reached!</strong> You have {currentChapterCount} chapters, which is the maximum recommended for {quickGenData.wordCount}. Adding more may result in very short chapters.
              </div>
            )}
            
            {hasReachedRecommended && currentChapterCount < chapterStructure.max && (
              <div className="success-message">
                ✅ <strong>Good structure!</strong> You have {currentChapterCount} chapters, which meets the recommended count. You can add {chapterStructure.max - currentChapterCount} more if needed.
              </div>
            )}
            
            {currentChapterCount < chapterStructure.recommended && (
              <div className="info-message">
                💡 <strong>Keep going!</strong> You have {currentChapterCount} chapters. Consider adding {chapterStructure.recommended - currentChapterCount} more to reach the recommended {chapterStructure.recommended} chapters.
              </div>
            )}
          </div>
          
          <div className="outline-section">
            <div className="outline-controls">
              <button 
                onClick={handleQuickGenOutlineNext}
                className="btn-generate"
                disabled={loading || !canAddMore}
                title={!canAddMore ? `Maximum chapters (${chapterStructure.max}) reached for ${quickGenData.wordCount}` : ''}
              >
                {loading ? 'Generating Chapter... (GPT-4o-mini)' : 
                 !canAddMore ? `Max Chapters Reached (${chapterStructure.max})` :
                 `Generate Chapter ${quickGenData.outline.length + 1}`}
              </button>
              
              {quickGenData.outline.length > 0 && (
                <button 
                  onClick={() => setQuickGenStep(6)}
                  className="btn-next"
                >
                  Start Writing Chapters →
                </button>
              )}
            </div>
            
            {quickGenData.outline.length > 0 && (
              <div className="outline-preview">
                <h3>Generated Outline ({quickGenData.outline.length} chapters)</h3>
                {quickGenData.outline.map((chapter, index) => (
                  <div key={index} className="outline-chapter">
                    <h4>Chapter {index + 1}: {chapter.title}</h4>
                    <p><strong>Summary:</strong> {chapter.summary}</p>
                    <p><strong>Key Events:</strong> {chapter.keyEvents?.join(', ')}</p>
                    <p><strong>Characters:</strong> {chapter.characters?.join(', ')}</p>
                    <p><strong>Setting:</strong> {chapter.setting}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="step-controls">
              <button onClick={() => setQuickGenStep(3)} className="btn-back">
                ← Back
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Step 5: Chapter Generation (was step 6)
    if (quickGenStep === 6) {
      return (
        <div className="content-panel">
          <div className="panel-header">
            <h2>⚡ Quick Generate - Step 5/5</h2>
            <p>Generate your chapters</p>
          </div>
          
          <div className="chapter-section">
            <div className="chapter-controls">
              {quickGenData.chapters.length < quickGenData.outline.length && (
                <button 
                  onClick={() => handleQuickGenChapter(quickGenData.chapters.length + 1)}
                  className="btn-generate"
                  disabled={loading}
                >
                  {loading ? 'Writing Chapter... (GPT-4o)' : `Write Chapter ${quickGenData.chapters.length + 1}`}
                </button>
              )}
              
              {quickGenData.chapters.length === quickGenData.outline.length && quickGenData.chapters.length > 0 && (
                <div className="completion-controls">
                  <button onClick={acceptDraft} className="btn-accept">
                    ✅ Accept Draft
                  </button>
                  <div className="export-section">
                    <h4>📥 Export Options</h4>
                    <div className="export-controls">
                      <button onClick={exportToDocx} className="btn-export docx">
                        📄 Export to .docx
                      </button>
                      <button onClick={exportToPDF} className="btn-export pdf">
                        📕 Export to PDF
                      </button>
                      <button onClick={exportToGoogleDocs} className="btn-export html">
                        📝 Export for Google Docs
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <button onClick={resetQuickGen} className="btn-reset">
                🔄 Start New Project
              </button>
              
              {(quickGenData.outline.length > 0 || quickGenData.chapters.length > 0) && (
                <button onClick={clearGeneratedContent} className="btn-reset">
                  🗑️ Clear Generated Content
                </button>
              )}
            </div>
            
            <div className="progress-container">
              <div className="chapter-progress">
                <p>Progress: {quickGenData.chapters.length} of {quickGenData.outline.length} chapters written</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(quickGenData.chapters.length / quickGenData.outline.length) * 100}%` }}
                  ></div>
                </div>
                {quickGenData.chapters.length === quickGenData.outline.length && (
                  <p className="completion-message">🎉 Novel complete! Total words: ~{quickGenData.chapters.reduce((total, ch) => total + ch.content.split(' ').length, 0).toLocaleString()}</p>
                )}
              </div>
            </div>
            
            {quickGenData.chapters.length > 0 && (
              <div className="chapters-list">
                <h3>Written Chapters</h3>
                {quickGenData.chapters.map((chapter, index) => (
                  <div key={index} className="chapter-preview">
                    <h4>{chapter.title}</h4>
                    <p className="word-count">
                      {chapter.wordCount || getWordCount(chapter.content)} words
                      {chapter.targetWords && ` (target: ${chapter.targetWords.min}-${chapter.targetWords.max})`}
                    </p>
                    <div className="chapter-actions">
                      <button 
                        onClick={() => setGeneratedContent(chapter.content)}
                        className="btn-view"
                      >
                        📖 View Full Chapter
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(chapter.content)}
                        className="btn-copy"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="step-controls">
              <button onClick={() => setQuickGenStep(5)} className="btn-back">
                ← Back to Outline
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Fallback
    return (
      <div className="content-panel">
        <h2>Quick Generate</h2>
        <button onClick={() => setQuickGenStep(1)}>Start Quick Generate</button>
      </div>
    )
  }

  const renderAutoGenerate = () => {
    console.log('🔧 RENDERING AutoGenerate - Status:', autoGenData.status);
    console.log('🔧 AutoGenerate data:', autoGenData);
    
    // DEBUG: Add visible state display
    const debugInfo = (
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px'
      }}>
        <div>Status: {autoGenData.status}</div>
        <div>Genre: {autoGenData.genre || 'none'}</div>
        <div>Word Count: {autoGenData.wordCount || 'none'}</div>
      </div>
    );
    
    // Calculate time estimates
    const getTimeEstimate = (wordCount) => {
      const estimates = {
        'flash-fiction': { min: 2, max: 4 },
        'short-story': { min: 5, max: 10 },
        'novelette': { min: 15, max: 25 },
        'novella': { min: 30, max: 45 },
        'novel': { min: 60, max: 90 },
        'epic': { min: 120, max: 180 }
      };
      return estimates[wordCount] || { min: 60, max: 90 };
    };

    const timeEstimate = autoGenData.wordCount ? getTimeEstimate(autoGenData.wordCount) : null;
    const elapsedTime = autoGenData.startTime ? Math.floor((Date.now() - autoGenData.startTime) / 60000) : 0;
    const remainingTime = timeEstimate && autoGenData.progress > 0 
      ? Math.max(0, Math.floor((elapsedTime / autoGenData.progress * 100) - elapsedTime))
      : null;

    return (
      <div className="content-panel">
        {debugInfo}
        <div className="panel-header">
          <h2>🤖 AutoGenerate - Set It and Forget It</h2>
          <p>Generate a complete novel from a detailed synopsis automatically</p>
        </div>

        {(autoGenData.status === 'idle' || !autoGenData.status) && (
          <div className="auto-generate-setup">
            <div className="setup-section">
              <h3>🎭 1. Select Genre & Subgenre</h3>
              {autoGenData.genre && autoGenData.subgenre && (
                <div className="selection-display">
                  <span className="selected-genre">✅ {autoGenData.genre} - {autoGenData.subgenre}</span>
                  <button 
                    onClick={() => setAutoGenData(prev => ({ ...prev, genre: '', subgenre: '' }))}
                    className="btn-change"
                  >
                    Change
                  </button>
                </div>
              )}
              
              {(!autoGenData.genre || !autoGenData.subgenre) && (
                <div className="genre-selection">
                  <div className="genre-grid">
                    {Object.entries(genres).map(([genre, subgenres]) => (
                      <div key={genre} className="genre-card">
                        <h4>{genre}</h4>
                        <div className="subgenre-list">
                          {subgenres.map(subgenre => (
                            <button
                              key={subgenre}
                              className={`subgenre-btn ${autoGenData.genre === genre && autoGenData.subgenre === subgenre ? 'selected' : ''}`}
                              onClick={() => setAutoGenData(prev => ({ ...prev, genre, subgenre }))}
                            >
                              {subgenre}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="setup-section">
              <h3>📏 2. Choose Word Count</h3>
              {autoGenData.wordCount && (
                <div className="selection-display">
                  <span className="selected-wordcount">
                    ✅ {wordCounts.find(wc => wc.id === autoGenData.wordCount)?.name} 
                    ({wordCounts.find(wc => wc.id === autoGenData.wordCount)?.range})
                  </span>
                  <button 
                    onClick={() => setAutoGenData(prev => ({ ...prev, wordCount: '' }))}
                    className="btn-change"
                  >
                    Change
                  </button>
                </div>
              )}
              
              {!autoGenData.wordCount && (
                <div className="word-count-selection">
                  <div className="word-count-grid">
                    {wordCounts.map(wc => (
                      <div 
                        key={wc.id}
                        className={`word-count-card ${autoGenData.wordCount === wc.id ? 'selected' : ''}`}
                        onClick={() => setAutoGenData(prev => ({ ...prev, wordCount: wc.id }))}
                      >
                        <h4>{wc.name}</h4>
                        <p className="range">{wc.range}</p>
                        <p className="description">{wc.description}</p>
                        {wc.id === autoGenData.wordCount && timeEstimate && (
                          <p className="time-estimate">⏱️ ~{timeEstimate.min}-{timeEstimate.max} minutes</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Estimation Section */}
            {autoGenData.wordCount && (
              <div className="setup-section">
                <h3>💰 3. Cost Estimation</h3>
                <div className="cost-estimation">
                  <div className="cost-options">
                    <div className="cost-option standard">
                      <h4>🚀 Standard Processing</h4>
                      <div className="cost-breakdown">
                        <div className="cost-item">
                          <span>Synopsis Analysis:</span>
                          <span>${currentCostEstimate?.breakdown.synopsis.cost.toFixed(3)}</span>
                        </div>
                        <div className="cost-item">
                          <span>Chapter Outline:</span>
                          <span>${currentCostEstimate?.breakdown.outline.cost.toFixed(3)}</span>
                        </div>
                        <div className="cost-item">
                          <span>Chapter Writing:</span>
                          <span>${currentCostEstimate?.breakdown.chapters.cost.toFixed(2)}</span>
                        </div>
                        <div className="cost-total">
                          <span><strong>Total Cost:</strong></span>
                          <span><strong>${currentCostEstimate?.total.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <p className="processing-time">⏱️ ~{timeEstimate.min}-{timeEstimate.max} minutes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="setup-section">
              <h3>📝 4. Provide Your Detailed Synopsis</h3>
              <p className="synopsis-instructions">
                📚 <strong>For best results, provide a comprehensive synopsis (2000-5000 words) that includes:</strong>
              </p>
              <ul className="synopsis-checklist">
                <li>🎭 Main characters and their character arcs</li>
                <li>📈 Complete plot structure with key events</li>
                <li>🌍 Setting and world details</li>
                <li>⚔️ Major conflicts and how they resolve</li>
                <li>💭 Themes and overall tone</li>
                <li>🎬 Key scenes you want included</li>
              </ul>
              
              <textarea
                className="synopsis-input"
                placeholder="Paste your detailed synopsis here... 

Example start:
In the dystopian city of New Angeles, 2087, seventeen-year-old Maya Chen discovers she has the rare ability to manipulate digital networks with her mind. The world is controlled by the mega-corporation Nexus Corp, which has enslaved humanity through neural implants that monitor every thought and action.

Maya's story begins when..."
                rows={20}
                value={autoGenData.synopsis}
                onChange={(e) => setAutoGenData(prev => ({ ...prev, synopsis: e.target.value }))}
              />
              <div className="synopsis-stats">
                <span className="word-count">
                  📊 {getWordCount(autoGenData.synopsis)} words
                </span>
                {getWordCount(autoGenData.synopsis) < 1000 && getWordCount(autoGenData.synopsis) > 0 && (
                  <span className="warning">⚠️ Consider adding more detail for better results</span>
                )}
                {getWordCount(autoGenData.synopsis) >= 2000 && (
                  <span className="success">✅ Excellent detail level!</span>
                )}
              </div>
            </div>

            <div className="setup-section">
              <h3>🚀 5. Start Generation</h3>
              {autoGenData.genre && autoGenData.subgenre && autoGenData.wordCount && (
                <div className="generation-summary">
                  <div className="summary-card">
                    <h4>📋 Generation Summary</h4>
                    <div className="summary-details">
                      <p><strong>📚 Genre:</strong> {autoGenData.genre} - {autoGenData.subgenre}</p>
                      <p><strong>📏 Length:</strong> {wordCounts.find(wc => wc.id === autoGenData.wordCount)?.name} ({wordCounts.find(wc => wc.id === autoGenData.wordCount)?.range})</p>
                      <p><strong>📝 Synopsis:</strong> {getWordCount(autoGenData.synopsis)} words</p>
                      {timeEstimate && (
                        <p><strong>⏱️ Estimated Time:</strong> {timeEstimate.min}-{timeEstimate.max} minutes</p>
                      )}
                      {currentCostEstimate && (
                        <p><strong>💰 Estimated Cost:</strong> ${currentCostEstimate.total.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={startAutoGeneration}
                className="btn-generate-auto"
                disabled={!autoGenData.synopsis.trim() || !autoGenData.genre || !autoGenData.subgenre || !autoGenData.wordCount || getWordCount(autoGenData.synopsis) < 100}
              >
                {getWordCount(autoGenData.synopsis) < 100 ? 
                  '📝 Add Synopsis to Continue' :
                  '🚀 Generate Complete Novel'
                }
              </button>
              
              <div className="auto-gen-info">
                <h4>🔮 What happens next:</h4>
                <div className="process-steps">
                  <div className="process-step">
                    <span className="step-icon">🧠</span>
                    <div className="step-content">
                      <h5>AI Analysis</h5>
                      <p>Advanced AI analyzes your synopsis for characters, themes, and structure</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-icon">📋</span>
                    <div className="step-content">
                      <h5>Chapter Planning</h5>
                      <p>Creates detailed chapter-by-chapter outline with proper pacing</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-icon">✍️</span>
                    <div className="step-content">
                      <h5>Chapter Writing</h5>
                      <p>Writes each chapter with "show, don't tell" storytelling techniques</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <span className="step-icon">📚</span>
                    <div className="step-content">
                      <h5>Final Assembly</h5>
                      <p>Delivers complete, export-ready novel in multiple formats</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="setup-section">
              <h3>🔬 Advanced AI Writing Technology</h3>
              <p>Your novel will be generated using cutting-edge anti-AI techniques to ensure human-like quality:</p>
              
              <div className="ai-features-grid">
                <div className="ai-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">🎨</span>
                    <h4>Descriptive Pattern Diversity</h4>
                  </div>
                  <ul className="feature-list">
                    <li>40+ unique sensory description banks for each setting</li>
                    <li>Smart tracking prevents repetitive environmental language</li>
                    <li>Character-filtered descriptions based on perspective</li>
                    <li>Time-sensitive descriptions that evolve with the story</li>
                  </ul>
                </div>

                <div className="ai-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">💬</span>
                    <h4>Individualized Character Voices</h4>
                  </div>
                  <ul className="feature-list">
                    <li>Unique vocabulary sets for each character's background</li>
                    <li>Distinct speech patterns and conversation styles</li>
                    <li>Dynamic topic distribution prevents repetitive dialogue</li>
                    <li>Character-specific dialogue initiators and responses</li>
                  </ul>
                </div>

                <div className="ai-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">📖</span>
                    <h4>Dynamic Chapter Structures</h4>
                  </div>
                  <ul className="feature-list">
                    <li>12+ distinct chapter opening approaches</li>
                    <li>8+ different chapter conclusion types</li>
                    <li>Automatic pattern breaking across consecutive chapters</li>
                    <li>Timeline jumps and narrative focus variation</li>
                  </ul>
                </div>

                <div className="ai-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">🎭</span>
                    <h4>Advanced Narrative Controls</h4>
                  </div>
                  <ul className="feature-list">
                    <li>Surprise elements integrated naturally into each chapter</li>
                    <li>Character growth tracking for non-repetitive development</li>
                    <li>Variable tension curves prevent monotone storytelling</li>
                    <li>Subplot rotation system maintains narrative balance</li>
                  </ul>
                </div>

                <div className="ai-feature-card">
                  <div className="feature-header">
                    <span className="feature-icon">✍️</span>
                    <h4>Stylistic Variation Engine</h4>
                  </div>
                  <ul className="feature-list">
                    <li>Dynamic sentence length and paragraph structure</li>
                    <li>Scene-specific pacing guidelines for different moods</li>
                    <li>Metaphor diversity checks prevent overused comparisons</li>
                    <li>Word frequency monitoring across chapters</li>
                  </ul>
                </div>

                <div className="ai-feature-card highlight">
                  <div className="feature-header">
                    <span className="feature-icon">🚀</span>
                    <h4>Result: Human-Quality Fiction</h4>
                  </div>
                  <div className="feature-highlight">
                    <p><strong>This technology eliminates common AI writing problems:</strong></p>
                    <ul className="highlight-list">
                      <li>❌ Repetitive phrases and formulaic patterns</li>
                      <li>❌ Robotic dialogue and similar character voices</li>
                      <li>❌ Predictable chapter structures and transitions</li>
                      <li>❌ Monotone pacing and mechanical descriptions</li>
                    </ul>
                    <p><strong>✅ Your novel will feel authentically human-written!</strong></p>
                  </div>
                </div>
              </div>

              <div className="technology-note">
                <p><strong>💡 How it works:</strong> Each chapter is generated with unique enhancement instructions 
                that vary opening styles, character voices, descriptive patterns, and narrative techniques. 
                The system tracks recent usage patterns and forces variation to prevent the repetitive, 
                formulaic writing common in standard AI-generated fiction.</p>
              </div>
            </div>

            <div className="setup-section">
              <h3>🧪 Test Connection</h3>
              <p>Verify the AutoGenerate system is working properly:</p>
              <button 
                onClick={testAutoGenerate}
                className="btn-secondary"
              >
                🔧 Test AutoGenerate Function
              </button>
            </div>
          </div>
        )}

        {autoGenData.status === 'processing' && (
          <div className="auto-generate-progress">
            <div className="progress-header">
              <h3>🔄 Generating Your Novel...</h3>
              <p>Sit back and relax! Your {autoGenData.genre} {autoGenData.subgenre} novel is being crafted.</p>
              {autoGenData.jobId && (
                <p className="job-id">🔗 Job ID: <code>{autoGenData.jobId}</code></p>
              )}
            </div>
            
            <div className="progress-visual">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${autoGenData.progress || 0}%` }}
                >
                  <span className="progress-text">{autoGenData.progress || 0}%</span>
                </div>
              </div>
              
              <div className="progress-details">
                <div className="progress-info-grid">
                  <div className="info-item">
                    <span className="info-label">Current Phase:</span>
                    <span className="info-value">{autoGenData.currentPhase || 'Initializing...'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Progress:</span>
                    <span className="info-value">{autoGenData.progress || 0}% Complete</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Elapsed Time:</span>
                    <span className="info-value">{elapsedTime} minutes</span>
                  </div>
                  {remainingTime !== null && (
                    <div className="info-item">
                      <span className="info-label">Est. Remaining:</span>
                      <span className="info-value">{remainingTime} minutes</span>
                    </div>
                  )}
                  {autoGenData.lastUpdate && (
                    <div className="info-item">
                      <span className="info-label">Last Update:</span>
                      <span className="info-value">{new Date(autoGenData.lastUpdate).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Enhancement Features Display */}
              <div className="ai-enhancements-info">
                <h4>🧠 Human-Like Writing Enhancements Active</h4>
                <div className="enhancement-grid">
                  <div className="enhancement-item">
                    <span className="enhancement-icon">🎨</span>
                    <div className="enhancement-content">
                      <h5>Descriptive Diversity</h5>
                      <p>Tracking 40+ unique sensory descriptions to avoid repetition</p>
                    </div>
                  </div>
                  <div className="enhancement-item">
                    <span className="enhancement-icon">💬</span>
                    <div className="enhancement-content">
                      <h5>Character Voices</h5>
                      <p>Unique vocabulary and speech patterns for each character</p>
                    </div>
                  </div>
                  <div className="enhancement-item">
                    <span className="enhancement-icon">📖</span>
                    <div className="enhancement-content">
                      <h5>Chapter Variation</h5>
                      <p>12+ opening styles, 12+ ending types to break AI patterns</p>
                    </div>
                  </div>
                  <div className="enhancement-item">
                    <span className="enhancement-icon">🎭</span>
                    <div className="enhancement-content">
                      <h5>Narrative Control</h5>
                      <p>Surprise elements and tension curves for organic storytelling</p>
                    </div>
                  </div>
                  <div className="enhancement-item">
                    <span className="enhancement-icon">✍️</span>
                    <div className="enhancement-content">
                      <h5>Style Variation</h5>
                      <p>Dynamic pacing, sentence structure, and paragraph flow</p>
                    </div>
                  </div>
                </div>
                <p className="enhancement-note">
                  <strong>💡 What this means:</strong> Your novel is being written with advanced anti-AI techniques 
                  that make it feel authentically human-written, avoiding repetitive patterns and formulaic structures 
                  common in AI-generated fiction.
                </p>
              </div>
            </div>
            
            <div className="generation-stats">
              <div className="stat-card">
                <h4>🎭 Genre</h4>
                <p>{autoGenData.genre}<br/><small>{autoGenData.subgenre}</small></p>
              </div>
              <div className="stat-card">
                <h4>📏 Target Length</h4>
                <p>{wordCounts.find(wc => wc.id === autoGenData.wordCount)?.name}</p>
              </div>
              <div className="stat-card">
                <h4>⏰ Started</h4>
                <p>{autoGenData.startTime ? new Date(autoGenData.startTime).toLocaleTimeString() : 'Unknown'}</p>
              </div>
              {timeEstimate && (
                <div className="stat-card">
                  <h4>🕒 Est. Duration</h4>
                  <p>{timeEstimate.min}-{timeEstimate.max} min</p>
                </div>
              )}
            </div>
            
            <div className="progress-actions">
              <button 
                onClick={cancelAutoGenerate}
                className="btn-cancel"
                disabled={!autoGenData.jobId}
              >
                🛑 Cancel Generation
              </button>
              <button 
                onClick={resetAutoGenerate}
                className="btn-secondary"
              >
                🔄 Reset & Start Over
              </button>
            </div>

            <div className="progress-tips">
              <h4>💡 While You Wait:</h4>
              <ul>
                <li>🔄 This page will automatically update with progress</li>
                <li>📱 Feel free to switch tabs or minimize the browser</li>
                <li>⏰ Longer novels take more time but produce better quality</li>
                <li>🎨 The AI is crafting each chapter with care and detail</li>
              </ul>
            </div>
          </div>
        )}

        {autoGenData.status === 'complete' && autoGenData.novel && (
          <div className="auto-generate-complete">
            <div className="completion-header">
              <h3>🎉 Novel Generation Complete!</h3>
              <p>Your {autoGenData.novel.genre} novel has been successfully generated and is ready for download.</p>
            </div>
            
            <div className="novel-stats">
              <div className="stat-card">
                <h4>📚 Chapters</h4>
                <p>{autoGenData.novel.chapters.length}</p>
              </div>
              <div className="stat-card">
                <h4>📝 Total Words</h4>
                <p>{autoGenData.novel.metadata.totalWords.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h4>🎭 Genre</h4>
                <p>{autoGenData.novel.genre}<br/><small>{autoGenData.novel.subgenre}</small></p>
              </div>
              <div className="stat-card">
                <h4>⏰ Generated</h4>
                <p>{new Date(autoGenData.novel.metadata.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="export-section">
              <h4>📥 Download Your Novel</h4>
              <div className="export-controls">
                <button 
                  onClick={() => exportAutoGeneratedNovel('docx')} 
                  className="btn-export docx"
                >
                  📄 Download .docx
                </button>
                <button 
                  onClick={() => exportAutoGeneratedNovel('pdf')} 
                  className="btn-export pdf"
                >
                  📕 Download PDF
                </button>
                <button 
                  onClick={() => exportAutoGeneratedNovel('html')} 
                  className="btn-export html"
                >
                  📝 Export for Google Docs
                </button>
              </div>
            </div>
            
            <div className="chapter-preview">
              <h4>📖 Chapter Preview</h4>
              <div className="chapter-list">
                {autoGenData.novel.chapters.slice(0, 3).map((chapter, index) => (
                  <div key={index} className="chapter-preview-item">
                    <h5>Chapter {chapter.chapterNumber || chapter.number || index + 1}: {chapter.title}</h5>
                    <p className="chapter-summary">{chapter.summary}</p>
                    <p className="chapter-stats">{chapter.wordCount} words</p>
                    <button 
                      onClick={() => setGeneratedContent(chapter.content)}
                      className="btn-view-chapter"
                    >
                      📖 View Full Chapter
                    </button>
                  </div>
                ))}
                {autoGenData.novel.chapters.length > 3 && (
                  <p className="more-chapters">
                    ... and {autoGenData.novel.chapters.length - 3} more chapters
                  </p>
                )}
              </div>
              
              <div className="full-novel-preview">
                <button 
                  onClick={() => {
                    const fullContent = autoGenData.novel.chapters
                      .map(ch => `Chapter ${ch.chapterNumber || ch.number}: ${ch.title}\n\n${ch.content}`)
                      .join('\n\n---\n\n');
                    setGeneratedContent(fullContent);
                  }}
                  className="btn-view-full"
                >
                  📖 View Complete Novel
                </button>
              </div>
            </div>
            
            <div className="action-controls">
              <button 
                onClick={resetAutoGenerate}
                className="btn-new-novel"
              >
                🔄 Generate Another Novel
              </button>
            </div>
          </div>
        )}

        {autoGenData.status === 'error' && (
          <div className="auto-generate-error">
            <h3>❌ Generation Failed</h3>
            <div className="error-details">
              <p className="error-message">{autoGenData.error}</p>
              <p>Please try again or contact support if the problem persists.</p>
              
              {autoGenData.jobId && (
                <p className="job-reference">Reference Job ID: <code>{autoGenData.jobId}</code></p>
              )}
            </div>
            
            <div className="error-actions">
              <button 
                onClick={resetAutoGenerate}
                className="btn-retry"
              >
                🔄 Try Again
              </button>
              <button 
                onClick={testAutoGenerate}
                className="btn-secondary"
              >
                🧪 Test Connection
              </button>
            </div>
          </div>
        )}

        {autoGenData.status === 'cancelled' && (
          <div className="auto-generate-cancelled">
            <h3>🛑 Generation Cancelled</h3>
            <p>Novel generation was cancelled by the user.</p>
            <p>You can start a new generation at any time.</p>
            
            <div className="cancelled-actions">
              <button 
                onClick={resetAutoGenerate}
                className="btn-new-novel"
              >
                🚀 Start New Generation
              </button>
            </div>
          </div>
        )}

        {/* Generated Content Display */}
        {generatedContent && (
          <div className="generated-content-section">
            <h4>📖 Generated Content</h4>
            <div className="content-viewer">
              <pre className="content-text">{generatedContent}</pre>
              <button 
                onClick={() => setGeneratedContent('')}
                className="btn-close-content"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}

        {/* Writing Status with Constellation Animation */}
        {(autoGenData.status === 'writing' || autoGenData.status === 'outlining') && (
          <div className="auto-generate-writing">
            <div className="writing-header">
              <h3>✨ Constellation of Stories</h3>
              <p>
                {autoGenData.currentPhase === 'outlining'
                  ? `📋 Outlining Chapter ${autoGenData.currentChapter || 1}: ${autoGenData.currentChapterTitle || 'Mapping the story structure...'}` 
                  : autoGenData.currentPhase === 'writing'
                    ? `✍️ Writing Chapter ${autoGenData.currentChapter || 1}: ${autoGenData.currentChapterTitle || 'Crafting the narrative...'}` 
                    : `Your ${autoGenData.genre} ${autoGenData.subgenre} novel is being woven among the stars...`}
              </p>
            </div>
            
            <div className="constellation-container">
              <div className="constellation-spinner">
                <svg width="400" height="300" viewBox="0 0 400 300" className="constellation-svg">
                  {/* Generate constellation stars based on estimated chapters */}
                  {(() => {
                    const estimatedChapters = autoGenData.estimatedChapters || autoGenData.totalChapters || 12;
                    const stars = [];
                    const connections = [];
                    
                    // Generate dynamic star positions in a constellation pattern
                    const generatePositions = (numChapters) => {
                      const positions = [{ x: 200, y: 30, label: "Start" }];
                      
                      // Calculate positions in a spiral/constellation pattern
                      const centerX = 200;
                      const centerY = 150;
                      const radiusBase = 80;
                      const spiralFactor = 1.2;
                      
                      for (let i = 1; i <= numChapters; i++) {
                        const angle = (i - 1) * (2 * Math.PI / Math.max(6, numChapters * 0.8));
                        const radius = radiusBase + (i - 1) * (spiralFactor * 10);
                        const x = Math.max(30, Math.min(370, centerX + radius * Math.cos(angle)));
                        const y = Math.max(50, Math.min(250, centerY + radius * Math.sin(angle)));
                        
                        positions.push({
                          x: x,
                          y: y,
                          label: `Ch${i}`
                        });
                      }
                      
                      positions.push({ x: 200, y: 280, label: "End" });
                      return positions;
                    };
                    
                    const activePositions = generatePositions(estimatedChapters);
                    
                    // Create connections between consecutive stars
                    for (let i = 0; i < activePositions.length - 1; i++) {
                      const current = activePositions[i];
                      const next = activePositions[i + 1];
                      const isActive = (autoGenData.currentChapter || 0) > i;
                      const isAnimating = (autoGenData.currentChapter || 0) === i + 1 && autoGenData.currentPhase;
                      
                      connections.push(
                        <line
                          key={`connection-${i}`}
                          x1={current.x}
                          y1={current.y}
                          x2={next.x}
                          y2={next.y}
                          stroke={isActive ? "#4CAF50" : isAnimating ? "#FFD700" : "#444"}
                          strokeWidth={isAnimating ? "3" : "2"}
                          className={`constellation-line ${isActive ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
                          opacity={isActive ? 1 : isAnimating ? 0.8 : 0.3}
                          style={{
                            transition: "stroke 0.5s ease, stroke-width 0.5s ease, opacity 0.5s ease",
                            filter: isAnimating ? "drop-shadow(0 0 6px #FFD700)" : isActive ? "drop-shadow(0 0 4px #4CAF50)" : "none"
                          }}
                        />
                      );
                    }
                    
                    // Create stars
                    activePositions.forEach((pos, index) => {
                      const isActive = (autoGenData.currentChapter || 0) >= index;
                      const isWritten = (autoGenData.chaptersWritten || 0) > index;
                      const isOutlined = (autoGenData.chaptersOutlined || 0) > index;
                      const isCurrent = (autoGenData.currentChapter || 0) === index;
                      const isCurrentlyOutlining = isCurrent && autoGenData.currentPhase === 'outlining';
                      const isCurrentlyWriting = isCurrent && autoGenData.currentPhase === 'writing';
                      
                      // Determine star color and size
                      let fillColor = "#666"; // Default
                      let radius = "6"; // Default
                      let className = "constellation-star";
                      
                      if (isWritten) {
                        fillColor = "#4CAF50"; // Green for written
                        className += " written";
                      } else if (isCurrentlyWriting) {
                        fillColor = "#FF6B35"; // Orange for currently writing
                        radius = "10";
                        className += " current writing pulse-writing";
                      } else if (isOutlined) {
                        fillColor = "#2196F3"; // Blue for outlined
                        className += " outlined";
                      } else if (isCurrentlyOutlining) {
                        fillColor = "#FFD700"; // Gold for currently outlining
                        radius = "9";
                        className += " current outlining pulse-outlining";
                      } else if (isActive) {
                        fillColor = "#FFD700"; // Gold for active
                        className += " active";
                      }
                      
                      stars.push(
                        <g key={`star-${index}`}>
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={radius}
                            fill={fillColor}
                            className={className}
                            style={{
                              transition: "r 0.3s ease, fill 0.3s ease",
                              filter: (isCurrentlyWriting || isCurrentlyOutlining) 
                                ? `drop-shadow(0 0 12px ${fillColor})` 
                                : isWritten 
                                  ? "drop-shadow(0 0 6px #4CAF50)"
                                  : "none"
                            }}
                          />
                          <text
                            x={pos.x}
                            y={pos.y - 15}
                            textAnchor="middle"
                            fontSize="10"
                            fill={isActive ? "#fff" : "#888"}
                            className="constellation-label"
                            style={{
                              fontWeight: isCurrent ? "bold" : "normal",
                              transition: "fill 0.3s ease"
                            }}
                          >
                            {pos.label}
                          </text>
                          
                          {/* Add progress indicator for current chapter */}
                          {isCurrent && (
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r="14"
                              fill="none"
                              stroke={isCurrentlyWriting ? "#FF6B35" : "#FFD700"}
                              strokeWidth="2"
                              opacity="0.6"
                              className="progress-ring"
                              style={{
                                animation: "pulse-ring 2s infinite"
                              }}
                            />
                          )}
                        </g>
                      );
                    });
                    
                    return [...connections, ...stars];
                  })()}
                  
                  {/* Twinkling effect */}
                  <circle
                    cx="200"
                    cy="30"
                    r="2"
                    fill="#fff"
                    className="twinkle-star"
                    style={{ animationDelay: '0s' }}
                  />
                  <circle
                    cx="350"
                    cy="40"
                    r="1.5"
                    fill="#fff"
                    className="twinkle-star"
                    style={{ animationDelay: '1s' }}
                  />
                  <circle
                    cx="30"
                    cy="80"
                    r="1"
                    fill="#fff"
                    className="twinkle-star"
                    style={{ animationDelay: '2s' }}
                  />
                </svg>
              </div>
              
              <div className="constellation-status">
                <div className="current-phase">
                  {autoGenData.currentPhase === 'outlining' && (
                    <p className="phase-text">
                      📋 <span className="highlight pulsing">Outlining Chapter {autoGenData.currentChapter || 1}</span>
                      {autoGenData.currentChapterTitle && (
                        <><br/><span className="chapter-title">"{autoGenData.currentChapterTitle}"</span></>
                      )}
                    </p>
                  )}
                  {autoGenData.currentPhase === 'writing' && (
                    <p className="phase-text">
                      ✍️ <span className="highlight pulsing">Writing Chapter {autoGenData.currentChapter || 1}</span>
                      {autoGenData.currentChapterTitle && (
                        <><br/><span className="chapter-title">"{autoGenData.currentChapterTitle}"</span></>
                      )}
                    </p>
                  )}
                  {autoGenData.currentPhase === 'analyzing' && (
                    <p className="phase-text">
                      🧠 <span className="highlight pulsing">Analyzing story structure...</span>
                    </p>
                  )}
                  {!autoGenData.currentPhase && (
                    <p className="phase-text">
                      🌌 <span className="highlight">Mapping your story constellation...</span>
                    </p>
                  )}
                </div>
                
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-icon">📋</span>
                    <span className="stat-text">Outlined: {autoGenData.chaptersOutlined || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">✍️</span>
                    <span className="stat-text">Written: {autoGenData.chaptersWritten || 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⏱️</span>
                    <span className="stat-text">Time: {elapsedTime}m</span>
                  </div>
                </div>
                
                {timeEstimate && (
                  <p className="time-estimate">
                    Estimated completion: {timeEstimate.min}-{timeEstimate.max} minutes
                    {remainingTime !== null && (
                      <span className="remaining-time"> • ~{remainingTime} min remaining</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="writing-details">
              <div className="detail-card">
                <h4>📖 Novel Details</h4>
                <p><strong>Genre:</strong> {autoGenData.genre} - {autoGenData.subgenre}</p>
                <p><strong>Length:</strong> {autoGenData.wordCount}</p>
                <p><strong>Started:</strong> {autoGenData.startTime ? new Date(autoGenData.startTime).toLocaleTimeString() : 'Unknown'}</p>
              </div>
              
              <div className="detail-card">
                <h4>⚙️ System Status</h4>
                <p><strong>Status:</strong> <span className="status-writing">Writing</span></p>
                <p><strong>Phase:</strong> {autoGenData.currentPhase || 'Chapter Generation'}</p>
                <p><strong>Progress:</strong> {autoGenData.progress || 0}%</p>
              </div>
            </div>

            <div className="writing-actions">
              <button 
                onClick={() => setAutoGenData(prev => ({ ...prev, status: 'idle' }))}
                className="btn-secondary"
              >
                🛑 Cancel Generation
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="btn-tertiary"
              >
                🔄 Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Debug/Fallback Section */}
        {!['idle', 'processing', 'complete', 'error', 'cancelled', 'writing', 'outlining'].includes(autoGenData.status) && (
          <div className="setup-section">
            <h3>🔧 Debug Information</h3>
            <p>Current status: <strong>{autoGenData.status || 'undefined'}</strong></p>
            <p>This is a fallback display for debugging. The status should be 'idle'.</p>
            <button 
              onClick={() => setAutoGenData(prev => ({ ...prev, status: 'idle' }))}
              className="btn-primary"
            >
              Reset to Idle Status
            </button>
          </div>
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'home': return renderHome()
      case 'story-bible': return renderStoryBible()
      case 'characters': return renderCharacters()
      case 'worldbuilding': return renderWorldbuilding()
      case 'outline': return renderOutline()
      case 'scenes': return renderScenes()
      case 'generator': return renderGenerator()
      case 'auto-generate': 
        try {
          return renderAutoGenerate()
        } catch (error) {
          console.error('🚨 AutoGenerate render error:', error);
          return (
            <div className="content-panel" style={{ padding: '20px', background: 'white' }}>
              <h2 style={{ color: 'red' }}>🚨 AutoGenerate Error</h2>
              <p>There was an error rendering the AutoGenerate interface:</p>
              <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                {error.toString()}
              </pre>
              <button 
                onClick={() => window.location.reload()} 
                style={{ padding: '10px 20px', background: '#007acc', color: 'white', border: 'none', borderRadius: '5px' }}
              >
                🔄 Reload Page
              </button>
            </div>
          )
        }
      default: return renderHome()
    }
  }

  // AutoGenerate API Functions with Polling
  const startAutoGeneration = async () => {
    if (!autoGenData.synopsis.trim() || !autoGenData.genre || !autoGenData.subgenre || !autoGenData.wordCount) {
      showDetailedError(
        'Validation Error',
        'Missing required fields for novel generation',
        new Error('Required fields not filled'),
        'Please fill in all required fields: Synopsis, Genre, Subgenre, and Word Count',
        'startAutoGeneration'
      );
      return;
    }

    // Reset state and start processing
    setAutoGenData(prev => ({
      ...prev,
      status: 'initializing',
      progress: 0,
      currentPhase: 'Preparing to generate...',
      error: null
    }));

    try {
      console.log('Starting AutoGeneration with data:', {
        synopsis: autoGenData.synopsis.substring(0, 100) + '...',
        genre: autoGenData.genre,
        subgenre: autoGenData.subgenre,
        wordCount: autoGenData.wordCount
      });

      // Get batch processing preference
      const processingType = document.querySelector('input[name="processingType"]:checked')?.value || 'standard';
      const useBatch = processingType === 'batch';

      const requestBody = {
        mode: 'start',
        synopsis: autoGenData.synopsis,
        genre: autoGenData.genre,
        subgenre: autoGenData.subgenre,
        wordCount: autoGenData.wordCount,
        useBatch: useBatch,
        userPreferences: {
          writingStyle: 'literary',
          pacing: 'measured',
          detailLevel: 'rich'
        }
      };

      console.log('Sending start request to autoGenerateNovel function...');
      
      const response = await fetch('/.netlify/functions/autoGenerateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Start response received:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP Error Response Body:', errorText);
        
        let errorDetails;
        try {
          errorDetails = JSON.parse(errorText);
        } catch (e) {
          errorDetails = { rawError: errorText };
        }

        const detailedError = `
🚨 AutoGenerate Start Error:

HTTP Status: ${response.status} ${response.statusText}
URL: ${response.url}

Error Response:
${JSON.stringify(errorDetails, null, 2)}

Request Data:
- Genre: ${autoGenData.genre}
- Subgenre: ${autoGenData.subgenre}
- Word Count: ${autoGenData.wordCount}
- Synopsis Length: ${autoGenData.synopsis.length} characters

Timestamp: ${new Date().toISOString()}
        `;

        throw new Error(detailedError);
      }

      const result = await response.json();
      console.log('Start response parsed:', result);

      if (result.status === 'started' && result.jobId) {
        // Update state with job info and start polling
        setAutoGenData(prev => ({
          ...prev,
          jobId: result.jobId,
          status: 'processing',
          progress: 5,
          currentPhase: 'Job started, waiting for progress...',
          estimatedTimeMinutes: result.estimatedTimeMinutes || 0,
          pollUrl: result.pollUrl,
          startTime: Date.now()
        }));

        // Start polling for job status
        startJobPolling(result.jobId);
      } else {
        throw new Error(`Unexpected start response: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      const errorReport = showDetailedError(error, {
        function: 'startAutoGeneration',
        operation: 'Starting AutoGenerate job',
        requestData: {
          mode: 'start',
          genre: autoGenData.genre,
          subgenre: autoGenData.subgenre,
          wordCount: autoGenData.wordCount,
          synopsisLength: autoGenData.synopsis?.length || 0,
          useBatch: document.querySelector('input[name="processingType"]:checked')?.value === 'batch'
        },
        apiEndpoint: '/.netlify/functions/autoGenerateNovel'
      });

      setAutoGenData(prev => ({
        ...prev,
        status: 'error',
        error: errorReport,
        currentPhase: 'Generation failed - See detailed error report'
      }));
    }
  };

  // Start polling for job status
  const startJobPolling = (jobId) => {
    console.log(`Starting polling for job ${jobId}`);
    
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 3 seconds
    const interval = setInterval(async () => {
      await pollJobStatus(jobId);
    }, 3000);

    setPollingInterval(interval);

    // Also poll immediately
    pollJobStatus(jobId);
  };

  // Poll job status
  const pollJobStatus = async (jobId) => {
    try {
      console.log(`Polling status for job ${jobId}`);
      
      const response = await fetch('/.netlify/functions/autoGenerateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'status',
          jobId
        })
      });

      if (!response.ok) {
        console.error(`Polling failed: ${response.status} ${response.statusText}`);
        return;
      }

      const result = await response.json();
      console.log(`Job ${jobId} status:`, result);

      // Update state with latest status
      setAutoGenData(prev => ({
        ...prev,
        status: result.status,
        progress: result.progress || prev.progress,
        currentPhase: result.currentPhase || result.message || prev.currentPhase,
        lastUpdate: result.lastUpdate,
        error: result.error || prev.error,
        novel: result.novel || prev.novel,
        // Add detailed progress tracking
        currentChapter: result.currentChapter || prev.currentChapter,
        currentChapterTitle: result.currentChapterTitle || prev.currentChapterTitle,
        chaptersOutlined: result.chaptersOutlined || prev.chaptersOutlined,
        chaptersWritten: result.chaptersWritten || prev.chaptersWritten,
        estimatedChapters: result.estimatedChapters || prev.estimatedChapters,
        totalChapters: result.totalChapters || prev.totalChapters,
        estimatedWordsWritten: result.estimatedWordsWritten || prev.estimatedWordsWritten
      }));

      // Check if job is complete or failed
      if (result.status === 'complete') {
        console.log('Job completed successfully!');
        stopJobPolling();
        
        setAutoGenData(prev => ({
          ...prev,
          status: 'complete',
          progress: 100,
          currentPhase: 'Novel generation complete!',
          novel: result.novel
        }));
        
      } else if (result.status === 'error' || result.status === 'cancelled') {
        console.log(`Job ${result.status}:`, result.error);
        stopJobPolling();
        
        setAutoGenData(prev => ({
          ...prev,
          status: result.status,
          error: result.error || `Job ${result.status}`,
          currentPhase: `Generation ${result.status}`
        }));
      }

    } catch (error) {
      console.error('Polling error:', error);
      generateDetailedErrorReport(error, {
        function: 'pollJobStatus',
        operation: 'Polling job status',
        jobId: jobId,
        currentStatus: autoGenData.status,
        note: 'Polling will continue despite error'
      });
      // Don't stop polling on network errors, just log and continue
    }
  };

  // Stop job polling
  const stopJobPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      console.log('Stopped job polling');
    }
  };

  // Cancel job
  const cancelAutoGenerate = async () => {
    if (!autoGenData.jobId) {
      return;
    }

    try {
      console.log(`Cancelling job ${autoGenData.jobId}`);
      
      const response = await fetch('/.netlify/functions/autoGenerateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'cancel',
          jobId: autoGenData.jobId
        })
      });

      const result = await response.json();
      console.log('Cancel response:', result);

      stopJobPolling();
      
      setAutoGenData(prev => ({
        ...prev,
        status: 'cancelled',
        currentPhase: 'Generation cancelled by user'
      }));

    } catch (error) {
      const errorReport = showDetailedError(error, {
        function: 'cancelAutoGenerate',
        operation: 'Cancelling AutoGenerate job',
        jobId: autoGenData.jobId,
        currentStatus: autoGenData.status
      });
    }
  };

  // Clean up polling on component unmount
  useEffect(() => {
    return () => {
      stopJobPolling();
    };
  }, [pollingInterval]);

  const resetAutoGenerate = () => {
    // Stop any active polling
    stopJobPolling();
    
    setAutoGenData({
      genre: '',
      subgenre: '',
      wordCount: '',
      synopsis: '',
      jobId: null,
      status: 'idle',
      progress: 0,
      currentPhase: '',
      novel: null,
      error: null,
      estimatedTimeMinutes: 0,
      pollUrl: null,
      startTime: null,
      lastUpdate: null
    });
  };

  const exportAutoGeneratedNovel = async (format) => {
    if (!autoGenData.novel || !autoGenData.novel.chapters) {
      alert('❌ No novel available to export. Please generate a novel first.');
      return;
    }

    const novel = autoGenData.novel;
    
    try {
      if (format === 'docx') {
        await exportAutoNovelToDocx(novel);
      } else if (format === 'pdf') {
        await exportAutoNovelToPDF(novel);
      } else if (format === 'html') {
        await exportAutoNovelToHTML(novel);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`❌ Export failed: ${error.message}`);
    }
  };

  // Export AutoGenerated Novel to DOCX
  const exportAutoNovelToDocx = async (novel) => {
    try {
      console.log('Exporting novel to DOCX...', novel);
      
      // Dynamic import to avoid build issues
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak } = await import('docx')
      const { saveAs } = await import('file-saver')
      
      const children = []
      
      // Title page
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 1440, after: 720 },
          children: [
            new TextRun({
              text: novel.title || `${novel.genre} Novel`,
              size: 48,
              bold: true
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Genre: ${novel.genre} - ${novel.subgenre}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 240 },
          children: [
            new TextRun({
              text: `Total Words: ${novel.metadata.totalWords.toLocaleString()}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: `Generated: ${new Date(novel.metadata.generatedAt).toLocaleDateString()}`,
              size: 28
            })
          ]
        }),
        new Paragraph({
          children: [new PageBreak()]
        })
      )
      
      // Synopsis
      if (novel.synopsis) {
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { before: 720, after: 480 },
            children: [
              new TextRun({
                text: "Synopsis",
                size: 32,
                bold: true
              })
            ]
          })
        )
        
        const synopsisParas = novel.synopsis.split('\n\n')
        synopsisParas.forEach(para => {
          if (para.trim()) {
            children.push(
              new Paragraph({
                spacing: { after: 240 },
                alignment: AlignmentType.JUSTIFIED,
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 24
                  })
                ]
              })
            )
          }
        })
        
        // Add page break after synopsis
        children.push(new Paragraph({ children: [new PageBreak()] }))
      }
      
      // Chapters
      novel.chapters.forEach((chapter, index) => {
        // Chapter title
        children.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 720, after: 480 },
            children: [
              new TextRun({
                text: `Chapter ${chapter.chapterNumber || chapter.number || index + 1}: ${chapter.title}`,
                size: 32,
                bold: true
              })
            ]
          })
        )
        
        // Chapter content
        const contentParas = chapter.content.split('\n\n')
        contentParas.forEach(para => {
          if (para.trim()) {
            children.push(
              new Paragraph({
                spacing: { after: 240 },
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 360 }, // 0.25 inch first line indent
                children: [
                  new TextRun({
                    text: para.trim(),
                    size: 24
                  })
                ]
              })
            )
          }
        })
        
        // Page break after each chapter except the last
        if (index < novel.chapters.length - 1) {
          children.push(new Paragraph({ children: [new PageBreak()] }))
        }
      })
      
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440    // 1 inch
              }
            }
          },
          children: children
        }]
      })
      
      const buffer = await Packer.toBlob(doc)
      const filename = `${novel.title || novel.genre + '_Novel'}_${new Date().toISOString().split('T')[0]}.docx`
      saveAs(buffer, filename)
      
      alert(`✅ Novel exported successfully as ${filename}`)
      
    } catch (error) {
      console.error('DOCX export error:', error)
      throw new Error(`DOCX export failed: ${error.message}`)
    }
  }

  // Export AutoGenerated Novel to PDF
  const exportAutoNovelToPDF = async (novel) => {
    try {
      const { jsPDF } = await import('jspdf')
      const { saveAs } = await import('file-saver')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // Add title page
      pdf.setFontSize(24)
      pdf.text(novel.title || `${novel.genre} Novel`, 105, 50, { align: 'center' })
      pdf.setFontSize(16)
      pdf.text(`Genre: ${novel.genre} - ${novel.subgenre}`, 105, 70, { align: 'center' })
      pdf.text(`Total Words: ${novel.metadata.totalWords.toLocaleString()}`, 105, 85, { align: 'center' })
      pdf.text(`Generated: ${new Date(novel.metadata.generatedAt).toLocaleDateString()}`, 105, 100, { align: 'center' })
      
      let yPosition = 130
      
      // Add synopsis
      if (novel.synopsis) {
        pdf.addPage()
        yPosition = 20
        pdf.setFontSize(16)
        pdf.text('Synopsis', 105, yPosition, { align: 'center' })
        yPosition += 15
        pdf.setFontSize(11)
        const synopsisLines = pdf.splitTextToSize(novel.synopsis, 170)
        synopsisLines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 6
        })
      }
      
      // Add chapters
      novel.chapters.forEach((chapter, index) => {
        pdf.addPage()
        yPosition = 30
        
        // Chapter title
        pdf.setFontSize(18)
        pdf.text(`Chapter ${chapter.chapterNumber}: ${chapter.title}`, 105, yPosition, { align: 'center' })
        yPosition += 20
        
        // Chapter content
        pdf.setFontSize(11)
        const contentLines = pdf.splitTextToSize(chapter.content, 170)
        contentLines.forEach(line => {
          if (yPosition > 280) {
            pdf.addPage()
            yPosition = 20
          }
          pdf.text(line, 20, yPosition)
          yPosition += 6
        })
      })
      
      const filename = `${novel.title || novel.genre + '_Novel'}_${new Date().toISOString().split('T')[0]}.pdf`
      const pdfBlob = pdf.output('blob')
      saveAs(pdfBlob, filename)
      
      alert(`✅ Novel exported successfully as ${filename}`)
      
    } catch (error) {
      console.error('PDF export error:', error)
      throw new Error(`PDF export failed: ${error.message}`)
    }
  }

  // Export AutoGenerated Novel to HTML
  const exportAutoNovelToHTML = async (novel) => {
    try {
      const htmlContent = generateAutoNovelHTML(novel)
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      const filename = `${novel.title || novel.genre + '_Novel'}_${new Date().toISOString().split('T')[0]}.html`
      
      // Create a temporary link to download the HTML file
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert(`✅ HTML file downloaded successfully as ${filename}!

📝 To import to Google Docs:
1. Open Google Docs (docs.google.com)
2. Click "File" → "Import"
3. Click "Upload" and select the downloaded HTML file
4. The document will open with proper formatting`)
      
    } catch (error) {
      console.error('HTML export error:', error)
      throw new Error(`HTML export failed: ${error.message}`)
    }
  }

  // Generate HTML for AutoGenerated Novel
  const generateAutoNovelHTML = (novel) => {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${novel.title || novel.genre + ' Novel'}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            margin: 1in;
            color: #000;
        }
        .title-page {
            text-align: center;
            page-break-after: always;
            margin-top: 2in;
        }
        .title {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 1in;
        }
        .metadata {
            font-size: 14pt;
            margin-bottom: 0.5in;
        }
        .synopsis {
            page-break-after: always;
            margin-top: 1in;
        }
        .synopsis-title {
            font-size: 18pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 0.5in;
        }
        .chapter {
            page-break-before: always;
        }
        .chapter-title {
            font-size: 16pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 1in;
            margin-top: 1in;
        }
        .chapter-content {
            text-align: justify;
            text-indent: 0.5in;
        }
        .chapter-content p {
            margin-bottom: 0.25in;
        }
        @page {
            margin: 1in;
        }
        @media print {
            .chapter {
                page-break-before: always;
            }
        }
    </style>
</head>
<body>
    <div class="title-page">
        <div class="title">${novel.title || novel.genre + ' Novel'}</div>
        <div class="metadata">Genre: ${novel.genre} - ${novel.subgenre}</div>
        <div class="metadata">Total Words: ${novel.metadata.totalWords.toLocaleString()}</div>
        <div class="metadata">Generated: ${new Date(novel.metadata.generatedAt).toLocaleDateString()}</div>
    </div>
    
    ${novel.synopsis ? `
    <div class="synopsis">
        <div class="synopsis-title">Synopsis</div>
        <div>${novel.synopsis.split('\n\n').map(para => `<p>${para}</p>`).join('')}</div>
    </div>
    ` : ''}
    
    ${novel.chapters.map((chapter, index) => `
    <div class="chapter">
        <div class="chapter-title">Chapter ${chapter.chapterNumber}: ${chapter.title}</div>
        <div class="chapter-content">
            ${chapter.content.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('')}
        </div>
    </div>
    `).join('')}
</body>
</html>`
  }

  // Test AutoGenerate function
  const testAutoGenerate = async () => {
    try {
      console.log('Testing AutoGenerate function...');
      const response = await fetch('/.netlify/functions/autoGenerateNovel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: 'test'
        })
      });

      const data = await response.json();
      console.log('Test response:', data);
      
      if (data.status === 'success') {
        alert('✅ AutoGenerate function is working correctly!');
      } else {
        showDetailedError(
          'Function Test Error',
          'AutoGenerate function responded with error',
          new Error('Function test failed'),
          `Function responded but with error: ${JSON.stringify(data)}`,
          'testAutoGenerateFunction'
        );
      }
    } catch (error) {
      console.error('Test error:', error);
      showDetailedError(
        'Function Test Failed',
        'AutoGenerate function test failed',
        error,
        'Unable to connect to or test the AutoGenerate function. This may indicate a deployment or configuration issue.',
        'testAutoGenerateFunction'
      );
    }
  };

  return (
    <div className="app">
      {renderSidebar()}
      <main className="main-content">
        {renderContent()}
        
        {generatedContent && (
          <div className="generated-content-overlay">
            <div className="generated-content">
              <div className="content-header">
                <h3>Generated Content</h3>
                <div className="content-actions">
                  <button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="btn-copy"
                  >
                    📋 Copy
                  </button>
                  <button 
                    onClick={() => setGeneratedContent('')}
                    className="btn-close"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
              <div className="content-text">
                <pre>{generatedContent}</pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
