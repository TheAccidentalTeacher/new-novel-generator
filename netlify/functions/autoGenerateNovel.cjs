// AutoGenerate Novel Function - Background Job System with Status Polling
const { OpenAI } = require('openai');

// In-memory job storage (in production, use a database)
const jobStorage = new Map();

exports.handler = async function(event, context) {
  console.log('=== AutoGenerate Function Start ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Request body:', event.body);
  
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  try {
    console.log('Step 1: Parsing request body...');
    const requestData = JSON.parse(event.body || '{}');
    const { mode, jobId, synopsis, genre, subgenre, wordCount, userPreferences, useBatch } = requestData;
    console.log('Step 2: Request data parsed successfully:', { 
      mode, genre, subgenre, wordCount, useBatch,
      synopsisLength: synopsis?.length 
    });
    
    console.log('Step 3: Checking environment variables...');
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API key exists:', !!apiKey);
    console.log('API key length:', apiKey?.length || 0);
    
    if (!apiKey) {
      console.log('ERROR: API key not found in environment variables');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          error: 'OpenAI API key not found in environment variables'
        })
      };
    }
    
    console.log('Step 4: Initializing OpenAI client...');
    const openai = new OpenAI({ apiKey });
    console.log('Step 5: OpenAI client initialized successfully');

    console.log('Step 6: Setting up helper functions...');
    
    // Job Management System
    const jobManager = {
      createJob(jobId, synopsis, genre, subgenre, wordCount, userPreferences) {
        console.log('Creating job:', jobId);
        const job = {
          jobId,
          status: 'starting',
          progress: 0,
          message: 'Initializing novel generation...',
          synopsis,
          genre,
          subgenre,
          wordCount,
          userPreferences: userPreferences || {},
          startTime: new Date().toISOString(),
          lastUpdate: new Date().toISOString(),
          novel: null,
          error: null
        };
        jobStorage.set(jobId, job);
        console.log('Job created successfully:', jobId);
        return job;
      },

      updateJob(jobId, updates) {
        console.log('Updating job:', jobId, updates);
        const job = jobStorage.get(jobId);
        if (job) {
          Object.assign(job, updates, { lastUpdate: new Date().toISOString() });
          jobStorage.set(jobId, job);
          console.log(`Job ${jobId} updated:`, { status: job.status, progress: job.progress, message: job.message });
        }
        return job;
      },

      getJob(jobId) {
        console.log('Getting job:', jobId);
        return jobStorage.get(jobId);
      },

      deleteJob(jobId) {
        console.log('Deleting job:', jobId);
        return jobStorage.delete(jobId);
      }
    };

    console.log('Step 7: Job manager initialized');

    // Context Management System
    const contextManager = {
      maxTokens: 120000, // GPT-4o limit with safety margin
      
      compressChapter(chapter, level = 'medium') {
        const content = chapter.content || '';
        switch(level) {
          case 'light':
            return content.substring(0, Math.min(content.length, 2000));
          case 'medium':
            return content.substring(0, Math.min(content.length, 1000));
          case 'heavy':
            return content.substring(0, Math.min(content.length, 500));
          default:
            return content;
        }
      },
      
      buildContext(synopsis, outline, chapters, currentChapterNum) {
        let context = `SYNOPSIS:\n${synopsis}\n\n`;
        
        // Add outline
        if (outline && outline.length > 0) {
          context += `OUTLINE:\n`;
          outline.forEach((ch, i) => {
            context += `Chapter ${i + 1}: ${ch.title} - ${ch.summary}\n`;
          });
          context += '\n';
        }
        
        // Add previous chapters with compression
        if (chapters && chapters.length > 0) {
          context += `PREVIOUS CHAPTERS:\n`;
          chapters.forEach((ch, i) => {
            const chapterNum = i + 1;
            const distance = currentChapterNum - chapterNum;
            
            let compressionLevel = 'none';
            if (distance > 5) compressionLevel = 'heavy';
            else if (distance > 2) compressionLevel = 'medium';
            else if (distance > 0) compressionLevel = 'light';
            
            const content = compressionLevel === 'none' ? 
              ch.content : this.compressChapter(ch, compressionLevel);
              
            context += `=== Chapter ${chapterNum}: ${ch.title} ===\n${content}\n\n`;
          });
        }
        
        return context;
      }
    };

    // Retry mechanism with exponential backoff
    const makeOpenAIRequest = async (params, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const completion = await openai.chat.completions.create(params);
          return completion;
        } catch (error) {
          console.log(`Attempt ${i + 1} failed:`, error.message);
          
          if (error.status === 429) { // Rate limit error
            const waitTime = Math.min(1000 * Math.pow(2, i), 30000);
            console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          
          if (i === retries - 1) throw error;
        }
      }
    };

    // Generate unique job ID
    function generateJobId() {
      return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Estimate generation time based on word count
    function getEstimatedTime(wordCount) {
      const wordsPerMinute = 500; // Conservative estimate for AI generation
      return Math.ceil(parseInt(wordCount) / wordsPerMinute);
    }

    // Get default chapter count based on word count
    function getDefaultChapterCount(wordCount) {
      const words = parseInt(wordCount);
      if (words <= 20000) return 8;
      if (words <= 50000) return 15;
      if (words <= 80000) return 20;
      return 25;
    }

    // Get default words per chapter
    function getDefaultWordsPerChapter(wordCount) {
      const words = parseInt(wordCount);
      const chapters = getDefaultChapterCount(wordCount);
      return Math.ceil(words / chapters);
    }

    console.log('Step 8: Processing mode:', mode);
    
    // Handle different modes
    switch(mode) {
      case 'test':
        console.log('Step 9: Test mode - returning success');
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'success',
            message: 'AutoGenerate function is working',
            timestamp: new Date().toISOString(),
            debugInfo: {
              apiKeyLength: apiKey.length,
              mode: mode,
              step: 'test-complete'
            }
          })
        };
        
      case 'start':
        console.log('Step 9: Start mode - calling startAutoGeneration');
        return await startAutoGeneration(synopsis, genre, subgenre, wordCount, userPreferences, useBatch);
      
      case 'status':
        console.log('Step 9: Status mode - calling getJobStatus');
        return await getJobStatus(jobId);
      
      case 'cancel':
        console.log('Step 9: Cancel mode - calling cancelJob');
        return await cancelJob(jobId);
      
      default:
        console.log('Step 9: Invalid mode specified:', mode);
        throw new Error(`Invalid mode specified: ${mode}`);
    }

    // Start Auto Generation - Returns immediately with job ID
    async function startAutoGeneration(synopsis, genre, subgenre, wordCount, prefs = {}, useBatch = false) {
      const jobId = generateJobId();
      console.log(`Starting new AutoGenerate job: ${jobId} (batch: ${useBatch})`);
      
      // Create job in storage
      const job = jobManager.createJob(jobId, synopsis, genre, subgenre, wordCount, { ...prefs, useBatch });
      
      // Start background processing (non-blocking)
      processNovelGeneration(jobId, useBatch).catch(error => {
        console.error(`Background job ${jobId} failed:`, error);
        jobManager.updateJob(jobId, {
          status: 'error',
          progress: 0,
          message: 'Generation failed',
          error: error.message
        });
      });
      
      // Return immediately with job info
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId,
          status: 'started',
          message: 'Novel generation started in background',
          estimatedTimeMinutes: getEstimatedTime(wordCount),
          pollUrl: `/.netlify/functions/autoGenerateNovel?mode=status&jobId=${jobId}`
        })
      };
    }

    // Get job status
    async function getJobStatus(jobId) {
      if (!jobId) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job ID is required'
          })
        };
      }

      const job = jobManager.getJob(jobId);
      if (!job) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job not found'
          })
        };
      }

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          jobId: job.jobId,
          status: job.status,
          progress: job.progress,
          message: job.message,
          lastUpdate: job.lastUpdate,
          startTime: job.startTime,
          novel: job.novel,
          error: job.error
        })
      };
    }

    // Cancel a job
    async function cancelJob(jobId) {
      if (!jobId) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job ID is required'
          })
        };
      }

      const job = jobManager.getJob(jobId);
      if (!job) {
        return {
          statusCode: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          },
          body: JSON.stringify({
            status: 'error',
            error: 'Job not found'
          })
        };
      }

      // Mark job as cancelled
      jobManager.updateJob(jobId, {
        status: 'cancelled',
        message: 'Job cancelled by user'
      });

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          status: 'cancelled',
          message: 'Job cancelled successfully'
        })
      };
    }

    // Background processing function
    async function processNovelGeneration(jobId) {
      const job = jobManager.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      const { synopsis, genre, subgenre, wordCount, userPreferences } = job;
      
      try {
        // Step 1: Analyze synopsis and determine chapter count
        jobManager.updateJob(jobId, {
          status: 'analyzing',
          progress: 5,
          message: 'Analyzing synopsis and planning novel structure'
        });

        const analysisPrompt = `Analyze this ${wordCount} word ${genre} synopsis and determine the optimal chapter structure:

SYNOPSIS:
${synopsis}

Provide a JSON response with:
{
  "recommendedChapterCount": number,
  "storyStructure": "three-act" | "hero-journey" | "custom",
  "estimatedWordsPerChapter": number,
  "keyStoryBeats": ["beat1", "beat2", "..."],
  "pacing": "fast" | "medium" | "slow"
}`;

        const analysisResponse = await makeOpenAIRequest({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 800,
          temperature: 0.3
        });

        let analysis;
        try {
          analysis = JSON.parse(analysisResponse.choices[0].message.content);
        } catch (e) {
          console.log('Analysis JSON parsing failed, using defaults');
          analysis = {
            recommendedChapterCount: getDefaultChapterCount(wordCount),
            estimatedWordsPerChapter: getDefaultWordsPerChapter(wordCount),
            storyStructure: "three-act",
            keyStoryBeats: ["Opening", "Inciting Incident", "Rising Action", "Climax", "Resolution"],
            pacing: "medium"
          };
        }

        jobManager.updateJob(jobId, {
          status: 'outlining',
          progress: 15,
          message: `Planning ${analysis.recommendedChapterCount} chapters`
        });

        // Step 2: Generate complete outline
        const outline = await generateCompleteOutline(jobId, synopsis, genre, subgenre, analysis);
        
        jobManager.updateJob(jobId, {
          status: 'writing',
          progress: 30,
          message: `Generated outline for ${outline.length} chapters. Starting chapter generation...`,
          currentPhase: 'writing',
          chaptersOutlined: outline.length,
          chaptersWritten: 0,
          estimatedChapters: outline.length
        });

        // Step 3: Generate all chapters
        const chapters = await generateAllChapters(jobId, synopsis, genre, subgenre, outline, analysis);

        // Complete the job
        const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
        
        jobManager.updateJob(jobId, {
          status: 'complete',
          progress: 100,
          message: 'Novel generation complete!',
          novel: {
            synopsis,
            genre,
            subgenre,
            wordCount,
            outline,
            chapters,
            metadata: {
              totalWords,
              chapterCount: chapters.length,
              generatedAt: new Date().toISOString(),
              estimatedReadingTime: Math.ceil(totalWords / 250) // words per minute
            }
          }
        });

        console.log(`Job ${jobId} completed successfully. Generated ${totalWords} words in ${chapters.length} chapters.`);

      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
        jobManager.updateJob(jobId, {
          status: 'error',
          progress: 0,
          message: 'Generation failed',
          error: error.message
        });
        throw error;
      }
    }

    // Generate complete outline
    async function generateCompleteOutline(jobId, synopsis, genre, subgenre, analysis) {
      const outlinePrompt = `Create a detailed ${analysis.recommendedChapterCount}-chapter outline for a ${wordCount} word ${genre} novel:

SYNOPSIS:
${synopsis}

REQUIREMENTS:
- Generate exactly ${analysis.recommendedChapterCount} chapters
- Each chapter should be approximately ${analysis.estimatedWordsPerChapter} words
- Follow ${analysis.storyStructure} structure
- Include these story beats: ${analysis.keyStoryBeats.join(', ')}
- Maintain ${analysis.pacing} pacing

Provide a JSON response with an array of chapters:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "summary": "Detailed summary of what happens in this chapter",
      "keyEvents": ["event1", "event2", "event3"],
      "characters": ["main characters in this chapter"],
      "setting": "Where this chapter takes place",
      "purpose": "What this chapter accomplishes for the story",
      "estimatedWords": ${analysis.estimatedWordsPerChapter}
    }
  ]
}`;

      const response = await makeOpenAIRequest({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: outlinePrompt }],
        max_tokens: 4000,
        temperature: 0.7
      });

      let outline;
      try {
        const result = JSON.parse(response.choices[0].message.content);
        outline = result.chapters || [];
      } catch (e) {
        console.log('Outline JSON parsing failed, generating fallback');
        // Generate a simple fallback outline
        outline = [];
        for (let i = 1; i <= analysis.recommendedChapterCount; i++) {
          outline.push({
            chapterNumber: i,
            title: `Chapter ${i}`,
            summary: `Chapter ${i} of the novel`,
            keyEvents: ["Plot development"],
            characters: ["Main characters"],
            setting: "Novel setting",
            purpose: "Advance the story",
            estimatedWords: analysis.estimatedWordsPerChapter
          });
        }
      }

      return outline;
    }

    // Anti-AI Enhancement System - Makes Generated Fiction Feel Human-Written
    const antiAISystem = {
      // 1. Descriptive Pattern Diversity
      sensoryBank: {
        sky: ['azure canopy', 'weathered pewter dome', 'endless cobalt stretch', 'mottled gray expanse', 'pearl-white vastness', 'storm-bruised ceiling', 'amber-tinged backdrop', 'velvet darkness above'],
        ground: ['weathered stone path', 'soft earth beneath', 'cracked pavement', 'mossy forest floor', 'sandy trail', 'muddy track', 'gravel underfoot', 'wooden planks'],
        interior: ['dim corners', 'filtered light', 'warm shadows', 'cluttered space', 'bare walls', 'cozy nook', 'spacious room', 'cramped quarters'],
        sounds: ['distant murmur', 'sharp crack', 'gentle rustle', 'muffled voices', 'echoing footsteps', 'soft whisper', 'sudden silence', 'rhythmic tapping'],
        smells: ['earthy scent', 'sharp tang', 'sweet fragrance', 'musty odor', 'clean air', 'acrid smoke', 'floral notes', 'metallic taste'],
        textures: ['rough surface', 'smooth touch', 'coarse fabric', 'silky feel', 'grainy texture', 'polished wood', 'cold metal', 'warm skin']
      },

      usedDescriptions: new Map(), // Track recently used descriptions
      
      getSensoryDescription(type, chapterNumber) {
        const bank = this.sensoryBank[type] || [];
        const used = this.usedDescriptions.get(type) || new Set();
        
        // Get unused descriptions
        const available = bank.filter(desc => !used.has(desc));
        
        if (available.length === 0) {
          // Reset if all used
          used.clear();
          this.usedDescriptions.set(type, used);
          return bank[Math.floor(Math.random() * bank.length)];
        }
        
        const selected = available[Math.floor(Math.random() * available.length)];
        used.add(selected);
        this.usedDescriptions.set(type, used);
        
        return selected;
      },

      // 2. Character-Specific Speech Patterns
      characterVoices: {
        default: {
          sentenceLength: 'mixed',
          vocabulary: ['said', 'replied', 'asked', 'whispered', 'called'],
          patterns: ['direct statement', 'question first', 'trailing thought']
        }
      },

      getCharacterVoice(characterName, chapters) {
        // Analyze existing dialogue patterns for this character
        const existingDialogue = this.analyzeCharacterDialogue(characterName, chapters);
        
        // Create unique patterns based on character background
        return {
          sentenceLength: existingDialogue.avgLength > 15 ? 'longer' : 'shorter',
          vocabulary: this.generateUniqueVocab(characterName),
          patterns: this.generateSpeechPatterns(characterName)
        };
      },

      analyzeCharacterDialogue(characterName, chapters) {
        // Simplified analysis - in real implementation would parse actual dialogue
        return {
          avgLength: Math.random() * 20 + 10,
          commonWords: ['well', 'maybe', 'sure'],
          topics: ['work', 'family', 'dreams']
        };
      },

      generateUniqueVocab(characterName) {
        const vocabSets = {
          outdoor: ['trail', 'vista', 'wilderness', 'summit', 'canyon'],
          urban: ['block', 'avenue', 'downtown', 'subway', 'corner'],
          rural: ['pasture', 'barn', 'creek', 'meadow', 'fence'],
          professional: ['project', 'deadline', 'meeting', 'client', 'proposal']
        };
        
        // Return random set - in real implementation would be character-specific
        const keys = Object.keys(vocabSets);
        return vocabSets[keys[Math.floor(Math.random() * keys.length)]];
      },

      generateSpeechPatterns(characterName) {
        const patterns = [
          'question_first', 'statement_pause', 'observation_question', 
          'humor_deflection', 'direct_approach', 'indirect_suggestion'
        ];
        return patterns.slice(0, 3); // Return 3 random patterns
      },

      // 3. Chapter Structure Variation
      chapterOpenings: [
        'action_start', 'dialogue_open', 'description_scene', 'flashback_moment',
        'question_hook', 'conflict_immediate', 'character_thought', 'time_jump',
        'setting_focus', 'emotion_state', 'mystery_element', 'relationship_tension'
      ],

      chapterEndings: [
        'cliffhanger', 'revelation', 'humor', 'emotional_beat', 'action_pause',
        'question_posed', 'decision_made', 'conflict_escalation', 'quiet_moment',
        'foreshadowing', 'character_growth', 'plot_advancement'
      ],

      usedOpenings: new Set(),
      usedEndings: new Set(),

      getChapterStructure(chapterNumber, totalChapters) {
        // Get unused opening
        const availableOpenings = this.chapterOpenings.filter(o => !this.usedOpenings.has(o));
        if (availableOpenings.length === 0) this.usedOpenings.clear();
        
        const opening = availableOpenings.length > 0 
          ? availableOpenings[Math.floor(Math.random() * availableOpenings.length)]
          : this.chapterOpenings[Math.floor(Math.random() * this.chapterOpenings.length)];
        
        this.usedOpenings.add(opening);

        // Get unused ending
        const availableEndings = this.chapterEndings.filter(e => !this.usedEndings.has(e));
        if (availableEndings.length === 0) this.usedEndings.clear();
        
        const ending = availableEndings.length > 0
          ? availableEndings[Math.floor(Math.random() * availableEndings.length)]
          : this.chapterEndings[Math.floor(Math.random() * this.chapterEndings.length)];
        
        this.usedEndings.add(ending);

        return { opening, ending };
      },

      // 4. Narrative Control Elements
      surpriseElements: [
        'unexpected_character_action', 'hidden_information_revealed', 'environment_change',
        'relationship_shift', 'plot_twist_minor', 'character_backstory', 'setting_discovery',
        'dialogue_subtext', 'internal_conflict', 'external_obstacle'
      ],

      getRandomSurprise() {
        return this.surpriseElements[Math.floor(Math.random() * this.surpriseElements.length)];
      },

      // 5. Style Variation Controls
      getStyleVariation(chapterNumber, sceneType) {
        const styles = {
          action: { pace: 'fast', sentences: 'short', paragraphs: 'brief' },
          reflection: { pace: 'slow', sentences: 'long', paragraphs: 'flowing' },
          dialogue: { pace: 'natural', sentences: 'mixed', paragraphs: 'tight' },
          description: { pace: 'measured', sentences: 'varied', paragraphs: 'rich' }
        };
        
        return styles[sceneType] || styles.dialogue;
      },

      // Generate comprehensive writing instructions
      generateWritingInstructions(chapterNumber, chapterData, previousChapters) {
        const structure = this.getChapterStructure(chapterNumber, 25);
        const surprise = this.getRandomSurprise();
        const style = this.getStyleVariation(chapterNumber, 'mixed');
        
        return {
          opening: structure.opening,
          ending: structure.ending,
          surpriseElement: surprise,
          styleGuide: style,
          sensoryFocus: this.getSensoryDescription('sky', chapterNumber),
          avoidRepetition: this.getRecentUsage(previousChapters),
          characterVoices: this.getActiveCharacterVoices(chapterData.characters)
        };
      },

      getRecentUsage(chapters) {
        // Track recent phrases, metaphors, and patterns to avoid
        const recent = [];
        const lastThree = chapters.slice(-3);
        
        // In real implementation, would parse for specific patterns
        return {
          phrases: ['morning light', 'gentle breeze', 'deep breath'],
          metaphors: ['like a bird', 'ocean of'],
          openings: ['The sun', 'Sarah looked'],
          transitions: ['Meanwhile', 'Later that day']
        };
      },

      getActiveCharacterVoices(characterNames) {
        return characterNames.map(name => ({
          name,
          voice: this.generateUniqueVocab(name),
          patterns: this.generateSpeechPatterns(name)
        }));
      }
    };

    // Generate all chapters
    async function generateAllChapters(jobId, synopsis, genre, subgenre, outline, analysis) {
      const chapters = [];
      const totalChapters = outline.length;

      for (let i = 0; i < totalChapters; i++) {
        const chapterData = outline[i];
        const chapterNumber = i + 1;
        
        // Update progress with detailed logging
        const progressPercent = 30 + Math.floor((i / totalChapters) * 65); // 30-95%
        enhancedLog('info', `Starting chapter ${chapterNumber}`, {
          jobId,
          chapterNumber,
          totalChapters,
          progress: progressPercent,
          title: chapterData.title
        });
        
        jobManager.updateJob(jobId, {
          status: 'writing',
          progress: progressPercent,
          message: `Writing Chapter ${chapterNumber}: ${chapterData.title}`,
          currentPhase: 'writing',
          currentChapter: chapterNumber,
          currentChapterTitle: chapterData.title,
          chaptersOutlined: totalChapters,
          chaptersWritten: i,
          estimatedChapters: totalChapters,
          estimatedWordsWritten: chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
        });

        // Check if job was cancelled
        const currentJob = jobManager.getJob(jobId);
        if (currentJob && currentJob.status === 'cancelled') {
          enhancedLog('warn', 'Job cancelled by user', { jobId, chapterNumber });
          throw new Error('Job was cancelled by user');
        }

        try {
          // Get anti-AI enhancement instructions
          const enhancements = antiAISystem.generateWritingInstructions(chapterNumber, chapterData, chapters);

          const context = contextManager.buildContext(synopsis, outline, chapters, chapterNumber);

          const systemPrompt = `You are a professional novelist writing a ${genre} novel. You must follow these ANTI-AI GUIDELINES to create human-feeling fiction:

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. OPENING STYLE: Use "${enhancements.opening}" approach (vary from previous chapters)
2. ENDING STYLE: Use "${enhancements.ending}" approach (avoid repetitive closings)
3. SURPRISE ELEMENT: Include "${enhancements.surpriseElement}" somewhere in this chapter
4. STYLE VARIATION: ${JSON.stringify(enhancements.styleGuide)}

AVOID THESE RECENT PATTERNS:
- Don't reuse these phrases: ${enhancements.avoidRepetition.phrases.join(', ')}
- Don't reuse these metaphors: ${enhancements.avoidRepetition.metaphors.join(', ')}
- Don't start like previous chapters: ${enhancements.avoidRepetition.openings.join(', ')}
- Don't use these transitions: ${enhancements.avoidRepetition.transitions.join(', ')}

CHARACTER VOICES (make each distinct):
${enhancements.characterVoices.map(cv => `- ${cv.name}: Use words like ${cv.voice.join(', ')} and patterns: ${cv.patterns.join(', ')}`).join('\n')}

WRITING STANDARDS:
- Craft immersive, emotionally authentic scenes that feel human-written
- VARY sentence structure, rhythm, and tone constantly - never fall into patterns
- Develop character arcs with meaningful change and internal tension
- Use sensory details sparingly but effectively - focus on: ${enhancements.sensoryFocus}
- Show themes through action and choice, never through exposition
- Create unique dialogue for each character with distinct speech patterns
- Build genuine conflict that escalates naturally, avoid quick resolutions
- Break narrative patterns with unexpected sentence structures or emotional beats
- Avoid formulaic descriptions, repetitive phrasing, and mechanical transitions`;

          const userPrompt = `Write Chapter ${chapterNumber} following the ANTI-AI GUIDELINES above.

CONTEXT:
${context}

CHAPTER PLAN:
Title: ${chapterData.title}
Summary: ${chapterData.summary}
Key Events: ${chapterData.keyEvents.join(', ')}
Characters: ${chapterData.characters.join(', ')}
Setting: ${chapterData.setting}
Purpose: ${chapterData.purpose}
Target Words: ${chapterData.estimatedWords}

SPECIFIC REQUIREMENTS FOR THIS CHAPTER:
- OPENING: Start with "${enhancements.opening}" technique - NOT like previous chapters
- SURPRISE: Naturally incorporate "${enhancements.surpriseElement}" within the narrative
- PACING: ${enhancements.styleGuide.pace} pace with ${enhancements.styleGuide.sentences} sentences
- SENSORY FOCUS: When describing environment, emphasize: ${enhancements.sensoryFocus}
- DIALOGUE: Make each character's voice distinct using their unique vocabulary and patterns
- ENDING: Close with "${enhancements.ending}" approach - completely different from previous chapters
- VARIATION: If previous chapters used similar structures, deliberately break the pattern

CRITICAL: Review your writing and ensure:
1. No repeated phrases from previous chapters
2. Each character sounds different when speaking
3. Opening and ending are unique to this chapter
4. The surprise element feels natural, not forced
5. Sentence structures vary throughout
6. Environmental descriptions feel fresh and specific

Write the full chapter content without chapter numbers or titles.`;

          enhancedLog('info', 'Making OpenAI request for chapter with anti-AI enhancements', {
            jobId,
            chapterNumber,
            model: 'gpt-4o',
            maxTokens: Math.min(20000, Math.ceil(analysis.estimatedWordsPerChapter * 1.5))
          });

          const response = await makeOpenAIRequest({
            model: 'gpt-4o', // Use premium model for chapter generation
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: Math.min(20000, Math.ceil(analysis.estimatedWordsPerChapter * 1.5)),
            temperature: 0.85
          });

          const chapterContent = response.choices[0].message.content;
          const wordCount = chapterContent.split(/\s+/).length;

          const chapter = {
            chapterNumber,
            title: chapterData.title,
            content: chapterContent,
            wordCount,
            summary: chapterData.summary,
            generatedAt: new Date().toISOString()
          };

          chapters.push(chapter);
          
          // Update progress after each chapter is completed
          const updatedProgressPercent = 30 + Math.floor(((i + 1) / totalChapters) * 65);
          const totalWordsWritten = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
          
          jobManager.updateJob(jobId, {
            status: 'writing',
            progress: updatedProgressPercent,
            message: `Completed Chapter ${chapterNumber}: ${chapterData.title}`,
            currentPhase: 'writing',
            currentChapter: chapterNumber + 1 <= totalChapters ? chapterNumber + 1 : chapterNumber,
            currentChapterTitle: chapterNumber + 1 <= totalChapters ? outline[chapterNumber]?.title : 'Finishing up...',
            chaptersOutlined: totalChapters,
            chaptersWritten: i + 1,
            estimatedChapters: totalChapters,
            estimatedWordsWritten: totalWordsWritten
          });
          
          enhancedLog('info', `Chapter ${chapterNumber} generated successfully`, {
            jobId,
            chapterNumber,
            wordCount,
            progress: updatedProgressPercent,
            totalWordsWritten
          });
          
        } catch (chapterError) {
          enhancedLog('error', `Chapter ${chapterNumber} generation failed`, {
            jobId,
            chapterNumber,
            error: chapterError.message,
            progress: progressPercent,
            stack: chapterError.stack
          });
          
          // Update job with specific error information
          jobManager.updateJob(jobId, {
            status: 'error',
            progress: progressPercent,
            message: `Failed at Chapter ${chapterNumber}: ${chapterError.message}`,
            error: `Chapter generation failed at ${progressPercent}% (Chapter ${chapterNumber}): ${chapterError.message}`
          });
          
          throw chapterError; // Re-throw to stop the entire process
        }
      }

      return chapters;
    }

  } catch (mainErr) {
    console.error('=== AutoGenerate Error ===');
    console.error('Error type:', mainErr.constructor.name);
    console.error('Error message:', mainErr.message);
    console.error('Error stack:', mainErr.stack);
    console.error('Error occurred at step: Checking error location...');
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: `AutoGenerate failed: ${mainErr.message}`,
        errorType: mainErr.constructor.name,
        details: mainErr.toString(),
        stack: mainErr.stack,
        timestamp: new Date().toISOString()
      })
    };
  }

  // Enhanced logging function
  function enhancedLog(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, JSON.stringify(data));
  }
};
