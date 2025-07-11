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
        throw new Error(`HTTP ${response.status}: ${errorText}`)
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
      const errorMessage = error.message || 'Unknown error occurred'
      setGeneratedContent(`Error: ${errorMessage}\n\nTroubleshooting:\n- Check if you're using the Netlify live URL (not localhost)\n- Verify OpenAI API key is set in Netlify environment variables\n- Check browser console for detailed error logs`)
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
    setLoading(true)
    
    try {
      console.log(`Generating outline for chapter ${chapterNumber}`)
      
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
          chapterNumber: chapterNumber
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
      alert('Error exporting to DOCX. Please try the PDF or HTML export instead.')
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
      alert('Error exporting to PDF. Please try the HTML export instead.')
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
      alert('Error creating HTML export. Please try again.')
    }
  }

  const generateExportHTML = () => {
    const totalWords = quickGenData.chapters.reduce((total, chapter) => 
      total + chapter.content.split(' ').length, 0)
    
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
        <div>${quickGenData.synopsis.split('\n').map(para => `<p>${para}</p>`).join('')}</div>
    </div>
    ` : ''}
    
    ${quickGenData.chapters.map((chapter, index) => `
    <div class="chapter">
        <div class="chapter-title">${chapter.title}</div>
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
        
        <div className="ai-models-info">
          <h3>🤖 AI Models Used</h3>
          <p>We use different AI models optimized for each task:</p>
          <div className="model-grid">
            <div className="model-card">
              <h4>GPT-4o (GPT-4.1)</h4>
              <p><strong>Chapter Generation</strong> - Advanced "show, don't tell" writing with rich dialogue</p>
            </div>
            <div className="model-card">
              <h4>GPT-4o</h4>
              <p><strong>Synopsis & Outline</strong> - Detailed story structure and planning</p>
            </div>
            <div className="model-card">
              <h4>GPT-3.5 Turbo</h4>
              <p><strong>Characters & World</strong> - Creative elements and scene generation</p>
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
            {loading ? 'Generating... (GPT-3.5 Turbo)' : '✨ Generate Synopsis'}
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
            {loading ? 'Generating... (GPT-3.5 Turbo)' : '✨ Generate Outline'}
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
                {loading ? 'Generating Synopsis & Outline... (GPT-4o)' : 'Next: Generate Outline →'}
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Step 4: Outline Generation (was step 5)
    if (quickGenStep === 5) {
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
          
          <div className="outline-section">
            <div className="outline-controls">
              <button 
                onClick={handleQuickGenOutlineNext}
                className="btn-generate"
                disabled={loading}
              >
                {loading ? 'Generating Chapter... (GPT-4o)' : `Generate Chapter ${quickGenData.outline.length + 1}`}
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
                  {loading ? 'Writing Chapter... (GPT-4o/GPT-4.1)' : `Write Chapter ${quickGenData.chapters.length + 1}`}
                </button>
              )}
              
              {quickGenData.chapters.length === quickGenData.outline.length && quickGenData.chapters.length > 0 && (
                <div className="completion-controls">
                  <button onClick={acceptDraft} className="btn-accept">
                    ✅ Accept Draft
                  </button>
                  <div className="export-controls">
                    <h4>Export Options:</h4>
                    <button onClick={exportToDocx} className="btn-export">
                      📄 Export to .docx
                    </button>
                    <button onClick={exportToPDF} className="btn-export">
                      📕 Export to PDF
                    </button>
                    <button onClick={exportToGoogleDocs} className="btn-export">
                      📝 Export for Google Docs
                    </button>
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
